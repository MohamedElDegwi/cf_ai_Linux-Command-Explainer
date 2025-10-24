# Linux Command Explainer

An AI-powered chat application built on the Cloudflare stack. This bot acts as a specialized Linux command expert, providing explanations, use cases, and conversational help for Linux commands.

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/MohamedElDegwi/cf_ai_Linux-Command-Explainer/tree/main)

<!-- dash-content-start -->
## Purpose

This project was built as a Cloudflare AI-powered application **optional** assignment, demonstrating a full-stack application using modern serverless tools.

## Features

This application includes all four required components for the assignment:

* 🧠 **LLM:** Uses **Llama 3.3** via **Cloudflare Workers AI** to provide expert-level knowledge about Linux.
* ⚙️ **Workflow:** A **Cloudflare Worker** (`src/index.ts`) serves as the backend, handling API logic, AI prompting, and database coordination.
* 💻 **User Input:** A responsive chat interface built with **Cloudflare Pages** (`public/index.html` and `public/chat.js`).
* 💾 **Memory / State:** Stateful, persistent chat history. Conversations are stored in a **Cloudflare D1** SQL database and are tied to a user's browser session.

### Additional Features

* **Persistent Memory:** Chat history is saved in a D1 database. A unique `sessionId` is stored in the browser's `localStorage`, allowing users to close their tab, refresh the page, or restart their browser and have their conversation history automatically reload.
* **Markdown Rendering:** AI responses are parsed with `marked.js` and sanitized with `DOMPurify` to display formatted text (code blocks, bold, lists).
* **Specialized System Prompt:** A custom, multi-step system prompt (in `src/index.ts`) guides the LLM to act as a Linux expert, correctly handling specific commands, general questions, and off-topic rejection.
* **Database-Driven API:** A non-streaming JSON API (`/api/chat` and `/api/history`) was built to integrate the chat logic with the D1 database.

## Limitations 

* Please note that your chat history is connected to your browser session, meaning if you cleaned your browser cache or using cognito mode your history will be **LOST**. this is tied to each browser meaning different browsers will have different histories.

<!-- dash-content-end -->

## Getting Started

### Live Production

You can test it live here [**Linux Command Explainer**](https://cf-ai-linux-command-explainer.mohammedeldegwi.workers.dev/)

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Cloudflare account with Workers AI access

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/MohamedElDegwi/cf_ai_Linux-Command-Explainer.git
   cd cf_ai_Linux-Command-Explainer
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Generate Worker type definitions:
   ```bash
   npm run cf-typegen
   ```

4. Create local database 
   ```bash
   wrangler d1 execute cf_ai_lce_memory --command="CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT, content TEXT, timestamp INTEGER);" --local
   ```

### Development

Start a local development server:

```bash
npm run dev -- --local
```

This will start a local server at http://localhost:8787.

Note: Using Workers AI accesses your Cloudflare account even during local development, which will incur usage charges.

### Deployment

1.  **Deploy the Project:**
    Run the deploy command. This will upload your Worker and your Pages frontend.
    ```bash
    wrangler deploy
    ```

2.  **Bind Your Production Database:**
    Your deployed Worker needs to be connected to your production D1 database.
    * Go to your Cloudflare dashboard.
    * Navigate to **Workers & Pages** > click on your `cf_ai_Linux-Command-Explainer` Worker.
    * On overview page scroll down to **bindings** > **add binding**.
    * On **D1 Database** and click **Add binding**.
    * Set **Variable name** to: `DB`
    * Set **D1 Database** to: `cf_ai_lce_memory`
    * Click **Save and deploy**.

3.  **Initialize the Production Database:**
    Finally, you must run the `CREATE TABLE` command on your **production** database. (Note the absence of the `--local` flag).
    ```bash
    wrangler d1 execute cf_ai_lce_memory --command="CREATE TABLE messages (id INTEGER PRIMARY KEY AUTOINCREMENT, session_id TEXT, role TEXT, content TEXT, timestamp INTEGER); --remote"
    ```

## Project Structure

```
/
├── public/             # Static assets
│   ├── index.html      # Chat UI HTML
│   └── chat.js         # Chat UI frontend script
├── src/
│   ├── index.ts        # Main Worker entry point
│   └── types.ts        # TypeScript type definitions
├── PROPMPTS.md         # Prompt file 
├── wrangler.jsonc      # Cloudflare Worker configuration
├── tsconfig.json       # TypeScript configuration
└── README.md           # This documentation
```

## Customization

### Changing the Model

To use a different AI model, update the `MODEL_ID` constant in `src/index.ts`. You can find available models in the [Cloudflare Workers AI documentation](https://developers.cloudflare.com/workers-ai/models/).

### Using AI Gateway

The template includes commented code for AI Gateway integration, which provides additional capabilities like rate limiting, caching, and analytics.

To enable AI Gateway:

1. [Create an AI Gateway](https://dash.cloudflare.com/?to=/:account/ai/ai-gateway) in your Cloudflare dashboard
2. Uncomment the gateway configuration in `src/index.ts`
3. Replace `YOUR_GATEWAY_ID` with your actual AI Gateway ID
4. Configure other gateway options as needed:
   - `skipCache`: Set to `true` to bypass gateway caching
   - `cacheTtl`: Set the cache time-to-live in seconds

Learn more about [AI Gateway](https://developers.cloudflare.com/ai-gateway/).

### Modifying the System Prompt

The default system prompt can be changed by updating the `SYSTEM_PROMPT` constant in `src/index.ts`.

### Styling

The UI styling is contained in the `<style>` section of `public/index.html`. You can modify the CSS variables at the top to quickly change the color scheme.

## Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Cloudflare Workers AI Documentation](https://developers.cloudflare.com/workers-ai/)
- [Workers AI Models](https://developers.cloudflare.com/workers-ai/models/)
