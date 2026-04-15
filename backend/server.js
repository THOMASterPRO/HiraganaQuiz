import express from 'express'
import {  
    callOpenAI,
    initialChat,
} from './chat.js'
import cors from 'cors'

const app = express()
app.use(express.json(), cors())

app.use(express.static("public"));
app.get("/", (req, res) => {
    res.sendFile("public/index.html", { root: "." });
});

const port = process.env.PORT || 3001
app.listen(port, () => console.log(`Server on http://localhost:${port}`))

app.get('/api/test', async (req, res) => {
    res.json("This is a test response from the server.")
    console.log("Received test request");
})

app.get('/api/chat/initial', async (req, res) => {
    const userId = req.query.userId || 'default';
    const result = await initialChat(userId);
    res.json(result)
    console.log("Received initial chat request");
})

app.post('/api/chat', async (req, res) => {
    const { userId, message } = req.body
    const result = await callOpenAI(userId || 'default', message)
    res.json(result)
})