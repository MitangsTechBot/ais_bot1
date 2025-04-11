import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, LogOut } from 'lucide-react';
import ChatMessage from './ChatMessage';
import { Message } from '../types';
import { fetchSpreadsheetData } from '../utils/spreadsheet';
import { queryAI } from '../utils/ai';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I can help you find pricing information. What would you like to know?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const { user, signOut, isAdmin } = useAuth();

  useEffect(() => {
    const loadProductData = async () => {
      try {
        const data = await fetchSpreadsheetData();
        setProductData(data);
      } catch (err) {
        setError('Failed to load product data. Please try again later.');
        console.error('Error loading product data:', err);
      }
    };

    loadProductData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const aiResponse = await queryAI(
        messages.concat(userMessage),
        productData
      );
      
      const newMessage = {
        role: 'assistant',
        content: aiResponse
      };

      setMessages(prev => [...prev, newMessage]);

      // Store the message in Supabase
      if (user) {
        await supabase.from('chat_messages').insert([
          {
            user_id: user.id,
            message: userMessage.content,
            ai_response: aiResponse
          }
        ]);
      }
    } catch (err) {
      setError('Failed to get a response. Please try again.');
      console.error('Error getting AI response:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Price List Chatbot</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAdmin && (
              <a
                href="/admin"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Admin Dashboard
              </a>
            )}
            <button
              onClick={() => signOut()}
              className="flex items-center gap-1 text-gray-600 hover:text-gray-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-2 rounded-lg">
                {error}
              </div>
            )}
            {messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-gray-500">
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Input Form */}
      <footer className="bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about pricing..."
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </footer>
    </div>
  );
}