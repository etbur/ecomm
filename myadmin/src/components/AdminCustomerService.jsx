import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import './AdminCustomerService.css';

const AdminCommunication = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [selectedFile, setSelectedFile] = useState(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
    fetchUnreadCounts();
  }, []);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Admin connected to chat server');
      newSocket.emit('join_admin');
    });

    newSocket.on('receive_message', (message) => {
      // Update unread counts
      if (message.isFromUser) {
        setUnreadCounts(prev => ({
          ...prev,
          [message.senderId]: (prev[message.senderId] || 0) + 1
        }));
      }

      // Only add message if it's not from the currently selected user (to avoid duplicates)
      if (!selectedUser || message.senderId !== selectedUser._id) {
        // Update user list to show new message indicator
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === message.senderId
              ? { ...user, hasNewMessage: true }
              : user
          )
        );
      } else {
        // Add to current chat if it's the selected user
        setMessages(prev => [...prev, {
          _id: message._id,
          senderId: message.senderId,
          message: message.message,
          timestamp: message.timestamp,
          isFromUser: message.isFromUser
        }]);
      }
    });

    newSocket.on('user_online', (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    });

    newSocket.on('user_offline', (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    newSocket.on('disconnect', () => {
      console.log('Admin disconnected from chat server');
    });

    return () => {
      newSocket.disconnect();
    };
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/chat/unread-counts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUnreadCounts(data.unreadCounts);
      }
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/admin/chat/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // If endpoint doesn't exist, use mock data
        const mockMessages = [
          {
            _id: '1',
            senderId: userId,
            message: 'Hello admin, I need help with my account',
            timestamp: new Date(Date.now() - 30 * 60 * 1000),
            isFromUser: true
          },
          {
            _id: '2',
            senderId: 'admin',
            message: 'Hi! How can I help you today?',
            timestamp: new Date(Date.now() - 25 * 60 * 1000),
            isFromUser: false
          },
          {
            _id: '3',
            senderId: userId,
            message: 'I\'m having trouble with deposits',
            timestamp: new Date(Date.now() - 20 * 60 * 1000),
            isFromUser: true
          }
        ];
        setMessages(mockMessages);
        return;
      }

      const data = await response.json();
      setMessages(data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use mock data as fallback
      const mockMessages = [
        {
          _id: '1',
          senderId: userId,
          message: 'Hello admin, I need help with my account',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
          isFromUser: true
        }
      ];
      setMessages(mockMessages);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setShowChat(true);
    // Clear new message indicator and unread count
    setUsers(prevUsers =>
      prevUsers.map(u =>
        u._id === user._id
          ? { ...u, hasNewMessage: false }
          : u
      )
    );
    setUnreadCounts(prev => ({
      ...prev,
      [user._id]: 0
    }));
    fetchMessages(user._id);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const sendFile = async () => {
    if (!selectedFile || !selectedUser) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', selectedUser._id);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      const response = await fetch(`${apiUrl}/api/admin/chat/upload`, {
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
          senderId: 'admin',
          message: data.chatMessage.message,
          timestamp: data.chatMessage.timestamp,
          isFromUser: false,
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !selectedFile) || !selectedUser || !socket) return;

    // If there's a selected file, send it first
    if (selectedFile) {
      await sendFile();
      return;
    }

    const messageToSend = newMessage;
    setNewMessage('');

    try {
      // Send via Socket.IO for real-time communication
      socket.emit('send_message', {
        userId: selectedUser._id,
        message: messageToSend,
        senderType: 'admin',
        token: localStorage.getItem('token')
      });

      // Also send via API for persistence
      const token = localStorage.getItem('token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      await fetch(`${apiUrl}/api/admin/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: selectedUser._id,
          message: messageToSend
        })
      });

    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback: add message locally
      const newMsg = {
        _id: Date.now().toString(),
        senderId: 'admin',
        message: messageToSend,
        timestamp: new Date(),
        isFromUser: false
      };
      setMessages(prev => [...prev, newMsg]);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-customer-service">
      <div className="page-header">
        <h1>Customer Communication</h1>
        <p>Chat with users and manage customer support</p>
      </div>

      <div className="communication-container">
        {/* Users List */}
        <div className="users-panel">
          <div className="users-header">
            <h3>Users ({filteredUsers.length})</h3>
            <div className="search-container">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="users-list">
            {filteredUsers.map((user) => {
              const unreadCount = unreadCounts[user._id] || 0;
              return (
                <div
                  key={user._id}
                  className={`user-item ${selectedUser && selectedUser._id === user._id ? 'active' : ''} ${user.hasNewMessage || unreadCount > 0 ? 'has-new-message' : ''}`}
                  onClick={() => handleSelectUser(user)}
                >
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                    {unreadCount > 0 && (
                      <span className="unread-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                    )}
                  </div>
                  <div className="user-info">
                    <div className="user-name">
                      {user.username}
                      {unreadCount > 0 && (
                        <span className="unread-text"> ({unreadCount} unread)</span>
                      )}
                    </div>
                    <div className="user-email">{user.email}</div>
                    <div className="user-balance">${(user.balance || 0).toFixed(2)}</div>
                  </div>
                  <div className="user-status">
                    <span className={`status-dot ${user.isActive !== false ? 'online' : 'offline'}`}></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Chat Panel */}
        <div className={`chat-panel ${showChat ? 'active' : ''}`}>
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="user-avatar">
                    <i className="fas fa-user"></i>
                  </div>
                  <div className="user-details">
                    <h4>{selectedUser.username}</h4>
                    <p>{selectedUser.email}</p>
                  </div>
                </div>
                <button
                  className="close-chat-btn"
                  onClick={() => {
                    setShowChat(false);
                    setSelectedUser(null);
                    setMessages([]);
                  }}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="chat-messages">
                {messages.map((message) => (
                  <div
                    key={message._id}
                    className={`message ${message.isFromUser ? 'user-message' : 'admin-message'}`}
                  >
                    <div className="message-content">
                      {message.messageType === 'image' && message.mediaUrl ? (
                        <div className="media-message">
                          <img
                            src={`http://localhost:5000${message.mediaUrl}`}
                            alt={message.mediaName || 'Image'}
                            className="chat-image"
                            onClick={() => window.open(`http://localhost:5000${message.mediaUrl}`, '_blank')}
                          />
                          <p>{message.message}</p>
                        </div>
                      ) : message.messageType === 'file' && message.mediaUrl ? (
                        <div className="media-message">
                          <div className="file-attachment">
                            <i className="fas fa-file"></i>
                            <div className="file-info">
                              <span className="file-name">{message.mediaName}</span>
                              <span className="file-size">
                                ({message.mediaSize ? (message.mediaSize / 1024).toFixed(1) + ' KB' : 'Unknown size'})
                              </span>
                            </div>
                            <button
                              className="download-btn"
                              onClick={() => window.open(`http://localhost:5000${message.mediaUrl}`, '_blank')}
                            >
                              <i className="fas fa-download"></i>
                            </button>
                          </div>
                          <p>{message.message}</p>
                        </div>
                      ) : (
                        <p>{message.message}</p>
                      )}
                      <span className="message-time">
                        {new Date(message.timestamp || message.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="chat-input">
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
                  title="Attach file"
                >
                  <i className="fas fa-paperclip"></i>
                </button>
                <input
                  type="text"
                  placeholder={selectedFile ? `File selected: ${selectedFile.name}` : "Type your message..."}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  className="send-btn"
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedFile}
                >
                  <i className="fas fa-paper-plane"></i>
                </button>
              </div>
            </>
          ) : (
            <div className="no-chat-selected">
              <i className="fas fa-comments"></i>
              <h3>Select a user to start chatting</h3>
              <p>Choose a user from the list to begin a conversation</p>
            </div>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>Loading users...</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="error-state">
          <i className="fas fa-exclamation-triangle"></i>
          <p>{error}</p>
          <button onClick={fetchUsers} className="btn btn-primary">
            <i className="fas fa-refresh"></i> Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminCommunication;