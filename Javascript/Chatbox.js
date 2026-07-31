// Chatbox controls and messages for the DataDex assistant.

const API_KEY = "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";

let chatButton;
let chatWindow;
let closeChatButton;
let chatMessages;
let chatInput;
let sendButton;

// Keep the conversation history so the assistant has context.
const messages = [
    {
        role: "system",
        content: "You are DataDex, a friendly Pokémon assistant. Help users with Pokémon information, evolutions, types, moves, abilities, and Pokédex facts."
    }
];

window.addEventListener("DOMContentLoaded", () => {
    // Find the chatbox elements once the page is ready.
    chatButton = document.getElementById("chatbox_btn");
    chatWindow = document.getElementById("chatbox");
    closeChatButton = document.getElementById("close_chatbox");
    chatMessages = document.getElementById("chatbox_messages");
    chatInput = document.getElementById("chatbox_input");
    sendButton = document.getElementById("send_message");
    chatWindow.style.display = "none";
    addMessage("👋 Hi! I'm DataDex. Ask me anything about Pokémon!", "bot");
    chatButton.addEventListener("click", () => {
        chatWindow.style.display = "block";
    });
    closeChatButton.addEventListener("click", () => {
        chatWindow.style.display = "none";
    });
    sendButton.addEventListener("click", sendMessage);
    chatInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    });

});

function addMessage(text, sender) {
    // Add one message bubble, then scroll to the newest message.
    const div = document.createElement("div");
    div.className = "message " + sender;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    // Do not send an empty message.
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "user");
    chatInput.value = "";
    messages.push({
        role: "user",
        content: text
    });
    try {
        const response = await fetch(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: "llama-3.3-70b-versatile",
                    messages: messages,
                    temperature: 0.7
                })
            }
        );
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "Unknown API error");
        }
        const reply = data.choices[0].message.content;
        addMessage(reply, "bot");
        messages.push({
            role: "assistant",
            content: reply
        });

    } catch (err) {
        console.error(err);
        addMessage("❌ " + err.message, "bot");
    }
}
