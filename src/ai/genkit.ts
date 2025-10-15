import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

export const ai = genkit({
  plugins: [googleAI({
    // API key is now loaded from process.env implicitly by the plugin
    // on the server side, making it more secure.
  })],
  model: 'googleai/gemini-2.5-flash',
});
