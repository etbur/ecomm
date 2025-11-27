import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import io from 'socket.io-client';
import './Chatbot.css';

const Chatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: 'Hello! How can I help you today?', sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [hasNewMessages, setHasNewMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && user) {
      fetchMessages();
      fetchUnreadCount();
    }
  }, [isOpen, user]);

  useEffect(() => {
    if (user) {
      const newSocket = io('http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        console.log('Connected to chat server');
        newSocket.emit('join_chat', user.id);
      });

      newSocket.on('receive_message', (message) => {
        if (message.senderId !== user.id) { // Don't show own messages twice
          setMessages(prev => [...prev, {
            text: message.message,
            sender: 'bot',
            timestamp: message.timestamp,
            _id: message._id,
            messageType: message.messageType,
            mediaUrl: message.mediaUrl,
            mediaName: message.mediaName,
            mediaSize: message.mediaSize
          }]);
          setHasNewMessages(true);
          setUnreadCount(prev => prev + 1);
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from chat server');
      });

      return () => {
        newSocket.disconnect();
      };
    }
  }, [user]);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/user/chat/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map(msg => ({
            text: msg.message,
            sender: msg.isFromUser ? 'user' : 'bot',
            timestamp: msg.timestamp || msg.createdAt,
            messageType: msg.messageType,
            mediaUrl: msg.mediaUrl,
            mediaName: msg.mediaName,
            mediaSize: msg.mediaSize
          })));
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Keep default messages if API fails
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/user/chat/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewMessages(false); // Clear notification when opening
      setUnreadCount(0); // Clear unread count when opening
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const sendFile = async () => {
    if (!selectedFile || !user) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/user/chat/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        // Add file message to local state
        setMessages(prev => [...prev, {
          _id: data.chatMessage._id,
          text: data.chatMessage.message,
          sender: 'user',
          timestamp: data.chatMessage.timestamp,
          messageType: data.chatMessage.messageType,
          mediaUrl: data.chatMessage.mediaUrl,
          mediaName: data.chatMessage.mediaName,
          mediaSize: data.chatMessage.mediaSize
        }]);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setSelectedFile(null);
      setIsLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const sendMessage = async () => {
    if ((!input.trim() && !selectedFile) || !user || !socket) return;

    // If there's a selected file, send it first
    if (selectedFile) {
      await sendFile();
      return;
    }

    const userMessage = { text: input, sender: 'user', timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input;
    setInput('');
    setIsLoading(true);

    try {
      // Send via Socket.IO for real-time communication
      socket.emit('send_message', {
        userId: user.id,
        message: messageToSend,
        senderType: 'user',
        token: localStorage.getItem('token')
      });

      // Also send via API for persistence
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await fetch(`${apiUrl}/api/user/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageToSend
        })
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: add message locally
      setTimeout(() => {
        setMessages(prev => [...prev, {
          text: 'Thank you for your message. Our customer service team will get back to you soon!',
          sender: 'bot',
          timestamp: new Date()
        }]);
      }, 1000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      sendMessage();
    }
  };

  return (
    <>
      {/* Chatbot Button */}
      <div className="chatbot-button" onClick={toggleChat}>
        <i className="fas fa-comments"></i>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
        {hasNewMessages && unreadCount === 0 && <span className="notification-dot"></span>}
        {unreadCount > 0 && (
          <span className="unread-text-mobile">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <h4>Customer Service</h4>
            <button className="close-btn" onClick={toggleChat}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div key={msg._id || index} className={`message ${msg.sender}`}>
                <div className="message-content">
                  {msg.messageType === 'image' && msg.mediaUrl ? (
                    <div className="media-message">
                      <img
                        src={`http://localhost:5000${msg.mediaUrl}`}
                        alt={msg.mediaName || 'Image'}
                        className="chat-image"
                        onClick={() => window.open(`http://localhost:5000${msg.mediaUrl}`, '_blank')}
                      />
                      <p>{msg.text}</p>
                    </div>
                  ) : msg.messageType === 'file' && msg.mediaUrl ? (
                    <div className="media-message">
                      <div className="file-attachment">
                        <i className="fas fa-file"></i>
                        <div className="file-info">
                          <span className="file-name">{msg.mediaName}</span>
                          <span className="file-size">
                            ({msg.mediaSize ? (msg.mediaSize / 1024).toFixed(1) + ' KB' : 'Unknown size'})
                          </span>
                        </div>
                        <button
                          className="download-btn"
                          onClick={() => window.open(`http://localhost:5000${msg.mediaUrl}`, '_blank')}
                        >
                          <i className="fas fa-download"></i>
                        </button>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ) : (
                    <p>{msg.text}</p>
                  )}
                  {msg.timestamp && (
                    <span className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="chatbot-input">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              style={{ display: 'none' }}
            />
            <button
              className="file-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
              title="Attach file"
            >
              <i className="fas fa-paperclip"></i>
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type your message..."}
              disabled={isLoading}
            />
            <button onClick={sendMessage} disabled={(!input.trim() && !selectedFile) || isLoading}>
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;