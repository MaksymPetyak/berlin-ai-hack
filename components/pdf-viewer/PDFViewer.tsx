"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { convertPagesToImages, markFormFields, fillAnalyzedFields, highlightFormField, resetFormFieldHighlight, unmarkFormFields } from '@/lib/pdf-utils';
import { analyzeImages, FillFormOutput } from '@/lib/google-ai-utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PDFViewerProps {
    url: string;
    knowledgeBase: string;
}
interface FormFieldCardProps {
    field: TrackedField;
    instance: any;
    currentValue: string;
    onIgnore: (fieldId: string) => void;
    onAccept: (field: TrackedField, currentValue: string) => void;
}

const FormFieldCard: React.FC<FormFieldCardProps> = ({ field, instance, currentValue, onIgnore, onAccept }) => {
    const [editedName, setEditedName] = useState(field.name);

    const handleMouseEnter = async () => {
        await highlightFormField(instance, field.originalFieldName);
    };

    const handleMouseLeave = async () => {
        await resetFormFieldHighlight(instance, field.originalFieldName);
    };

    if (!currentValue) {
        return null
    }

    return (
        <Card
            className="mb-4 w-full hover:shadow-md transition-shadow duration-200"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <CardHeader className="p-4">
                <div className="flex flex-col">
                    <div className="flex-1">
                        <div className="relative group">
                            <input
                                type="text"
                                value={editedName}
                                onChange={(e) => setEditedName(e.target.value)}
                                className="text-xs font-semibold text-gray-600 mb-1 w-full bg-transparent border-none p-0 focus:outline-none focus:ring-0 hover:bg-gray-50 rounded transition-colors"
                            />
                        </div>
                        <div className="space-y-1">
                            <span className="font-medium">{currentValue}</span>
                        </div>
                    </div>
                    <div className="flex w-full gap-2 mt-4 text-sm justify-end">
                        <button
                            className="flex items-center gap-1 px-3 py-1 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50"
                            onClick={() => onIgnore(field.field_id)}
                        >
                            <XCircle className="h-4 w-4" />
                            <span>Hide</span>
                        </button>
                        <button
                            className="flex items-center gap-1 px-3 py-1 rounded-md border border-green-600 text-green-600 hover:bg-green-50"
                            onClick={() => onAccept({ ...field, name: editedName }, currentValue)}
                        >
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Add to knowledge base</span>
                        </button>
                    </div>
                </div>
            </CardHeader>
        </Card>
    );
};

interface SidebarProps {
    isAnalyzing: boolean;
    filledFields: TrackedField[];
    instance: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isAnalyzing, filledFields, instance }) => {
    const [currentValues, setCurrentValues] = useState<{ [key: string]: string }>({});
    const [ignoredFields, setIgnoredFields] = useState<Set<string>>(new Set());
    const [customFields, setCustomFields] = useState<Record<string, string>>({});

    // Function to update current field values
    const updateCurrentValues = async () => {
        if (!instance) return;

        try {
            const formFields = await instance.getFormFields();
            const values: { [key: string]: string } = {};

            formFields.forEach((field: any) => {
                values[field.name] = field.value || '';
            });

            setCurrentValues(values);
        } catch (error) {
            console.error('Error getting current field values:', error);
        }
    };

    // Poll for changes every second
    useEffect(() => {
        if (!instance) return;

        // Initial update
        updateCurrentValues();

        // Set up polling
        const intervalId = setInterval(updateCurrentValues, 1000);

        return () => {
            clearInterval(intervalId);
        };
    }, [instance]);

    const handleIgnore = (fieldId: string) => {
        setIgnoredFields(prev => {
            const newSet = new Set(prev);
            newSet.add(fieldId);
            return newSet;
        });
    };

    const handleAccept = async (field: TrackedField, currentValue: string) => {
        // Add to custom fields
        setCustomFields(prev => ({
            ...prev,
            [field.name]: currentValue
        }));

        // Add to ignored fields to remove from display
        setIgnoredFields(prev => {
            const newSet = new Set(prev);
            newSet.add(field.field_id);
            return newSet;
        });

        // Update user profile with new custom field
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                console.error('No user found');
                return;
            }

            const { data: profile } = await supabase
                .from('user_profiles')
                .select('custom_fields')
                .eq('id', user.id)
                .single();

            const updatedCustomFields = {
                ...(profile?.custom_fields || {}),
                [field.name]: currentValue
            };

            await supabase
                .from('user_profiles')
                .upsert({
                    id: user.id,
                    custom_fields: updatedCustomFields,
                    updated_at: new Date().toISOString()
                });

        } catch (error) {
            console.error('Error updating profile:', error);
        }
    };

    // Filter out fields that were successfully pre-filled or ignored
    const fieldsToShow = filledFields.filter(field =>
        !field.value && !ignoredFields.has(field.field_id)
    );

    return (
        <div className="w-96 h-full bg-gray-50 p-4 overflow-y-auto border-l">
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-1">Update Knowledge Base</h2>
                <p className={`text-sm ${isAnalyzing ? 'text-blue-600' : fieldsToShow.length === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isAnalyzing
                        ? 'Analyzing form fields...'
                        : fieldsToShow.length > 0
                            ? `${fieldsToShow.length} fields need attention`
                            : 'All fields are filled'
                    }
                </p>
            </div>

            <div className="space-y-2">
                {fieldsToShow.map((field, index) => (
                    <FormFieldCard
                        key={`${field.field_id}-${index}`}
                        field={field}
                        instance={instance}
                        currentValue={currentValues[field.originalFieldName] || ''}
                        onIgnore={handleIgnore}
                        onAccept={handleAccept}
                    />
                ))}
            </div>

            {!isAnalyzing && fieldsToShow.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    <p>All fields have been filled</p>
                </div>
            )}
        </div>
    );
};

interface MarkedField {
    field_id: string;
    name: string;
    marked_value: string;
}

interface TrackedField {
    field_id: string;
    name: string;
    originalFieldName: string;
    value: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
    url,
    knowledgeBase,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [filledFields, setFilledFields] = useState<TrackedField[]>([]);

    const handleAnalyze = async (pdfInstance: any) => {
        if (!pdfInstance) return;

        try {
            setIsAnalyzing(true);
            const marked = await markFormFields(pdfInstance);

            const images = await convertPagesToImages(pdfInstance);
            const filledValues = await analyzeImages(images, knowledgeBase);

            // Map the filled values to include the original field names from markedFields
            const mappedFilledValues = filledValues.map(filled => {
                const originalField = marked.find(m => m.marked_value === filled.field_id);
                return {
                    ...filled,
                    name: filled.name,
                    originalFieldName: originalField?.name || ""
                };
            });

            setFilledFields(mappedFilledValues);

            await fillAnalyzedFields(pdfInstance, filledValues);
            await unmarkFormFields(pdfInstance);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        const container = containerRef.current;

        if (container && typeof window !== 'undefined') {
            import('pspdfkit').then((PSPDFKit) => {
                if (PSPDFKit) {
                    // @ts-ignore
                    PSPDFKit.unload(container);
                }

                // @ts-ignore
                PSPDFKit.load({
                    container,
                    document: url,
                    baseUrl: `${window.location.protocol}//${window.location.host}/`,
                }).then((pdfInstance: any) => {
                    setInstance(pdfInstance);
                    handleAnalyze(pdfInstance);
                });
            });
        }

        return () => {
            if (container && typeof window !== 'undefined') {
                import('pspdfkit').then((PSPDFKit) => {
                    // @ts-ignore
                    PSPDFKit.unload(container);
                });
            }
        };
    }, [url]);

    return (
        <div className="fixed inset-0 flex mt-16">
            {/* Main PDF viewer */}
            <div className="flex-1 relative bg-gray-100">
                <div
                    ref={containerRef}
                    className="absolute inset-0"
                    style={{
                        width: '100%',
                        height: '100%'
                    }}
                />
            </div>

            {/* Sidebar Component */}
            <Sidebar
                isAnalyzing={isAnalyzing}
                filledFields={filledFields}
                instance={instance}
            />
        </div>
    );
};

export { PDFViewer };