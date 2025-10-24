const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const typingIndicator = document.getElementById("typing-indicator");

let sessionId = localStorage.getItem("sessionId");
if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
}

let isProcessing = false;

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch(`/api/history?sessionId=${sessionId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch history");
        }
        const history = await response.json();

        chatMessages.innerHTML = "";
        
        history.forEach((msg) => {
            addMessageToChat(msg.role, msg.content);
        });

        if (history.length === 0) {
             addMessageToChat("assistant", "Hello! I'm The Linux Command Explainer. Which command can I help you with today?");
        }

    } catch (error) {
        console.error("Error loading history:", error);
        addMessageToChat("assistant", "Error loading previous chat.");
    }
});

userInput.addEventListener("input", function () {
	this.style.height = "auto";
	this.style.height = this.scrollHeight + "px";
});

userInput.addEventListener("keydown", function (e) {
	if (e.key === "Enter" && !e.shiftKey) {
		e.preventDefault();
		sendMessage();
	}
});

sendButton.addEventListener("click", sendMessage);

async function sendMessage() {
	const message = userInput.value.trim();

	if (message === "" || isProcessing) return;

	isProcessing = true;
	userInput.disabled = true;
	sendButton.disabled = true;

	addMessageToChat("user", message);

	userInput.value = "";
	userInput.style.height = "auto";

	typingIndicator.classList.add("visible");

	try {
		const response = await fetch("/api/chat", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				message: message,
				sessionId: sessionId,
			}),
		});

		if (!response.ok) {
			throw new Error("Failed to get response");
		}

		const data = await response.json();
        const aiMessage = data.response;

		addMessageToChat("assistant", aiMessage);

	} catch (error) {
		console.error("Error:", error);
		addMessageToChat(
			"assistant",
			"Sorry, there was an error processing your request.",
		);
	} finally {
		typingIndicator.classList.remove("visible");

		isProcessing = false;
		userInput.disabled = false;
		sendButton.disabled = false;
		userInput.focus();
	}
}

function addMessageToChat(role, content) {
	const messageEl = document.createElement("div");
	messageEl.className = `message ${role}-message`;

	if (role === "user") {
        const p = document.createElement("p");
        p.textContent = content;
        messageEl.appendChild(p);
    } else {
        const rawHtml = marked.parse(content);
        messageEl.innerHTML = DOMPurify.sanitize(rawHtml);
    }

	chatMessages.appendChild(messageEl);
	chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.addEventListener("DOMContentLoaded", () => {
    const firstMessage = chatHistory[0];
    
    addMessageToChat(firstMessage.role, firstMessage.content);
});
