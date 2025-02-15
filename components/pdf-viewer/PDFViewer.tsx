"use client";

import { useEffect, useRef } from 'react';

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
                });
            });
        }

        // Cleanup on unmount
        return () => {
            if (container && typeof window !== 'undefined') {
                import('pspdfkit').then((PSPDFKit) => {
                    PSPDFKit.unload(container);
                });
            }
        };
    }, [url]);

    return (
        <div
            ref={containerRef}
            style={{
                width,
                height,
                minWidth: '300px', // Ensures a minimum width
                margin: '0 auto'    // Centers the container
            }}
        />
    );
};

export default PDFViewer;
