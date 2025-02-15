"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';
import { convertPagesToImages, getAsImages, markFormFields, modifySpecificField } from '@/lib/pdf-utils';
import { analyzeImages } from '@/lib/google-ai-utils';

interface PDFViewerProps {
    url: string;
    width?: string;
    height?: string;
}

const KNOWLEDGE_BASE = `
Name: Maksym Petyak
Email: maksym.petyak@gmail.com
Phone: +380671234567
Address: 123 Main St, Anytown, USA
`

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

            // Try to modify specific field by name
            await markFormFields(instance);

            // Get pages as images
            const images = await convertPagesToImages(instance);

            // Analyze images
            const filledForms = await analyzeImages(
                images,
                KNOWLEDGE_BASE
            );

            console.log("Filled forms:", filledForms);

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
