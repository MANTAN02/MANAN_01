import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../AuthContext';
import { callBackendFunction } from '../AuthContext';
import { useToast } from '../ToastContext';

const ChatSystem = ({ swapId, otherUserId, onClose }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (swapId && otherUserId) {
      initializeChat();
      fetchOtherUser();
    }
  }, [swapId, otherUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = async () => {
    try {
      setLoading(true);
      // Get existing chat or create new one
      const chatResponse = await callBackendFunction('getChatMessages', 'GET', {}, `?swapId=${swapId}`);
      if (chatResponse.chatId) {
        setChatId(chatResponse.chatId);
        setMessages(chatResponse.messages || []);
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOtherUser = async () => {
    try {
      const userData = await callBackendFunction('getUserProfile', 'GET', {}, `?userId=${otherUserId}`);
      setOtherUser(userData);
    } catch (error) {
      console.error('Error fetching other user:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() && !fileInputRef.current?.files?.length) return;

    try {
      setLoading(true);
      const attachments = [];
      
      // Handle file uploads
      if (fileInputRef.current?.files?.length) {
        for (let file of fileInputRef.current.files) {
          // Upload file to Firebase Storage
          const fileUrl = await uploadFile(file);
          attachments.push({
            name: file.name,
            url: fileUrl,
            type: file.type,
            size: file.size
          });
        }
      }

      const messageData = {
        chatId,
        receiverId: otherUserId,
        text: newMessage.trim(),
        messageType: attachments.length > 0 ? 'file' : 'text',
        attachments
      };

      const response = await callBackendFunction('sendChatMessage', 'POST', messageData);
      
      setMessages(prev => [...prev, response.message]);
      setNewMessage('');
      fileInputRef.current.value = '';
      
      showToast('Message sent', 'success');
    } catch (error) {
      showToast('Error sending message', 'error');
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    // This would integrate with Firebase Storage
    // For now, return a placeholder URL
    return `https://storage.googleapis.com/swapin-files/${Date.now()}_${file.name}`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[600px] flex flex-col">
        {/* Chat Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-primary-600 font-semibold">
                {otherUser?.displayName?.charAt(0) || 'U'}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {otherUser?.displayName || 'User'}
              </h3>
              <p className="text-sm text-gray-500">
                {otherUser?.isVerified ? '✓ Verified' : 'Unverified'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <svg className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
              </svg>
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    message.senderId === user?.uid
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {/* Message Text */}
                  {message.text && (
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                  )}
                  
                  {/* File Attachments */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {message.attachments.map((attachment, index) => (
                        <div key={index} className="bg-white bg-opacity-20 rounded p-2">
                          <div className="flex items-center space-x-2">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
                            </svg>
                            <a
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm underline hover:no-underline"
                            >
                              {attachment.name}
                            </a>
                            <span className="text-xs opacity-75">
                              ({formatFileSize(attachment.size)})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Message Time */}
                  <div className={`text-xs mt-1 ${
                    message.senderId === user?.uid ? 'text-primary-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.createdAt)}
                    {message.isRead && message.senderId === user?.uid && (
                      <span className="ml-1">✓</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end space-x-2">
            <div className="flex-1">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                rows="2"
                disabled={loading}
              />
            </div>
            
            {/* File Upload Button */}
            <button
              onClick={handleFileSelect}
              disabled={loading}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Attach file"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/>
              </svg>
            </button>
            
            {/* Send Button */}
            <button
              onClick={sendMessage}
              disabled={loading || (!newMessage.trim() && !fileInputRef.current?.files?.length)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                </svg>
              )}
            </button>
          </div>
          
          {/* File Input (Hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={() => {
              // File selection handled in sendMessage
            }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          
          {/* File Preview */}
          {fileInputRef.current?.files?.length > 0 && (
            <div className="mt-2 p-2 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Attachments:</p>
              <div className="space-y-1">
                {Array.from(fileInputRef.current.files).map((file, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{file.name}</span>
                    <span className="text-gray-500">{formatFileSize(file.size)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatSystem; 