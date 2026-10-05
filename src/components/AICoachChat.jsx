import React, { useState } from 'react';

export default function AICoachChat({ meals, totalCalories }) {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: `Hello! I'm your NutriGuard AI Nutritionist. You have consumed ${totalCalories} kcal today. How can I help optimize your diet?` }
  ]);
  const [input, setInput] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');

    setTimeout(() => {
      let aiReply = "That sounds like a balanced choice! Make sure you drink enough water to stay hydrated.";
      const lower = userMessage.toLowerCase();
      if (lower.includes('protein') || lower.includes('muscle')) {
        aiReply = "To support muscle recovery, try adding Greek yogurt, lean chicken breast, or plant-based tofu to your upcoming meals.";
      } else if (lower.includes('weight loss') || lower.includes('deficit')) {
        aiReply = `You're currently at ${totalCalories} kcal. Keeping high-fiber vegetables and lean protein sources will help you feel full while staying in a deficit.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          NutriGuard AI Coach
        </h2>
        <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">Online</span>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 max-h-64 pr-2 mb-4 bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-emerald-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700/60'}`}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input 
          type="text"
          placeholder="Ask for diet advice, macro tips..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
        />
        <button 
          type="submit"
          className="bg-teal-600 hover:bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-semibold transition"
        >
          Send
        </button>
      </form>
    </div>
  );
}