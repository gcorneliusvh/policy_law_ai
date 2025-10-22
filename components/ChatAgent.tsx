import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, startChat } from '../services/geminiService';
import type { Contract, FullAnalysis } from '../types';

interface ChatAgentProps {
  // Pass the full analysis to provide complete context
  analysis: FullAnalysis; 
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

const ChatAgent: React.FC<ChatAgentProps> = ({ analysis, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize the chat with the full analysis context
    startChat(analysis);
    setMessages([
      { sender: 'agent', text: "Hello! I have full context on the generated analysis. How can I help you explore the data?" }
    ]);
  }, [analysis]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const responseText = await sendMessage(input);
      const agentMessage: Message = { sender: 'agent', text: responseText };
      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'agent', text: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    // Chat window is positioned via the parent `App.tsx` component logic now
    // This component is only responsible for its own layout
    <div className="fixed bottom-20 left-4 w-96 h-[600px] bg-card shadow-2xl rounded-lg flex flex-col z-50">
      <div className="flex justify-between items-center p-4 bg-primary text-primary-foreground rounded-t-lg">
        <h3 className="text-lg font-bold">Policy Analysis Agent</h3>
        <button onClick={onClose} className="text-2xl font-bold">&times;</button>
      </div>

      <div className="flex-1 p-4 overflow-y-auto bg-background">
        {messages.map((msg, index) => (
          <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-lg ${msg.sender === 'user' ? 'bg-accent text-accent-foreground' : 'bg-muted'}`}>
              <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
             <div className="max-w-[80%] p-3 rounded-lg bg-muted">
                <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-text rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-2 h-2 bg-text rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-2 h-2 bg-text rounded-full animate-bounce"></div>
                </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the policies..."
            className="flex-1 p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-accent bg-input text-text"
            disabled={isLoading}
          />
          <button
            onClick={handleSend}
            disabled={isLoading}
            className="px-4 py-2 bg-accent text-accent-foreground font-bold rounded-r-md disabled:bg-muted disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAgent;
