import type PSPDFKit from 'pspdfkit';

interface FormField {
    id: string;
    name: string;
    value: string;
    pageIndex: number;
    type: string;
}

export async function convertPagesToImages(instance: any): Promise<string[]> {
    const imageUrls: string[] = [];

    for (let i = 0; i < instance.totalPageCount; i++) {
        // Get page width for proper rendering
        const { width } = instance.pageInfoForIndex(i);

        // Render page as image
        const imageUrl = await instance.renderPageAsImageURL(
            { width },
            i
        );

        imageUrls.push(imageUrl);
    }

    return imageUrls;
}

export async function getAsImages(
    instance: any
): Promise<{ data: Uint8Array; type: string }[]> {
    const images: { data: Uint8Array; type: string }[] = [];

    for (let i = 0; i < instance.totalPageCount; i++) {
        // Get page dimensions
        const { width } = instance.pageInfoForIndex(i);

        // Render page as image blob
        const imageBlob = await instance.renderPageAsImageBlob({
            width,
            imageType: 'image/png'
        }, i);

        // Convert blob to array buffer
        const arrayBuffer = await imageBlob.arrayBuffer();

        // Convert to Uint8Array
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

export async function markFormFields(instance: any): Promise<void> {
    console.log('Starting to mark form fields...');

    try {
        // Get all form fields
        const formFields = await instance.getFormFields();

        // Process each form field
        let fieldNumber = 1;
        for (const field of formFields) {
            try {
                // Generate sequential ID
                const uniqueId = `${fieldNumber}`;

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
    } catch (error) {
        console.error('Error in markFormFields:', error);
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

        // Log everything about the form field for debugging
        console.log('Form Field Details:', {
            name: formField.name,
            id: formField.id,
            type: formField.type,
            value: formField.value,
            defaultValue: formField.defaultValue,
            label: formField.label,
            pageIndex: formField.pageIndex,
            required: formField.required,
            readOnly: formField.readOnly,
            customData: formField.customData,
            options: formField.options,
            widgets: formField.widgets,
        });

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

export async function fillFormFieldsRandomly(instance: any): Promise<void> {
    try {
        // Get all form fields
        const formFields = await instance.getFormFields();

        // Create an object to store field values
        const updatedFormFieldValues: { [key: string]: string } = {};

        // Process each form field
        let count = 0;
        formFields.forEach((formField: any) => {
            if (count < 5) {
                // Generate a random value (for demo purposes)
                const randomValue = `Value_${Math.floor(Math.random() * 1000)}`;

                // Add to our update object
                updatedFormFieldValues[formField.name] = randomValue;

                console.log(`Setting ${formField.name} to ${randomValue}`);
                count++;
            }
        });

        // Update all fields at once
        await instance.setFormFieldValues(updatedFormFieldValues);

        console.log('Updated all form fields with random values');
    } catch (error) {
        console.error('Error filling form fields:', error);
    }
} 