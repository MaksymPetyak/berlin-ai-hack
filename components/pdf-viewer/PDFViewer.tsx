"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { convertPagesToImages, markFormFields, fillAnalyzedFields, highlightFormField, resetFormFieldHighlight, unmarkFormFields } from '@/lib/pdf-utils';
import { analyzeImages, FillFormOutput } from '@/lib/google-ai-utils';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { CheckCircle2, XCircle } from 'lucide-react';

interface PDFViewerProps {
    url: string;
    knowledgeBase: string;
}
interface FormFieldCardProps {
    field: TrackedField;
    instance: any;
    currentValue: string;
}

const FormFieldCard: React.FC<FormFieldCardProps> = ({ field, instance, currentValue }) => {
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
                <div className="flex justify-between items-start">
                    <div className="flex-1">
                        <CardTitle className="text-xs font-semibold text-gray-600 mb-1">
                            {field.name}
                        </CardTitle>
                        <div className="space-y-1">
                            <span className="font-medium">{currentValue || 'Empty'}</span>
                        </div>
                    </div>
                    <div className="flex gap-2 ml-2">
                        <button className="text-green-500 hover:text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button className="text-red-500 hover:text-red-600">
                            <XCircle className="h-5 w-5" />
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

    // Function to update current field values
    const updateCurrentValues = async () => {
        if (!instance) return;

        try {
            const formFields = await instance.getFormFields();
            const values: { [key: string]: string } = {};

            formFields.forEach((field: any) => {
                values[field.name] = field.value || '';
            });

            console.log("Form Fields:", formFields);
            console.log("Values:", values);
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

    console.log("Current Values: ", currentValues)
    console.log("Filled Fields: ", filledFields)

    return (
        <div className="w-96 h-full bg-gray-50 p-4 overflow-y-auto border-l">
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-1">Form Fields</h2>
                <p className={`text-sm ${isAnalyzing ? 'text-blue-600' : filledFields.length === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {isAnalyzing
                        ? 'Analyzing form fields...'
                        : filledFields.length > 0
                            ? `${filledFields.length} fields detected`
                            : 'No fields analyzed yet'
                    }
                </p>
            </div>

            <div className="space-y-2">
                {filledFields.map((field, index) => (
                    <FormFieldCard
                        key={`${field.field_id}-${index}`}
                        field={field}
                        instance={instance}
                        currentValue={currentValues[field.originalFieldName] || ''}
                    />
                ))}
            </div>

            {!isAnalyzing && filledFields.length === 0 && (
                <div className="text-center text-gray-500 mt-8">
                    <p>Click "Analyze PDF" to start</p>
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

    useEffect(() => {
        const container = containerRef.current;

        if (container && typeof window !== 'undefined') {
            import('pspdfkit').then((PSPDFKit) => {
                if (PSPDFKit) {
                    PSPDFKit.unload(container);
                }

                PSPDFKit.load({
                    container,
                    document: url,
                    baseUrl: `${window.location.protocol}//${window.location.host}/`,
                }).then((pdfInstance) => {
                    setInstance(pdfInstance);
                });
            });
        }

        return () => {
            if (container && typeof window !== 'undefined') {
                import('pspdfkit').then((PSPDFKit) => {
                    PSPDFKit.unload(container);
                });
            }
        };
    }, [url]);

    const handleAnalyze = async () => {
        if (!instance) return;

        try {
            setIsAnalyzing(true);
            const marked = await markFormFields(instance);

            const images = await convertPagesToImages(instance);
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

            await fillAnalyzedFields(instance, filledValues);
            await unmarkFormFields(instance);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

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
                <Button
                    className="absolute top-4 right-4 z-10"
                    onClick={handleAnalyze}
                    disabled={!instance || isAnalyzing}
                >
                    {isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}
                </Button>
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