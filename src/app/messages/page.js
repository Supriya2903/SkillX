'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Search, Phone, Video, MoreHorizontal, Paperclip,
  Smile, ArrowLeft, Users, MessageCircle, Clock, CheckCheck,
  X, Plus, Trash2, Edit3
} from 'lucide-react';

export default function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [typing, setTyping] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastSeen, setLastSeen] = useState({});
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const selectedUserId = searchParams.get('user');

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchUserAndConversations();
  }, [router]);

  useEffect(() => {
    const preload = async () => {
      if (!selectedUserId || conversations.length === 0) return;
      
      // If conversation already exists in list
      const existing = conversations.find(c => c.participant._id === selectedUserId);
      if (existing) {
        setSelectedConversation(existing);
        fetchMessages(selectedUserId);
        return;
      }
      
      // Otherwise fetch participant info and create a temporary conversation row
      try {
        const res = await fetch(`/api/messages?userId=${selectedUserId}`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (data.participant) {
            const tempConv = {
              _id: `temp-${data.participant._id}`,
              participant: data.participant,
              lastMessage: null,
              unreadCount: 0
            };
            setConversations(prev => {
              // Check again to avoid duplicates
              const stillExists = prev.find(c => c.participant._id === selectedUserId);
              if (stillExists) return prev;
              return [tempConv, ...prev];
            });
            setSelectedConversation(tempConv);
          }
        }
      } catch (e) {
        console.error('Failed to preload participant', e);
      }
    };
    preload();
  }, [selectedUserId, conversations]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [newMessage]);

  // Real-time polling for new messages
  useEffect(() => {
    if (!selectedConversation) return;
    
    const interval = setInterval(() => {
      fetchMessages(selectedConversation.participant._id);
    }, 3000); // Poll every 3 seconds
    
    return () => clearInterval(interval);
  }, [selectedConversation]);

  // Poll for conversation updates
  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserAndConversations();
    }, 5000); // Poll every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchUserAndConversations = async () => {
    try {
      // Fetch current user
      const userRes = await fetch('/api/profile', {
        credentials: 'include'
      });
      if (userRes.ok) {
        const userData = await userRes.json();
        setUser(userData.user);
      }

      // Fetch conversations
      const conversationsRes = await fetch('/api/messages', {
        credentials: 'include'
      });
      if (conversationsRes.ok) {
        const convData = await conversationsRes.json();
        setConversations(convData.conversations || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const res = await fetch(`/api/messages?userId=${userId}`, {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        // Mark messages as read
        await fetch('/api/messages', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ senderId: userId })
        });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    setSendingMessage(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          receiverId: selectedConversation.participant._id,
          content: newMessage,
          messageType: 'text'
        })
      });

      if (res.ok) {
        setNewMessage('');
        // Refresh messages
        fetchMessages(selectedConversation.participant._id);
        // Refresh conversations to update last message
        fetchUserAndConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleTyping = () => {
    setTyping(true);
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => setTyping(false), 1000);
  };

  const isUserOnline = (userId) => {
    return onlineUsers.has(userId);
  };

  const getLastSeenText = (userId) => {
    if (isUserOnline(userId)) return 'Online';
    if (lastSeen[userId]) {
      const lastSeenDate = new Date(lastSeen[userId]);
      const now = new Date();
      const diffMs = now - lastSeenDate;
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);
      
      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return 'Yesterday';
      return lastSeenDate.toLocaleDateString();
    }
    return 'Last seen recently';
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date) => {
    const messageDate = new Date(date);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading messages...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white shadow-sm overflow-hidden h-[calc(100vh-80px)]">
            <div className="flex h-full">
              
              {/* Conversations List */}
              <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200 flex flex-col bg-white`}>
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal className="h-5 w-5 text-gray-600" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit3 className="h-5 w-5 text-gray-600" />
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border-0 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none text-sm"
                    />
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto">
                  {filteredConversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                      <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                      <p className="text-lg font-medium mb-2">No conversations yet</p>
                      <p className="text-sm text-center px-4">Start connecting with other users to begin messaging!</p>
                    </div>
                  ) : (
                    <div className="">
                      {filteredConversations.map((conversation, index) => (
                        <motion.div
                          key={conversation._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            fetchMessages(conversation.participant._id);
                          }}
                          className={`flex items-center p-4 cursor-pointer transition-colors border-b border-gray-50 hover:bg-gray-50 ${
                            selectedConversation?.participant._id === conversation.participant._id
                              ? 'bg-blue-50 border-blue-100'
                              : ''
                          }`}
                        >
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                              {conversation.participant.avatar ? (
                                <img 
                                  src={conversation.participant.avatar} 
                                  alt={conversation.participant.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-white font-semibold text-lg">
                                  {conversation.participant.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                            {isUserOnline(conversation.participant._id) && (
                              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="ml-3 flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate text-base">
                                {conversation.participant.name}
                              </h3>
                              <div className="flex items-center space-x-1">
                                {conversation.lastMessage && (
                                  <span className="text-xs text-gray-500">
                                    {formatTime(conversation.lastMessage.createdAt)}
                                  </span>
                                )}
                                {conversation.unreadCount > 0 && (
                                  <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs font-medium">
                                      {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-600 truncate flex-1">
                                {conversation.lastMessage ? (
                                  <>
                                    {conversation.lastMessage.sender === user?._id && (
                                      <span className="mr-1">You:</span>
                                    )}
                                    {conversation.lastMessage.content}
                                  </>
                                ) : (
                                  <span className="text-gray-400 italic">Start a conversation</span>
                                )}
                              </p>
                              {conversation.lastMessage?.sender === user?._id && (
                                <CheckCheck className={`h-4 w-4 ml-2 flex-shrink-0 ${
                                  conversation.lastMessage.isRead ? 'text-blue-500' : 'text-gray-400'
                                }`} />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Chat Area */}
              <div className={`${selectedConversation ? 'block' : 'hidden lg:block'} flex-1 flex flex-col`}>
                {selectedConversation ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-4 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="lg:hidden mr-3 p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-full hover:bg-gray-100"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center mr-3">
                            {selectedConversation.participant.avatar ? (
                              <img 
                                src={selectedConversation.participant.avatar} 
                                alt={selectedConversation.participant.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {selectedConversation.participant.name.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedConversation.participant.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              {typing ? (
                                <span className="text-green-600 font-medium">Typing...</span>
                              ) : (
                                getLastSeenText(selectedConversation.participant._id)
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-1">
                          <button className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                            <Video className="h-5 w-5" />
                          </button>
                          <button className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                            <Phone className="h-5 w-5" />
                          </button>
                          <button className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3" 
                         style={{
                           backgroundImage: `url("data:image/svg+xml,%3csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='grain' patternUnits='userSpaceOnUse' width='100' height='100'%3e%3cimage href='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==' width='100' height='100' opacity='0.03'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grain)'/%3e%3c/svg%3e")`,
                           backgroundColor: '#f0f2f5'
                         }}>
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle className="h-12 w-12 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2 text-gray-700">Start a conversation with {selectedConversation.participant.name}</h3>
                          <p className="text-gray-500 text-center max-w-md">
                            Send a message to begin your skill exchange journey together.
                          </p>
                        </div>
                      ) : (
                        <>
                          <AnimatePresence>
                            {[...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index, arr) => {
                              const isOwnMessage = message.sender._id === user?._id;
                              const prev = index > 0 ? arr[index - 1] : null;
                              const showDate = !prev || formatDate(prev.createdAt) !== formatDate(message.createdAt);
                              const showSenderChange = !prev || prev.sender._id !== message.sender._id;
                              
                              return (
                                <div key={message._id}>
                                  {showDate && (
                                    <motion.div 
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      className="flex justify-center my-6"
                                    >
                                      <span className="bg-white/80 text-gray-600 text-xs px-3 py-1.5 rounded-full shadow-sm border">
                                        {formatDate(message.createdAt)}
                                      </span>
                                    </motion.div>
                                  )}
                                  
                                  <motion.div
                                    initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex items-end space-x-2 mb-1 ${
                                      isOwnMessage ? 'justify-end' : 'justify-start'
                                    }`}
                                  >
                                    {!isOwnMessage && showSenderChange && (
                                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                                        {message.sender.avatar ? (
                                          <img 
                                            src={message.sender.avatar} 
                                            alt={message.sender.name}
                                            className="w-8 h-8 rounded-full object-cover"
                                          />
                                        ) : (
                                          <span className="text-white text-xs font-medium">
                                            {message.sender.name.charAt(0).toUpperCase()}
                                          </span>
                                        )}
                                      </div>
                                    )}
                                    {!isOwnMessage && !showSenderChange && <div className="w-8" />}
                                    
                                    <div className={`group relative max-w-xs sm:max-w-md lg:max-w-lg`}>
                                      <div className={`px-3 py-2 rounded-2xl shadow-sm ${
                                        isOwnMessage
                                          ? 'bg-blue-500 text-white rounded-br-md'
                                          : 'bg-white text-gray-800 rounded-bl-md border'
                                      }`}>
                                        <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                          {message.content}
                                        </p>
                                      </div>
                                      
                                      <div className={`flex items-center mt-1 space-x-1 opacity-70 ${
                                        isOwnMessage ? 'justify-end' : 'justify-start'
                                      }`}>
                                        <span className="text-xs text-gray-500">
                                          {formatTime(message.createdAt)}
                                        </span>
                                        {isOwnMessage && (
                                          <CheckCheck className={`h-3 w-3 ${
                                            message.isRead ? 'text-blue-500' : 'text-gray-400'
                                          }`} />
                                        )}
                                      </div>
                                    </div>
                                  </motion.div>
                                </div>
                              );
                            })}
                          </AnimatePresence>
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-4 border-t border-gray-200 bg-white">
                      <div className="flex items-end space-x-3">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                          <Plus className="h-5 w-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <div className="bg-gray-100 rounded-3xl px-4 py-2 flex items-center space-x-2">
                            <textarea
                              ref={textareaRef}
                              value={newMessage}
                              onChange={(e) => {
                                setNewMessage(e.target.value);
                                handleTyping();
                              }}
                              onKeyPress={handleKeyPress}
                              placeholder="Type a message"
                              className="flex-1 bg-transparent border-none outline-none resize-none text-sm max-h-20"
                              rows="1"
                            />
                            <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                              <Smile className="h-5 w-5" />
                            </button>
                            {!newMessage.trim() && (
                              <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
                                <Paperclip className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                        
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="p-2.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {sendingMessage ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <Send className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-500 bg-gray-50">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-8">
                      <MessageCircle className="h-16 w-16 text-gray-400" />
                    </div>
                    <h2 className="text-2xl font-semibold mb-3 text-gray-700">SkillX Messages</h2>
                    <p className="text-center max-w-md text-gray-500 leading-relaxed">
                      Send messages to skill exchange partners privately. Select a conversation to get started.
                    </p>
                    <div className="mt-8 text-sm text-gray-400">
                      🔒 Your messages are secure and private
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
