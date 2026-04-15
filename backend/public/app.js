const chatForm = document.getElementById("chatForm");
const userInput = document.getElementById("userInput");

if (chatForm && userInput) {
    chatForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const message = userInput.value.trim();
        if (!message) return;

        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        console.log(data);
    });
}