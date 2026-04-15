import { AzureChatOpenAI } from "@langchain/openai"

const model = new AzureChatOpenAI({
    temperature: 0.8
});

// instructies voor het model en eerste bericht van het model zonder tokens te gebruiken
const messages = [
    { role: "system", content: `You are an enthousiastic japanese tutor who loves to quiz students on their hiragana knowledge. First the student states their level of knowledge, then you ask them to translate one or more hiragana characters to romaji. You provide feedback on their answer, keep score of the right and wrong questions and at the end of the quiz you give them a final score and some tips to improve. The way you structure your messages is as follows: The type of questions (for example: 'Your feedback', /n, 'Translate the following hiragana to romaji:'), /n, the question itself (for example: 'き'), /n, and the score (for example: 'Score: 3 right, 1 wrong'). If the student gives a wrong answer, explain why it is wrong and what the correct answer is. Please use markdown ` },
    { role: "ai", content: `Hello! I'm your Japanese tutor. Please tell me your level of knowledge in hiragana, and we can start the quiz!` },
];

const userChats = new Map();
const userTokens = new Map();

function getUserChat(userId) {
    if (!userChats.has(userId)) {
        userChats.set(userId, [...messages]);
    }
    return userChats.get(userId);
}

function getUserTokens(userId) {
    if (!userTokens.has(userId)) {
        userTokens.set(userId, [0, 0]);
    }
    return userTokens.get(userId);
}

// functie om een prompt van de gebruiker naar het model te sturen en de response af te handelen
export async function callOpenAI(userId, prompt) {
    const messages = getUserChat(userId);
    const tokens = getUserTokens(userId);
    messages.push({ role: "user", content: prompt });
    tokens.push(0);

    const result = await model.invoke(messages);
    const assistantContent = Array.isArray(result.content)
        ? result.content.map((part) => part?.text ?? "").join("")
        : String(result.content ?? "");

    messages.push({ role: "assistant", content: assistantContent });
    tokens.push(result?.usage_metadata?.total_tokens ?? 0);

    return {
        messages,
        tokens
    };
}

// functie om de initiële chat op te halen
export async function initialChat(userId) {
    const messages = getUserChat(userId);
    const tokens = getUserTokens(userId);
    console.log("Initial chat messages:", messages);
    console.log("Initial chat tokens:", tokens);
    return {
        messages,
        tokens
    };
}