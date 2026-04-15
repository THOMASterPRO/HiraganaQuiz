import { useEffect, useState } from 'react';
import './App.css';
import { micromark } from 'https://esm.sh/micromark@3?bundle'

function App() {
  // check of localstorage al een userId heeft en genereer er een als die er nog neit is
  const [userId] = useState(() => {
    const stored = localStorage.getItem('userid');
    if (stored) return stored;

    const created = crypto.randomUUID();
    localStorage.setItem('userid', created);
    return created;
  });

  // aanmaken van useStates
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // functie om een prompt naar de api te sturen en een response te ontvangen
  const handleSend = async () => {
    const messageToSend = input.trim();
    if (!messageToSend) return;

    setIsLoading(true);
    setError('');
    setInput('');

    // voer de fetch uit binnen een try-catch blok om fouten af te handelen
    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      setMessages(Array.isArray(data.messages) ? data.messages : []);
      setTokens(data.tokens || [0, 0]);
    } catch (error) {
      setError(error.message);
      setTokens(prev => [...prev, 0]);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect om de initiële berichten op te halen van de server
  useEffect(() => {
    const fetchInitialMessages = async () => {
      try {
        const response = await fetch(`http://localhost:3001/api/chat/initial?userId=${encodeURIComponent(userId)}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch initial messages');
        }

        const data = await response.json();
        setMessages(Array.isArray(data.messages) ? data.messages : []);
        setTokens(data.tokens || [0, 0]);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchInitialMessages();
  }, [userId]);

  return (
    <div className="App">
      <header className="App-header">
        <section className="chat-container">
          <h1 className="App-title">Japanese hiragana tutor</h1>

          <div className="chat-window">
            {messages.map((msg, index) => {
              if (msg.role === 'system') return null;

              const isUser = msg.role === 'user';

              return (
                <div key={index} className={`message ${isUser ? 'user-message' : 'bot-message'}`}>
                  <div dangerouslySetInnerHTML={{ __html: micromark(msg.content) }} />
                  {!isUser && (
                    <div className="message-tokens">Tokens: {tokens[index]}</div>
                  )}
                </div>
              );
            })}

          </div>
          <div className="input-container">
            <input
              type="text"
              placeholder="Type your message..."
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="send-button" type="submit" disabled={isLoading} onClick={handleSend}>
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>
        </section>
      </header>
    </div>
  );
}

export default App;
