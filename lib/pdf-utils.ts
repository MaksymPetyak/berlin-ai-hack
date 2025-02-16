import PSPDFKit from 'pspdfkit';

interface FormField {
    id: string;
    name: string;
    value: string;
    pageIndex: number;
    type: string;
}

async function convertUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            // Remove the data URL prefix (e.g., "data:image/png;base64,")
            const base64 = base64String.split(',')[1];
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

export async function convertPagesToImages(instance: any): Promise<string[]> {
    const base64Images: string[] = [];

    for (let i = 0; i < instance.totalPageCount; i++) {
        // Get page width for proper rendering
        const { width } = instance.pageInfoForIndex(i);

        // Render page as image URL with consistent parameters
        const imageUrl = await instance.renderPageAsImageURL(
            {
                width,
                imageType: 'image/png'
            },
            i
        );

        const base64Image = await convertUrlToBase64(imageUrl);
        base64Images.push(base64Image);
    }

    console.log("Got base64 images");
    return base64Images;
}

export async function getAsImages(
    instance: any
): Promise<{ data: Uint8Array; type: string }[]> {
    const images: { data: Uint8Array; type: string }[] = [];

    for (let i = 0; i < instance.totalPageCount; i++) {
        // Get page dimensions
        const { width } = instance.pageInfoForIndex(i);

        // Render page as image blob with consistent parameters
        const imageBlob = await instance.renderPageAsImageBlob(
            {
                width,
                imageType: 'image/png'
            },
            i
        );

        // Convert blob to array buffer
        const arrayBuffer = await imageBlob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        images.push({
            data: uint8Array,
            type: 'image/png'
        });
    }

    return images;
}

export async function getFormFields(instance: any): Promise<FormField[]> {
    // Retrieve all form fields
    const formFields = await instance.getFormFields();

    // Map the form fields to our interface and set values
    return formFields.map((field: any) => ({
        id: field.name,  // or field.id depending on what you want to use as identifier
        name: field.name,
        value: field.value || '',  // get existing value or empty string
        pageIndex: field.pageIndex,
        type: field.type
    }));
}

export async function setFormFieldValues(instance: any, fields: FormField[]): Promise<void> {
    for (const field of fields) {
        console.log('Setting field:', {
            name: field.name,
            value: field.value,
            type: field.type,
            pageIndex: field.pageIndex
        });
        await instance.setFormFieldValue(field.name, field.value);
    }
}


interface MarkedField {
    field_id: string;
    name: string;
    marked_value: string;
}

export async function markFormFields(instance: any): Promise<MarkedField[]> {
    console.log('Starting to mark form fields...');
    const markedFields: MarkedField[] = [];

    try {
        // Get all form fields
        const formFields = await instance.getFormFields();

        // Process each form field
        let fieldNumber = 1;
        for (const field of formFields) {
            try {
                // Generate sequential ID
                const uniqueId = `idx_${fieldNumber}`;

                // Log field details
                console.log('Processing field:', {
                    name: field.name,
                    type: field.type,
                    currentValue: field.value,
                    newId: uniqueId
                });

                // Create an object for this single field
                const singleFieldUpdate: { [key: string]: any } = {};

                // Handle different field types
                if (field.type === 'checkbox' || field.type === 'CheckBoxFormField') {
                    singleFieldUpdate[field.name] = ['Yes'];
                } else if (field.type === 'radio' || field.type === 'RadioButtonFormField') {
                    console.log(`Skipping radio button field: ${field.name}`);
                    continue;
                } else {
                    singleFieldUpdate[field.name] = uniqueId;
                    // Add to our marked fields list
                    markedFields.push({
                        field_id: uniqueId,
                        name: field.name,
                        marked_value: uniqueId
                    });
                }

                // Update just this field
                await instance.setFormFieldValues(singleFieldUpdate);
                console.log(`Updated field: ${field.name} with ID: ${uniqueId}`);

                // Increment counter for next field
                fieldNumber++;
            } catch (error) {
                console.error(`Error processing field ${field.name}:`, error);
                // Continue with next field
                continue;
            }
        }

        console.log('Completed marking form fields');
        return markedFields;
    } catch (error) {
        console.error('Error in markFormFields:', error);
        return [];
    }
}


export async function modifySpecificField(instance: any, fieldId: string, fieldName: string): Promise<void> {
    try {
        // Get all form fields
        const formFields = await instance.getFormFields();

        // Find the specific field
        const formField = formFields.find(
            (field: any) => field.name === fieldName
        );

        if (!formField) {
            console.log(`No field found with name ${fieldName}`);
            return;
        }

        // Create an object with just this field's new value
        const updatedFormFieldValues: { [key: string]: string } = {
            [fieldName]: "test test"
        };

        // Update the field using setFormFieldValues
        await instance.setFormFieldValues(updatedFormFieldValues);

        console.log(`Updated field ${fieldName} with new value`);

        // Save changes
        await instance.save();

    } catch (error) {
        console.error('Error modifying field:', error);
    }
}

export async function fillAnalyzedFields(instance: any, analyzedFields: { field_id: string; value: string }[]): Promise<void> {
    try {
        // Get all form fields
        const formFields = await instance.getFormFields();

        // Create an object to store the updates
        const updatedFormFieldValues: { [key: string]: string } = {};

        // Go through each form field
        formFields.forEach((field: any) => {
            // Check if the current value is a number (our ID)
            const currentValue = field.value?.toString() || '';

            // Find if we have an analyzed value for this ID
            const analyzedField = analyzedFields.find(af => af.field_id === currentValue);
            if (analyzedField && analyzedField.value !== '') {
                updatedFormFieldValues[field.name] = analyzedField.value;
                console.log(`Updating field ${field.name} with value ${analyzedField.value}`);
            }
        });

        // Apply all updates at once
        if (Object.keys(updatedFormFieldValues).length > 0) {
            await instance.setFormFieldValues(updatedFormFieldValues);
            console.log('Updated form fields with analyzed values');
        }

    } catch (error) {
        console.error('Error filling analyzed fields:', error);
        throw error;
    }
}

export async function highlightFormField(instance: any, fieldId: string): Promise<void> {
    try {
        const formFields = await instance.getFormFields();
        console.log('All form fields:', formFields.map((f: any) => ({ name: f.name, value: f.value })));

        // First get all form fields to find the one with matching name
        const formField = formFields.find(
            (field: any) => field.name === fieldId
        );

        if (!formField) {
            console.log(`No field found with name ${fieldId}. Available fields:`,
                formFields.map((f: any) => f.name));
            return;
        }

        // Get total page count
        const totalPages = instance.totalPageCount;
        let widget = null;

        // Search through all pages for the widget
        for (let i = 0; i < totalPages; i++) {
            const annotations = await instance.getAnnotations(i);
            widget = annotations.find(
                (annotation: any) => annotation.formFieldName === formField.name
            );
            if (widget) break;
        }

        if (widget) {
            // Create a red color using PSPDFKit.Color (values between 0 and 1)
            // @ts-ignore
            const redColor = new PSPDFKit.Color({ r: 1, g: 0, b: 0 });

            // Chain the set operations to create a new widget
            const updatedWidget = widget
                .set('borderColor', redColor)
                .set('borderWidth', 2)
                .set('borderStyle', 'solid');

            await instance.update([updatedWidget]);
            console.log(`Successfully highlighted field ${formField.name}`);
        } else {
            console.log(`No widget found for field ${formField.name}`);
        }
    } catch (error) {
        console.error('Error highlighting form field:', error);
    }
}

export async function resetFormFieldHighlight(instance: any, fieldId: string): Promise<void> {
    try {
        const formFields = await instance.getFormFields();
        console.log('All form fields:', formFields.map((f: any) => ({ name: f.name, value: f.value })));

        const formField = formFields.find(
            (field: any) => field.name === fieldId
        );

        if (!formField) {
            console.log(`No field found with name ${fieldId}. Available fields:`,
                formFields.map((f: any) => f.name));
            return;
        }

        // Get total page count
        const totalPages = instance.totalPageCount;
        let widget = null;

        // Search through all pages for the widget
        for (let i = 0; i < totalPages; i++) {
            const annotations = await instance.getAnnotations(i);
            widget = annotations.find(
                (annotation: any) => annotation.formFieldName === formField.name
            );
            if (widget) break;
        }

        if (widget) {
            // Create a black color using PSPDFKit.Color (values between 0 and 1)
            // @ts-ignore
            const blackColor = new PSPDFKit.Color({ r: 0, g: 0, b: 0 });

            // Chain the set operations to create a new widget
            const updatedWidget = widget
                .set('borderColor', blackColor)
                .set('borderWidth', 1)
                .set('borderStyle', 'solid');

            await instance.update([updatedWidget]);
            console.log(`Successfully reset highlight for field ${formField.name}`);
        } else {
            console.log(`No widget found for field ${formField.name}`);
        }
    } catch (error) {
        console.error('Error resetting form field highlight:', error);
    }
}

export async function unmarkFormFields(instance: any): Promise<void> {
    try {
        console.log('Starting to unmark form fields...');

        // Get all form fields
        const formFields = await instance.getFormFields();

        // Create an object to store all the updates
        const updates: { [key: string]: string } = {};

        // Go through each form field
        formFields.forEach((field: any) => {
            const currentValue = field.value?.toString() || '';

            // Check if the current value matches our idx_ pattern
            if (currentValue.match(/^idx_\d+$/)) {
                console.log(`Unmarking field: ${field.name} (current value: ${currentValue})`);
                updates[field.name] = '';
            }
        });

        // Apply all updates at once if there are any
        if (Object.keys(updates).length > 0) {
            await instance.setFormFieldValues(updates);
            console.log(`Successfully unmarked ${Object.keys(updates).length} fields`);
        } else {
            console.log('No marked fields found to unmark');
        }

    } catch (error) {
        console.error('Error unmarking form fields:', error);
    }
}