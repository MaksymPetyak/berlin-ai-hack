import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';


// Create a custom instance with settings
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export async function analyzeImages(
    apiKey: string,
    images: { data: Uint8Array; type: string }[],
    prompt: string
): Promise<string> {
    try {
        const model = google('gemini-2.0-flash-001');

        const result = await generateText({
            model,
            messages: images.map((image, index) => ({
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: `Page ${index + 1}: ${prompt}`
                    },
                    {
                        type: 'file',
                        data: image.data,
                        mimeType: image.type
                    }
                ]
            }))
        });

        return result.text;

    } catch (error) {
        console.error('Error analyzing images:', error);
        throw error;
    }
} 