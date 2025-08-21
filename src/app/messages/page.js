'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import {
  Send, Search, Phone, Video, MoreHorizontal, Paperclip,
  Smile, ArrowLeft, Users, MessageCircle, Clock, CheckCheck
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
  const messagesEndRef = useRef(null);
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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 h-[calc(100vh-200px)]">
            <div className="flex h-full">
              
              {/* Conversations List */}
              <div className={`${selectedConversation ? 'hidden lg:block' : 'block'} w-full lg:w-1/3 border-r border-gray-200 flex flex-col`}>
                <div className="p-6 border-b border-gray-200">
                  <h1 className="text-2xl font-bold text-gray-800 mb-4">Messages</h1>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
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
                    <div className="space-y-1 p-4">
                      {filteredConversations.map((conversation) => (
                        <motion.div
                          key={conversation._id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => {
                            setSelectedConversation(conversation);
                            fetchMessages(conversation.participant._id);
                          }}
                          className={`flex items-center p-4 rounded-lg cursor-pointer transition-colors ${
                            selectedConversation?.participant._id === conversation.participant._id
                              ? 'bg-purple-100 border-purple-200'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium">
                              {conversation.participant.avatar ? (
                                <img 
                                  src={conversation.participant.avatar} 
                                  alt={conversation.participant.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                conversation.participant.name.charAt(0).toUpperCase()
                              )}
                            </div>
                            {conversation.participant.stats?.lastActive && 
                             new Date(conversation.participant.stats.lastActive) > new Date(Date.now() - 15 * 60 * 1000) && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium text-gray-900 truncate">
                                {conversation.participant.name}
                              </h3>
                              {conversation.lastMessage && (
                                <span className="text-xs text-gray-500">
                                  {formatTime(conversation.lastMessage.createdAt)}
                                </span>
                              )}
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-gray-600 truncate mt-1">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                            {conversation.unreadCount > 0 && (
                              <div className="mt-2">
                                <span className="inline-block bg-purple-500 text-white text-xs rounded-full px-2 py-1">
                                  {conversation.unreadCount}
                                </span>
                              </div>
                            )}
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
                    <div className="p-6 border-b border-gray-200 bg-white">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <button
                            onClick={() => setSelectedConversation(null)}
                            className="lg:hidden mr-4 p-2 text-gray-600 hover:text-gray-800 transition-colors"
                          >
                            <ArrowLeft className="h-5 w-5" />
                          </button>
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-medium mr-4">
                            {selectedConversation.participant.avatar ? (
                              <img 
                                src={selectedConversation.participant.avatar} 
                                alt={selectedConversation.participant.name}
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              selectedConversation.participant.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                              {selectedConversation.participant.name}
                            </h2>
                            <p className="text-sm text-gray-500">
                              {selectedConversation.participant.stats?.lastActive ? (
                                `Last seen ${formatTime(selectedConversation.participant.stats.lastActive)}`
                              ) : (
                                'Offline'
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <Phone className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <Video className="h-5 w-5" />
                          </button>
                          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                            <MoreHorizontal className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {messages.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500">
                          <MessageCircle className="h-16 w-16 mb-4 text-gray-300" />
                          <p className="text-lg font-medium mb-2">Start the conversation!</p>
                          <p className="text-sm text-center">Send a message to begin your skill exchange journey.</p>
                        </div>
                      ) : (
                        <>
                          {[...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)).map((message, index, arr) => {
                            const isOwnMessage = message.sender._id === user?._id;
                            const prev = index > 0 ? arr[index - 1] : null;
                            const showDate = !prev || formatDate(prev.createdAt) !== formatDate(message.createdAt);
                            
                            return (
                              <div key={message._id}>
                                {showDate && (
                                  <div className="flex justify-center my-4">
                                    <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                      {formatDate(message.createdAt)}
                                    </span>
                                  </div>
                                )}
                                
                                <motion.div
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div className={`max-w-xs lg:max-w-md xl:max-w-lg ${
                                    isOwnMessage ? 'order-1' : 'order-2'
                                  }`}>
                                    <div className={`rounded-2xl px-4 py-2 ${
                                      isOwnMessage
                                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}>
                                      <p className="text-sm">{message.content}</p>
                                    </div>
                                    <div className={`flex items-center mt-1 space-x-1 ${
                                      isOwnMessage ? 'justify-end' : 'justify-start'
                                    }`}>
                                      <span className="text-xs text-gray-500">
                                        {formatTime(message.createdAt)}
                                      </span>
                                      {isOwnMessage && (
                                        <CheckCheck className={`h-3 w-3 ${
                                          message.isRead ? 'text-purple-500' : 'text-gray-400'
                                        }`} />
                                      )}
                                    </div>
                                  </div>
                                  
                                  {!isOwnMessage && (
                                    <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-medium mr-3 order-1 flex-shrink-0">
                                      {message.sender.avatar ? (
                                        <img 
                                          src={message.sender.avatar} 
                                          alt={message.sender.name}
                                          className="w-8 h-8 rounded-full object-cover"
                                        />
                                      ) : (
                                        message.sender.name.charAt(0).toUpperCase()
                                      )}
                                    </div>
                                  )}
                                </motion.div>
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} />
                        </>
                      )}
                    </div>

                    {/* Message Input */}
                    <div className="p-6 border-t border-gray-200 bg-white">
                      <div className="flex items-end space-x-4">
                        <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
                          <Paperclip className="h-5 w-5" />
                        </button>
                        
                        <div className="flex-1 relative">
                          <textarea
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type a message..."
                            className="w-full p-3 pr-12 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                            rows="1"
                            style={{ minHeight: '44px', maxHeight: '120px' }}
                          />
                          <button className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-600 hover:text-gray-800 transition-colors">
                            <Smile className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <button
                          onClick={sendMessage}
                          disabled={!newMessage.trim() || sendingMessage}
                          className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        >
                          <Send className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="hidden lg:flex flex-col items-center justify-center h-full text-gray-500">
                    <MessageCircle className="h-24 w-24 mb-6 text-gray-300" />
                    <h2 className="text-2xl font-medium mb-2">Welcome to Messages</h2>
                    <p className="text-center max-w-sm">
                      Select a conversation from the sidebar to start chatting with your skill exchange partners.
                    </p>
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
