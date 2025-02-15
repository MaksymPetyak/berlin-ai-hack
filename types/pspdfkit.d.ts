declare module 'pspdfkit' {
    interface Instance {
        // Add any PSPDFKit instance methods you're using
        [key: string]: any;
    }

    const PSPDFKit: {
        load(options: any): Promise<Instance>;
        unload(container: HTMLElement): void;
    };

    export default PSPDFKit;
} 