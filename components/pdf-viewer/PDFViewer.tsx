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
    field: FillFormOutput;
    instance: any;
}

const FormFieldCard: React.FC<FormFieldCardProps> = ({ field, instance }) => {
    const handleMouseEnter = async () => {
        await highlightFormField(instance, field.name);
    };

    const handleMouseLeave = async () => {
        await resetFormFieldHighlight(instance, field.name);
    };

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
                        <p className="text-sm">{field.value}</p>
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
    filledFields: FillFormOutput[];
    instance: any;
}

const Sidebar: React.FC<SidebarProps> = ({ isAnalyzing, filledFields, instance }) => {
    return (
        <div className="w-96 h-full bg-gray-50 p-4 overflow-y-auto border-l">
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-1">Fields</h2>
                <p className={`text-sm ${filledFields.length === 0 ? 'text-gray-400' : 'text-gray-600'}`}>
                    {filledFields.length > 0
                        ? `${filledFields.length} fields auto-filled`
                        : isAnalyzing
                            ? 'Analyzing form fields...'
                            : 'No fields analyzed yet'
                    }
                </p>
            </div>
            {filledFields.length > 0 && (
                filledFields.map((field, index) => (
                    <FormFieldCard
                        key={index}
                        field={field}
                        instance={instance}
                    />
                ))
            )}
        </div>
    );
};

interface MarkedField {
    field_id: string;
    name: string;
    marked_value: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
    url,
    knowledgeBase,
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [filledFields, setFilledFields] = useState<FillFormOutput[]>([]);
    const [markedFields, setMarkedFields] = useState<MarkedField[]>([]);

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
            setMarkedFields(marked);

            const images = await convertPagesToImages(instance);
            const filledValues = await analyzeImages(images, knowledgeBase);

            // Map the filled values to include the original field names from markedFields
            const mappedFilledValues = filledValues.map(filled => {
                const originalField = marked.find(m => m.marked_value === filled.field_id);
                return {
                    ...filled,
                    name: originalField?.name || filled.name
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