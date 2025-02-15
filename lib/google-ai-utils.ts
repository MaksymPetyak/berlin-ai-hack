import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';


// Create a custom instance with settings
const google = createGoogleGenerativeAI({
    apiKey: "AIzaSyAPJF_jFKlYruXTX9MXGZ6W-SYj1J-uq-U",
});

type MessageContent = {
    type: 'text';
    text: string;
} | {
    type: 'image';
    image: string;
};


const PROMPT = `
You are a form filling agent. 
You will be given a form and a list of fields to fill.
Some fields will be marked like "idx_{num}" to indicate what is the id of the field.
You will also be provided with a knowledge base to use to fill out the form.
Your job is to return a list of field ids and how they should be filled.
YOU MUST OUTPUT JSON IN THE FOLLOWING FORMAT:
[
   {
      "field_id": int,
      "value": string,
   },
   ...
]
`

export async function analyzeImages(base64Images: string[], knowledgeBase: string): Promise<string> {
    try {
        const model = google('gemini-2.0-flash-001');

        const result = await generateText({
            model,
            messages: [
                {
                    role: 'system',
                    content: PROMPT
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: `Knowledge base to fill the form: ${knowledgeBase}`
                        },
                        ...base64Images.map(base64 => ({
                            type: 'image',
                            image: base64,
                        } as MessageContent))
                    ]
                }
            ]
        });

        return result.text;
    } catch (error) {
        console.error('Error analyzing images:', error);
        throw error;
    }
}


