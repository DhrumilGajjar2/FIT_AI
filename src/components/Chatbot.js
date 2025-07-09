import React, { useState, useEffect, useRef } from "react";
import { getChatbotResponse } from "../utils/api";

function Chatbot() {
  const [messages, setMessages] = useState(() => {
    return JSON.parse(localStorage.getItem("chatHistory")) || [
      { sender: "bot", text: "Hi! Ask me anything about diet & workouts." },
    ];
  });
  const [input, setInput] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // ✅ Scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    localStorage.setItem("chatHistory", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const botReply = await getChatbotResponse(input);
      setMessages((prev) => [...prev, { sender: "bot", text: botReply || "I'm not sure, try again!" }]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: "bot", text: error.message || "Error! Try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      {/* ✅ Floating Chat Button */}
      <button className="chat-toggle" onClick={() => setIsOpen(!isOpen)}>
        Chat Here
      </button>

      {/* ✅ Chat Window */}
      <div className={`chat-window ${isOpen ? "open" : ""}`}>
        <div className="chat-header">
          <span>AI Diet Assistant</span>
          <button className="close-btn" onClick={() => setIsOpen(false)}>✖</button>
        </div>

        <div className="chat-body">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {loading && <div className="chat-message bot">Typing...</div>}
          <div ref={messagesEndRef}></div>
        </div>

        {/* ✅ Chat Input */}
        <div className="chat-input-container">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chatbot;
