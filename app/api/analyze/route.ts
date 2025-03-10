import { NextResponse } from 'next/server';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

// Create a custom instance with settings
const google = createGoogleGenerativeAI({
    apiKey: process.env.GOOGLE_API_KEY,
});

const PROMPT = `
You are a form filling agent. 
You will be given a form with some fields.
Unfilled fields will be marked like "idx_{num}" to indicate what is the id of the field.
You will also be provided with a knowledge base to use to fill out the form.

Your job is to generate the list of fields to fill out and the value you would put in the field if it's available.
RETURN ALL THE FIELDS EVEN IF THEY ARE EMPTY. 
YOU MUST MATCH THE FIELD ID TO THE MOST RELEVANT IDX FIELD THAT IS THE CLOSEST TO THE FIELD THAT NEEDS TO BE FILLED.

You must output JSON in the following format:
{
    "field_id": string ("idx_{num}"),
    "value": string ("value that goes into the field. If the field is already filled, don't do anything and return an empty string."),
    "name": string ("name of the field, try to be as close to the title used in the document as possible. This name has to be descriptive, like Nationality, Name, Email, Address, etc.")
}
`;

const FormFieldSchema = z.object({
    field_id: z.string(),
    value: z.string(),
    name: z.string()
});

const FormFieldsResponseSchema = z.array(FormFieldSchema);

type MessageContent = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    image: string;
};

export async function POST(request: Request) {
    try {
        const { base64Images, knowledgeBase } = await request.json();

        if (!Array.isArray(base64Images) || !knowledgeBase) {
            return NextResponse.json(
                { error: 'Invalid request body' },
                { status: 400 }
            );
        }

        const model = google('gemini-2.0-flash-001');

        const { object } = await generateObject({
            model,
            schema: FormFieldsResponseSchema,
            messages: [
                {
                    role: 'system',
                    content: PROMPT as string
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Knowledge base to fill the form: ${knowledgeBase}`
                        } as MessageContent,
                        ...base64Images.map(base64 => ({
                            type: 'image',
                            image: base64,
                        } as MessageContent))
                    ] as MessageContent[]
                }
            ]
        });

        return NextResponse.json(object);
    } catch (error) {
        console.error('Error analyzing images:', error);
        return NextResponse.json(
            { error: 'Analysis failed' },
            { status: 500 }
        );
    }
} 
