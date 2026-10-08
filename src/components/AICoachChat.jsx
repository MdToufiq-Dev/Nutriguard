import React, { useState, useEffect, useRef } from 'react';
import * as api from '../services/api';

export default function AICoachChat({ meals = [], totalCalories = 0 }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: `Hello! I'm your NutriGuard AI Nutritionist. ${
        totalCalories > 0 ? `You have logged ${totalCalories} kcal today.` : 'How can I assist you with your diet and nutrition goals today?'
      }`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const updatedMessages = [...messages, { role: 'user', text: userText }];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Try backend LLM chat endpoint
      const formattedForApi = updatedMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.text
      }));

      const res = await api.post('/chat', { messages: formattedForApi });
      const reply = res?.content || res?.message || res?.response || res?.text;

      if (reply) {
        setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
        setLoading(false);
        return;
      }
    } catch (err) {
      console.warn('Backend chat fallback to local assistant:', err);
    }

    // Local fallback responses
    setTimeout(() => {
      const lower = userText.toLowerCase();
      let aiReply = "That's a great question! For sustainable nutrition, focus on whole foods, lean proteins, high fiber, and staying hydrated throughout the day.";

      if (lower.includes('protein') || lower.includes('muscle')) {
        aiReply = "To optimize protein intake, aim for 1.6-2.2g per kg of bodyweight. Great sources include chicken breast, Greek yogurt, eggs, salmon, tofu, and lentils.";
      } else if (lower.includes('weight loss') || lower.includes('deficit') || lower.includes('cut')) {
        aiReply = `For healthy fat loss, aim for a moderate 300-500 kcal daily deficit. Prioritize protein to preserve lean muscle and high-volume vegetables to stay full.`;
      } else if (lower.includes('keto') || lower.includes('carb')) {
        aiReply = "On a keto diet, keep net carbs under 20-50g daily while increasing healthy fats (avocado, olive oil, nuts) and maintaining moderate protein.";
      } else if (lower.includes('snack') || lower.includes('hungry')) {
        aiReply = "Healthy snack ideas: apple with peanut butter, a handful of almonds, boiled eggs, cottage cheese with berries, or roasted edamame.";
      }

      setMessages(prev => [...prev, { role: 'assistant', text: aiReply }]);
      setLoading(false);
    }, 500);
  };

  return (
    <div
      style={{
        background: 'var(--card-bg, #1e293b)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '450px',
        maxWidth: '720px',
        margin: '0 auto'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--accent, #10b981)' }}></span>
          <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)' }}>
            NutriGuard AI Coach
          </h3>
        </div>
        <span
          style={{
            fontSize: '11px',
            backgroundColor: 'rgba(16, 185, 129, 0.15)',
            color: 'var(--accent, #10b981)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '2px 8px',
            borderRadius: '12px'
          }}
        >
          Active
        </span>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          maxHeight: '340px',
          padding: '12px',
          borderRadius: '12px',
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
          marginBottom: '16px'
        }}
      >
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div key={index} style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  fontSize: '14px',
                  lineHeight: '1.5',
                  background: isUser ? 'var(--accent, #10b981)' : 'rgba(255, 255, 255, 0.08)',
                  color: isUser ? '#ffffff' : 'var(--text-primary)',
                  borderTopRightRadius: isUser ? '2px' : '14px',
                  borderTopLeftRadius: isUser ? '14px' : '2px',
                  border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.06)'
                }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '14px',
                fontSize: '13px',
                color: 'var(--text-muted)',
                background: 'rgba(255, 255, 255, 0.05)'
              }}
            >
              NutriGuard is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Ask for nutrition tips, meal recommendations, macros..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          style={{
            flex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '10px',
            padding: '10px 14px',
            fontSize: '14px',
            color: 'var(--text-primary)',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !input.trim()}
          style={{ padding: '0 20px', whiteSpace: 'nowrap' }}
        >
          Send
        </button>
      </form>
    </div>
  );
}
