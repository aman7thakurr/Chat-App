import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

let socket;

const Chat = () => {
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const messagesEndRef = useRef(null);
    const socketRef = useRef();

    useEffect(() => {
        socketRef.current = io('https://chat-app-yl81.onrender.com');

        socketRef.current.on('message', (message) => {
            setMessages((prevMessages) => [...prevMessages, message]);
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        });

        return () => {
            socketRef.current.disconnect();
            socketRef.current.off('message');
        };
    }, []);

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const sendMessage = () => {
        if (currentMessage.trim()) {
            const messageData = {
                id: socketRef.current.id,
                message: currentMessage,
                time: Date.now(),
            };
            socketRef.current.emit('sendMessage', messageData);
            setMessages((prevMessages) => [...prevMessages, messageData]);
            setCurrentMessage('');
        }
    };

    return (
        <div className='flex flex-col h-screen bg-gray-100'>
            
            <div className='flex-1 overflow-y-auto p-4'>
                {messages.map((msg, index) => (
                <>    <div key={index} className={`mt-4 p-1 rounded-lg shadow-md whitespace-pre-wrap break-words overflow-hidden h-auto ${msg.id === socketRef.current.id ? 'bg-blue-500 text-white self-end' : 'bg-gray-200 text-black self-start'}`}>
                     
                        <strong>{msg.id === socketRef.current.id ? 'You' : 'Friend'}:</strong> {msg.message}
                        <p className='text-gray-500 mt-1  text-right'>{formatTime(msg.time)}</p>
                    </div>
                    
                    </>
                ))}
                <div ref={messagesEndRef} />
            </div>

           
            <div className='p-4 bg-white border-t flex flex-col items-center text-black border-gray-200'>
                <input
                    type="text"
                    value={currentMessage}
                    className='w-full p-3 border rounded-lg'
                    placeholder='Type a message...'
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    onClick={sendMessage}
                    disabled={!currentMessage.trim()}
                    className='ml-2 px-4 py-2 text-white mt-2 bg-blue-500 rounded-lg disabled:opacity-50 w-[90%]'
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;
