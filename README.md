# 🧠 ELI5YO - Explain Like I'm 5 Years Old

ELI5YO is an open-source web application that simplifies any complex topic, term, or text snippet entered by the user — as if explaining it to a 5-year-old. This tool leverages Google's Gemini Large Language Model (LLM) to make information more accessible, friendly, and less intimidating.

**Live Demo:** [eli5yo.vercel.app](https://eli5yo.vercel.app)

## Features (MVP)
*   🔤 Single input field for entering the topic/text
*   🔘 “Explain It To Me!” button to trigger explanation
*   📄 Display area for AI-generated ELI5 response
*   ⏳ Loading indicator while fetching
*   ❗ Error message handling
*   ⚠️ Disclaimer about AI generation

## Tech Stack
*   **Frontend:** Next.js (React, App Router, TypeScript)
*   **Styling:** Tailwind CSS
*   **Backend Logic:** Next.js API Routes (Vercel Serverless Functions)
*   **LLM:** Google Gemini API (`gemini-1.5-flash-latest`)
*   **Deployment:** Vercel
*   **Version Control:** GitHub

## Getting Started Locally

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Nikhil0307/eli5yo.git
    cd eli5yo
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    *   Create a `.env.local` file in the root of the project.
    *   Add your Google Gemini API key:
        ```
        GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE
        ```
    *   You can get an API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    # yarn dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Contributing
Contributions are welcome! Please feel free to open an issue or submit a pull request for:
*   Bug fixes
*   UI/UX improvements
*   Prompt refinements
*   New features (post-MVP ideas are welcome!)

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
