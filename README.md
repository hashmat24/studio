# Fasal Drishti (formerly Krishi Mitra)

This is a Next.js starter project created in Firebase Studio. It's a smart crop advisory system designed to assist farmers with AI-powered insights.

## Tech Stack

*   **Framework:** Next.js (with App Router) & React
*   **Backend & Database:** Firebase (Authentication & Firestore)
*   **Generative AI:** Genkit with Google's Gemini Models
*   **UI Components:** ShadCN UI
*   **Styling:** Tailwind CSS
*   **Language:** TypeScript
*   **Internationalization:** i18next

## Getting Started Locally

Follow these steps to run the application on your local computer.

### 1. Prerequisites

Make sure you have the following installed:
*   [Node.js](https://nodejs.org/) (version 18 or newer)
*   [npm](https://www.npmjs.com/) (which comes with Node.js)

### 2. Set Up Environment Variables

The application uses Google's Generative AI. To run the AI features, you need an API key.

1.  Get a Gemini API Key from **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2.  In the root directory of the project, create a new file named `.env`.
3.  Add your API key to the `.env` file as shown below:

    ```.env
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```

### 3. Install Dependencies

Open your terminal, navigate to the project's root folder, and run this command to install all the required packages:

```bash
npm install
```

### 4. Run the Development Servers

You need to run two separate processes in two different terminal windows: the AI server (Genkit) and the web application server (Next.js).

**Terminal 1: Start the Genkit AI Server**
```bash
npm run genkit:dev
```
This server handles all the AI-related tasks, like image analysis and generating advice.

**Terminal 2: Start the Next.js Web App**
```bash
npm run dev
```
This starts the main user interface of the application.

### 5. View Your Application

Once both servers have started successfully, open your web browser and go to:

**[http://localhost:9002](http://localhost:9002)**

You should now see the Fasal Drishti application running locally!
