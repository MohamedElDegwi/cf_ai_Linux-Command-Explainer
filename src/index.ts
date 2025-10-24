import { Env, ChatMessage } from "./types";

const MODEL_ID = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";

const SYSTEM_PROMPT = `You are a specialized Linux command expert. Your SOLE purpose is to analyze user input and provide explanations for Linux commands. You MUST follow these rules precisely:

1.  **Analyze Input:** Check if the user's message is a valid Linux command (e.g., "ls -la", "grep", "tar").

2.  **If it IS a valid command:**
    Respond *only* with the following Markdown structure:
    **Command:** \`[the_command]\`
    **Summary:** [Brief, one-sentence explanation.]
    **Components:** [Explain the command and its specific flags/arguments. If no flags, just explain the command.]
    **Common Use Cases:** [Provide 2-3 bulleted examples of how to use it.]
    **Alternatives:** [List 1-2 alternative commands that do similar things.]

3.  **If it is NOT a valid command:**
    (e.g., "hello", "what is your name?", "how do I copy a file?", "lsssp")
    Do NOT answer the question.
    Respond *only* with the following structure:
    I don't recognize that as a Linux command. My only job is to explain linux commands.
    Based on your input, perhaps you meant \`[your_best_guess_command]\`?
`;

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext,
	): Promise<Response> {
		const url = new URL(request.url);

		if (url.pathname === "/" || !url.pathname.startsWith("/api/")) {
			return env.ASSETS.fetch(request);
		}

		if (url.pathname === "/api/chat") {

			if (request.method === "POST") {
				return handleChatRequest(request, env);
			}

			return new Response("Method not allowed", { status: 405 });
		}

		return new Response("Not found", { status: 404 });
	},
} satisfies ExportedHandler<Env>;


async function handleChatRequest(
	request: Request,
	env: Env,
): Promise<Response> {
	try {
		const { messages = [] } = (await request.json()) as {
			messages: ChatMessage[];
		};

		if (!messages.some((msg) => msg.role === "system")) {
			messages.unshift({ role: "system", content: SYSTEM_PROMPT });
		}

		const response = await env.AI.run(
			MODEL_ID,
			{
				messages,
				max_tokens: 1024,
			},
			{
				returnRawResponse: true,
			}
		);

		return response;
	} catch (error) {
		console.error("Error processing chat request:", error);
		return new Response(
			JSON.stringify({ error: "Failed to process request" }),
			{
				status: 500,
				headers: { "content-type": "application/json" },
			},
		);
	}
}
