"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { markFormFields, modifySpecificField } from '@/lib/pdf-utils';
import { analyzeImages } from '@/lib/google-ai-utils';

interface PDFViewerProps {
    url: string;
    width?: string;
    height?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
    url,
    width = '100%',
    height = '100vh'
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [instance, setInstance] = useState<any>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

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

            // Print initial state
            // console.log('Initial form state:');
            // await printFormState(instance);

            // Try to modify specific field by name
            // await modifySpecificField(instance, "107", "Textfield");
            await markFormFields(instance);

            // Print state after modification
            // console.log('Form state after modification:');
            // await printFormState(instance);

            // Mark all form fields
            // await markFormFields(instance);
            // console.log('Marked form fields');

            // // Get pages as images
            // const images = await getAsImages(instance);

            // console.log(`Got ${images.length} images`);

            // // Analyze images
            // const analysis = await analyzeImages(
            //     process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY!,
            //     images,
            //     "Analyze this page and its annotations. Describe what you see."
            // );

            // console.log('Analysis result:', analysis);

        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="relative">
            <div
                ref={containerRef}
                style={{
                    width,
                    height,
                    minWidth: '300px',
                    margin: '0 auto'
                }}
            />
            <Button
                className="absolute top-4 right-4"
                onClick={handleAnalyze}
                disabled={!instance || isAnalyzing}
            >
                {isAnalyzing ? 'Analyzing...' : 'Analyze PDF'}
            </Button>
        </div>
    );
};

export default PDFViewer;
