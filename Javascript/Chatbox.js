// Chatbox controls and messages for the DataDex assistant.

// 1. Paste your NEW Base64 encoded string inside the quotes here:
const encodedKey = 'Z3NrXzJrMHl0cndzY2pZamhDRWF0TklmV0dkeWIzRll4bDlDd095Z3RnNkt3dkdRYURndGdKNzY=';

let chatButton;
let chatWindow;
let closeChatButton;
let chatMessages;
let chatInput;
let sendButton;

// Conversation history so DataDex remembers the chat context
const messages = [
    {
        role: "system",
        content: "You are DataDex, a friendly Pokémon assistant. Help users with Pokémon information, evolutions, types, moves, abilities, and Pokédex facts."
    }
];

window.addEventListener("DOMContentLoaded", () => {
    chatButton = document.getElementById("chatbox_btn");
    chatWindow = document.getElementById("chatbox");
    closeChatButton = document.getElementById("close_chatbox");
    chatMessages = document.getElementById("chatbox_messages");
    chatInput = document.getElementById("chatbox_input");
    sendButton = document.getElementById("send_message");
    if (chatWindow) chatWindow.style.display = "none";
    if (chatMessages) {
        addMessage("👋 Hi! I'm DataDex. Ask me anything about Pokémon!", "bot");
    }
    if (chatButton) {
        chatButton.addEventListener("click", () => {
            chatWindow.style.display = "block";
        });
    }
    if (closeChatButton) {
        closeChatButton.addEventListener("click", () => {
            chatWindow.style.display = "none";
        });
    }
    if (sendButton) {
        sendButton.addEventListener("click", sendMessage);
    }
    if (chatInput) {
        chatInput.addEventListener("keydown", (e) => {
            if (e.key === "Enter") {
                sendMessage();
            }
        });
    }
});

function addMessage(text, sender) {
    const div = document.createElement("div");
    div.className = "message " + sender;
    div.textContent = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    addMessage(text, "user");
    chatInput.value = "";
    messages.push({
        role: "user",
        content: text
    });
    try {
        // Unscrambles the key right before sending the request
        const apiKey = atob(encodedKey);
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: messages,
                temperature: 0.7
            })
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || "API error");
        }
        const reply = data.choices[0].message.content;
        addMessage(reply, "bot");
        messages.push({
            role: "assistant",
            content: reply
        });
    } catch (err) {
        console.error("Chat error:", err);
        addMessage("❌ " + err.message, "bot");
    }
}