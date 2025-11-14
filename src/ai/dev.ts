'use server';
import { config } from 'dotenv';
config();

// Check if the GEMINI_API_KEY is set
if (!process.env.GEMINI_API_KEY) {
  console.error('\nERROR: The GEMINI_API_KEY environment variable is not set.');
  console.error('Please create a .env file in the root of the project and add your key:');
  console.error('\nGEMINI_API_KEY=YOUR_API_KEY_HERE\n');
  console.error('You can get a key from Google AI Studio: https://aistudio.google.com/app/apikey\n');
  process.exit(1); // Exit the process with an error code
}


import '@/ai/flows/real-time-personalized-advice.ts';
import '@/ai/flows/smart-photo-analysis-for-crop-health.ts';
import '@/ai/flows/chatbot-flow.ts';
import '@/ai/flows/translation-flow.ts';
