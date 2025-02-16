import { z } from 'zod';

const FormFieldSchema = z.object({
    field_id: z.string(),
    value: z.string(),
    name: z.string()
});

const FormFieldsResponseSchema = z.array(FormFieldSchema);

export type FillFormOutput = z.infer<typeof FormFieldSchema>;

export async function analyzeImages(base64Images: string[], knowledgeBase: string): Promise<FillFormOutput[]> {
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                base64Images,
                knowledgeBase,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze images');
        }

        const data = await response.json();
        return FormFieldsResponseSchema.parse(data);
    } catch (error) {
        console.error('Error analyzing images:', error);
        throw error;
    }
}


