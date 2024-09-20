import React, { useState, useEffect, useRef } from 'react';
import './Component.css';
import { VscAccount } from "react-icons/vsc";
import { IoIosSend } from "react-icons/io";
import { useAuth } from './AuthContext'; // Import useAuth hook
import { MdDelete } from "react-icons/md";

// Helper function to format time
const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export default function Component() {
    const { user, logout } = useAuth(); // Access authentication state and logout function
    const [messages, setMessages] = useState([]); // Initialize as an empty array
    const [userMessage, setUserMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false); // State for loading
    const [prompts, setPrompts] = useState([]); // State to store prompts
    const [loadingPrompts, setLoadingPrompts] = useState(false); // State for loading prompts
    const [error, setError] = useState(null); // State for error handling
    const chatEndRef = useRef(null);

    // Scroll to the bottom when a new message is added
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages]);

    // Fetch prompts when the component mounts
    useEffect(() => {
        const fetchPrompts = async () => {
            setLoadingPrompts(true);
            try {
                const email = encodeURIComponent(localStorage.getItem('email')); // Retrieve email from local storage
                const response = await fetch('https://chat-server-ybac.onrender.com/get-prompts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email }),
                });
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const data = await response.json();
                setPrompts(data.prompts);
            } catch (error) {
                console.error('Error fetching prompts:', error);
                setError('Error fetching prompts.');
            } finally {
                setLoadingPrompts(false);
            }
        };

        fetchPrompts();
    }, [user],);

    // Handle input submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            alert("You need to log in to send messages.");
            return;
        }
        if (userMessage.trim() === '' || isLoading) return; // Prevent submit if loading

        const currentTime = new Date();
        const newMessages = [...messages, { type: 'user', text: userMessage, time: formatTime(currentTime) }];
        setMessages(newMessages);
        setUserMessage('');
        setIsLoading(true);

        try {
            const aiResponse = await fetchAiResponse(userMessage);
            const aiResponseTime = new Date();
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: 'ai', text: aiResponse, time: formatTime(aiResponseTime) }
            ]);
        } catch (error) {
            console.error('Error fetching AI response:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { type: 'ai', text: "Sorry, there was an error.", time: formatTime(new Date()) }
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    // Fetch AI response from local server
    const fetchAiResponse = async (message) => {
        try {
            const email = encodeURIComponent(localStorage.getItem('email')); // Retrieve email from local storage
            const response = await fetch('https://chat-server-ybac.onrender.com/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, prompt: message }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            return data.text || "AI couldn't generate a response.";
        } catch (error) {
            console.error('Error fetching AI response:', error);
            return "Sorry, there was an error.";
        }
    };

    // Handle logout
    const handleLogout = async () => {
        try {
            await fetch('https://chat-server-ybac.onrender.com/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Pass the token if needed
                },
            });
            logout(); // Clear user data in context
        } catch (error) {
            console.error('Logout error:', error);
            alert('An error occurred while logging out. Please try again.');
        }
    };

    // Delete a prompt
    const handleDeletePrompt = async (index) => {
        try {
            const email = encodeURIComponent(localStorage.getItem('email')); // Retrieve email from local storage
            const response = await fetch('https://chat-server-ybac.onrender.com/delete-prompt', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, index }),
            });
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();
            setPrompts(data.prompts); // Update prompts state
            alert('Prompt deleted successfully.');
        } catch (error) {
            console.error('Error deleting prompt:', error);
            alert('Error deleting prompt.');
        }
    };

    if (!user) {
        return <div>Please log in to access the chat.</div>;
    }

    return (
        <div className="app-container">
            <div className="sidebar">
                <button className="new-chat-button">
                    <span className="icon">+</span> New Chat
                </button>
                <div className="prompts-area">
                    <h2>Your Prompts</h2>
                    {loadingPrompts ? (
                        <div>Loading prompts...</div>
                    ) : error ? (
                        <div>{error}</div>
                    ) : (
                        <ul>
                            {prompts.length > 0 ? (
                                prompts.map((prompt, index) => (
                                    <li key={index}>
                                        <div dangerouslySetInnerHTML={{ __html: prompt }} />
                                        <button onClick={() => handleDeletePrompt(index)}><MdDelete /></button>
                                    </li>
                                ))
                            ) : (
                                <div>No prompts found</div>
                            )}
                        </ul>
                    )}
                </div>
                <div className="user-info">
                    <div className="avatar">
                        <VscAccount className="message-icon" />
                    </div>
                    
                    <div className="user-details">
                        <span>Welcome back,</span>
                        <span className="user-name">{user.name || 'User'}</span>
                    </div>
                </div>
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>

            <div className="chat-area">
                <div className="chat-scroll-area">
                    {messages.length > 0 ? (
                        messages.map((msg, index) => (
                            <div key={index} className={`message-row ${msg.type}-message`}>
                                <div className="message-bubble">
                                    <div className="message-header">
                                        <VscAccount className="message-icon" />
                                        <span className="message-sender">{msg.type === 'user' ? 'User' : 'AI'}</span>
                                        <span className="message-time">{msg.time}</span>
                                    </div>
                                    <div className="message-text">
                                        <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div>No messages yet</div>
                    )}
                    {isLoading && (
                        <div className="message-row ai-message">
                            <div className="message-bubble loading-message">
                                <div className="message-text">AI is typing...</div>
                            </div>
                        </div>
                    )}
                    <div ref={chatEndRef}></div>
                </div>

                <form className="message-input-area" onSubmit={handleSubmit}>
                    <div className="input-wrapper">
                        <input
                            className="message-input"
                            placeholder="Type a new message here"
                            value={userMessage}
                            onChange={(e) => setUserMessage(e.target.value)}
                            disabled={isLoading}
                        />
                        <button type="submit" className="icon-button" disabled={isLoading} aria-label="Send message">
                            <IoIosSend />
                        </button>
                    </div>
                </form>
            </div>

            
        </div>
    );
}
