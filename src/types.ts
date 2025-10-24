export interface Env {
	AI: Ai;
	DB: D1Database;
	
	ASSETS: { fetch: (request: Request) => Promise<Response> };
}

export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}
