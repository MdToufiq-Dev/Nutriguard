import { useState } from 'react';
import ChatView from '../features/chat/ChatView';
import AICoachChat from './AICoachChat';

export default function Chat() {
    const [activeTab, setActiveTab] = useState('plan'); // 'plan' | 'coach'

    return (
        <>
            <div className="view-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                <div>
                    <h2 className="view-title">AI Nutritionist</h2>
                    <p className="view-subtitle">
                        {activeTab === 'plan' ? 'Create your personalized 7-day diet plan' : 'Chat in real-time with your nutrition coach'}
                    </p>
                </div>

                <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.06)', padding: '4px', borderRadius: '10px' }}>
                    <button
                        onClick={() => setActiveTab('plan')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: activeTab === 'plan' ? 'var(--accent, #10b981)' : 'transparent',
                            color: activeTab === 'plan' ? '#fff' : 'var(--text-secondary)'
                        }}
                    >
                        New Diet Plan
                    </button>
                    <button
                        onClick={() => setActiveTab('coach')}
                        style={{
                            padding: '8px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            background: activeTab === 'coach' ? 'var(--accent, #10b981)' : 'transparent',
                            color: activeTab === 'coach' ? '#fff' : 'var(--text-secondary)'
                        }}
                    >
                        AI Coach Chat
                    </button>
                </div>
            </div>

            {activeTab === 'plan' ? <ChatView /> : <AICoachChat />}
        </>
    );
}
