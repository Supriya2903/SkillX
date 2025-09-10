'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { 
  User, Mail, MapPin, Calendar, Star, Award, Edit3, Camera, 
  Github, Linkedin, Twitter, Globe, Clock, Users, Trophy,
  Plus, X, Save, Settings, BadgeCheck, TrendingUp, MessageCircle,
  Shield, Heart
} from 'lucide-react';
import { SKILL_CATEGORIES } from '@/models/Skill';

export default function ProfileEnhanced() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    validateTokenAndFetchData(token);
  }, [router]);

  const validateTokenAndFetchData = async (token) => {
    try {
      const res = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.ok) {
        const userData = await res.json();
        const userWithDefaults = {
          bio: '',
          location: { city: '', country: '' },
          socialLinks: { linkedin: '', github: '', twitter: '', portfolio: '' },
          preferences: { availableForMentoring: true },
          stats: { totalConnections: 0, successfulExchanges: 0, rating: 0, profileViews: 0 },
          badges: [],
          skillsOffered: [],
          skillsNeeded: [],
          privacySettings: {
            showEmail: false,
            showLocation: true,
            showStats: true,
            allowMessages: true
          },
          ...userData.user
        };
        setUser(userWithDefaults);
        setEditForm(userWithDefaults);
      } else {
        deleteCookie('token');
        router.push('/login');
      }
    } catch (error) {
      console.error('❌ Error validating token:', error);
      deleteCookie('token');
      router.push('/login');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(editForm)
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser.user);
        setIsEditing(false);
        setSuccess('Profile updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update profile');
      }
    } catch (error) {
      setError('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeColor = (rarity) => {
    const colors = {
      Common: 'from-gray-400 to-gray-600',
      Rare: 'from-blue-400 to-blue-600', 
      Epic: 'from-purple-400 to-purple-600',
      Legendary: 'from-yellow-400 to-yellow-600'
    };
    return colors[rarity] || colors.Common;
  };

  const getSkillLevelColor = (level) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800',
      Intermediate: 'bg-yellow-100 text-yellow-800',
      Advanced: 'bg-red-100 text-red-800'
    };
    return colors[level] || colors.Beginner;
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Success/Error Messages */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center"
            >
              <BadgeCheck className="h-5 w-5 mr-2" />
              {success}
            </motion.div>
          )}
          
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
            >
              {error}
            </motion.div>
          )}

          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden mb-8 border border-gray-200"
          >
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32 relative">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-2 rounded-lg transition-colors"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <div className="px-8 pb-8">
              <div className="flex flex-col md:flex-row md:items-end md:space-x-6 -mt-16">
                <div className="relative mb-4 md:mb-0">
                  <div className="w-32 h-32 bg-gradient-to-r from-purple-400 to-pink-400 rounded-2xl border-4 border-white flex items-center justify-center text-white font-bold text-4xl shadow-xl">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      user.name?.charAt(0)?.toUpperCase() || 'U'
                    )}
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-0 right-0 bg-purple-500 hover:bg-purple-600 text-white p-2 rounded-full shadow-lg transition-colors">
                      <Camera className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      {isEditing ? (
                        <input
                          type="text"
                          value={editForm.name || ''}
                          onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                          className="text-3xl font-bold text-gray-800 bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none mb-2"
                          placeholder="Your name"
                        />
                      ) : (
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">{user.name}</h1>
                      )}
                      
                      <div className="flex items-center text-gray-600 mb-2">
                        <Mail className="h-4 w-4 mr-2" />
                        <span>{user.email}</span>
                      </div>
                      
                      {(user.location?.city || user.location?.country || isEditing) && (
                        <div className="flex items-center text-gray-600 mb-4">
                          <MapPin className="h-4 w-4 mr-2" />
                          {isEditing ? (
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={editForm.location?.city || ''}
                                onChange={(e) => setEditForm({...editForm, location: {...editForm.location, city: e.target.value}})}
                                className="bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none text-sm"
                                placeholder="City"
                              />
                              <input
                                type="text"
                                value={editForm.location?.country || ''}
                                onChange={(e) => setEditForm({...editForm, location: {...editForm.location, country: e.target.value}})}
                                className="bg-transparent border-b border-gray-300 focus:border-purple-500 outline-none text-sm"
                                placeholder="Country"
                              />
                            </div>
                          ) : (
                            <span>{[user.location.city, user.location.country].filter(Boolean).join(', ')}</span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Stats */}
                    <div className="flex space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{user.stats?.totalConnections || 0}</div>
                        <div className="text-sm text-gray-600">Connections</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{user.stats?.successfulExchanges || 0}</div>
                        <div className="text-sm text-gray-600">Exchanges</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center text-2xl font-bold text-yellow-600">
                          {user.stats?.rating ? (user.stats.rating / Math.max(user.stats.totalRatings, 1)).toFixed(1) : '0.0'}
                          <Star className="h-5 w-5 ml-1 fill-current" />
                        </div>
                        <div className="text-sm text-gray-600">Rating</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bio */}
              <div className="mt-6">
                {isEditing ? (
                  <textarea
                    value={editForm.bio || ''}
                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none resize-none"
                    rows="3"
                    placeholder="Tell others about yourself, your interests, and what you&apos;re passionate about..."
                    maxLength="500"
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {user.bio || "This user hasn&apos;t added a bio yet."}
                  </p>
                )}
              </div>
              
              {/* Action Buttons */}
              {isEditing && (
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all duration-200 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditForm(user);
                    }}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl mb-8 border border-gray-200"
          >
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-8 py-4">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'skills', label: 'Skills', icon: Award },
                  { id: 'badges', label: 'Badges', icon: Trophy },
                  { id: 'social', label: 'Social', icon: Globe },
                  { id: 'settings', label: 'Settings', icon: Settings }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 py-2 px-4 rounded-lg font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-purple-100 text-purple-600'
                          : 'text-gray-600 hover:text-purple-600'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            
            <div className="p-8">
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                        Activity Overview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Profile Views</span>
                          <span className="font-semibold">{user.stats?.profileViews || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skills Offered</span>
                          <span className="font-semibold">{user.skillsOffered?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skills Needed</span>
                          <span className="font-semibold">{user.skillsNeeded?.length || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Member Since</span>
                          <span className="font-semibold">
                            {user.stats?.joinedAt ? new Date(user.stats.joinedAt).toLocaleDateString() : 'Recently'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Heart className="h-5 w-5 mr-2 text-purple-600" />
                        Preferences
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Available for Mentoring</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.preferences?.availableForMentoring 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.preferences?.availableForMentoring ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Preferred Communication</span>
                          <span className="font-semibold">{user.preferences?.preferredCommunication || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Max Connections</span>
                          <span className="font-semibold">{user.preferences?.maxConnections || 10}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Skills Tab */}
              {activeTab === 'skills' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Award className="h-5 w-5 mr-2 text-green-600" />
                        Skills I Offer
                      </h3>
                      <div className="space-y-3">
                        {user.skillsOffered && user.skillsOffered.length > 0 ? (
                          user.skillsOffered.map((skill, index) => (
                            <div key={index} className="bg-gradient-to-r from-green-50 to-teal-50 border border-green-200 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-800">{skill.name || skill}</h4>
                                {skill.level && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                                    {skill.level}
                                  </span>
                                )}
                              </div>
                              {skill.description && (
                                <p className="text-sm text-gray-600">{skill.description}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No skills offered yet. Add some to help others find you!</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="h-5 w-5 mr-2 text-blue-600" />
                        Skills I Want to Learn
                      </h3>
                      <div className="space-y-3">
                        {user.skillsNeeded && user.skillsNeeded.length > 0 ? (
                          user.skillsNeeded.map((skill, index) => (
                            <div key={index} className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold text-gray-800">{skill.name || skill}</h4>
                                {skill.priority && (
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    skill.priority === 'High' ? 'bg-red-100 text-red-800' :
                                    skill.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {skill.priority} Priority
                                  </span>
                                )}
                              </div>
                              {skill.description && (
                                <p className="text-sm text-gray-600">{skill.description}</p>
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500 italic">No learning goals set. Add some to find mentors!</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              
              {/* Badges Tab */}
              {activeTab === 'badges' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
                    Achievement Badges
                  </h3>
                  {user.badges && user.badges.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                      {user.badges.map((badge, index) => (
                        <motion.div
                          key={index}
                          whileHover={{ scale: 1.05 }}
                          className="text-center p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-lg transition-all"
                        >
                          <div className={`w-16 h-16 mx-auto mb-3 rounded-full bg-gradient-to-r ${getBadgeColor(badge.rarity)} flex items-center justify-center text-white text-2xl`}>
                            {badge.icon || '🏆'}
                          </div>
                          <h4 className="font-semibold text-gray-800 mb-1">{badge.name}</h4>
                          <p className="text-xs text-gray-600 mb-2">{badge.description}</p>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                            badge.rarity === 'Legendary' ? 'bg-yellow-100 text-yellow-800' :
                            badge.rarity === 'Epic' ? 'bg-purple-100 text-purple-800' :
                            badge.rarity === 'Rare' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {badge.rarity}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Trophy className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                      <h4 className="text-lg font-semibold text-gray-800 mb-2">No badges yet</h4>
                      <p className="text-gray-600">Complete skill exchanges and engage with the community to earn badges!</p>
                    </div>
                  )}
                </motion.div>
              )}
              
              {/* Social Tab */}
              {activeTab === 'social' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-blue-600" />
                    Social Links
                  </h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'blue' },
                      { key: 'github', label: 'GitHub', icon: Github, color: 'gray' },
                      { key: 'twitter', label: 'Twitter', icon: Twitter, color: 'sky' },
                      { key: 'portfolio', label: 'Portfolio', icon: Globe, color: 'purple' }
                    ].map((social) => {
                      const Icon = social.icon;
                      return (
                        <div key={social.key} className="bg-gray-50 p-4 rounded-lg">
                          <div className="flex items-center mb-2">
                            <Icon className={`h-5 w-5 mr-2 text-${social.color}-600`} />
                            <label className="font-medium text-gray-800">{social.label}</label>
                          </div>
                          {isEditing ? (
                            <input
                              type="url"
                              value={editForm.socialLinks?.[social.key] || ''}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                socialLinks: {
                                  ...editForm.socialLinks,
                                  [social.key]: e.target.value
                                }
                              })}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                              placeholder={`Your ${social.label} URL`}
                            />
                          ) : (
                            <div className="text-gray-600">
                              {user.socialLinks?.[social.key] ? (
                                <a
                                  href={user.socialLinks[social.key]}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-purple-600 hover:underline"
                                >
                                  {user.socialLinks[social.key]}
                                </a>
                              ) : (
                                <span className="text-gray-400">Not provided</span>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
              
              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                    <Settings className="h-5 w-5 mr-2 text-gray-600" />
                    Profile Settings
                  </h3>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">Privacy Settings</h4>
                      <div className="space-y-4">
                        {[
                          { key: 'showEmail', label: 'Show email to other users' },
                          { key: 'showLocation', label: 'Show location publicly' },
                          { key: 'showStats', label: 'Show activity stats' },
                          { key: 'allowMessages', label: 'Allow messages from other users' }
                        ].map((setting) => (
                          <label key={setting.key} className="flex items-center space-x-3">
                            <input
                              type="checkbox"
                              checked={isEditing ? editForm.privacySettings?.[setting.key] : user.privacySettings?.[setting.key]}
                              onChange={(e) => isEditing && setEditForm({
                                ...editForm,
                                privacySettings: {
                                  ...editForm.privacySettings,
                                  [setting.key]: e.target.checked
                                }
                              })}
                              disabled={!isEditing}
                              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-gray-700">{setting.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-4">Preferences</h4>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Preferred Communication Method
                          </label>
                          {isEditing ? (
                            <select
                              value={editForm.preferences?.preferredCommunication || 'Chat'}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                preferences: {
                                  ...editForm.preferences,
                                  preferredCommunication: e.target.value
                                }
                              })}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                            >
                              <option value="Chat">Chat</option>
                              <option value="Video">Video Call</option>
                              <option value="In-person">In-person</option>
                              <option value="Email">Email</option>
                            </select>
                          ) : (
                            <p className="text-gray-600">{user.preferences?.preferredCommunication || 'Chat'}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Maximum Connections
                          </label>
                          {isEditing ? (
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={editForm.preferences?.maxConnections || 10}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                preferences: {
                                  ...editForm.preferences,
                                  maxConnections: parseInt(e.target.value)
                                }
                              })}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                            />
                          ) : (
                            <p className="text-gray-600">{user.preferences?.maxConnections || 10}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
