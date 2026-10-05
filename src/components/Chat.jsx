import ChatView from '../features/chat/ChatView';

export default function Chat() {
    return (
        <>
            <div className="view-header">
                <h2 className="view-title">AI Nutritionist</h2>
                <p className="view-subtitle">Create your personalized diet plan</p>
            </div>
            <ChatView />
        </>
    );
}
