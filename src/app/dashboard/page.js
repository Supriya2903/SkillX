'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, Users, Award, MessageCircle, Calendar, Clock,
  Target, Star, Zap, BookOpen, Plus, BarChart3, Activity,
  PieChart, ArrowUpRight, Eye, Heart, ChevronRight
} from 'lucide-react';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [analytics, setAnalytics] = useState({
    profileViews: 0,
    skillMatches: 0,
    messagesReceived: 0,
    connectionsThisWeek: 0,
    topSkillCategory: 'Programming',
    learningProgress: 65
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
      // Fetch user profile
      const profileRes = await fetch('/api/profile', {
        credentials: 'include'
      });
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        setUser(profileData.user);
      }
      
      // Fetch skills
      const skillsRes = await fetch('/api/skills/get', {
        credentials: 'include'
      });
      
      if (skillsRes.ok) {
        const skillsData = await skillsRes.json();
        setSkills(skillsData.skills || []);
      }
      
      // Mock data for analytics (replace with actual API calls)
      setAnalytics({
        profileViews: Math.floor(Math.random() * 100) + 20,
        skillMatches: Math.floor(Math.random() * 15) + 5,
        messagesReceived: Math.floor(Math.random() * 25) + 3,
        connectionsThisWeek: Math.floor(Math.random() * 8) + 1,
        topSkillCategory: 'Programming',
        learningProgress: Math.floor(Math.random() * 30) + 50
      });
      
      setRecentActivity([
        { type: 'match', message: 'New skill match found!', time: '2 hours ago', icon: '🎯' },
        { type: 'profile_view', message: 'Your profile was viewed by 3 users', time: '5 hours ago', icon: '👁️' },
        { type: 'message', message: 'New message from Sarah Chen', time: '1 day ago', icon: '💬' },
        { type: 'skill_added', message: 'Added "React.js" to your skills', time: '2 days ago', icon: '⚡' }
      ]);
      
      setUpcomingTasks([
        { task: 'Complete profile setup', progress: 80, urgent: true },
        { task: 'Connect with 3 new mentors', progress: 33, urgent: false },
        { task: 'Add project portfolio', progress: 0, urgent: false }
      ]);
      
    } catch (error) {
      console.error('❌ Error loading dashboard:', error);
      if (error.status === 401) {
        deleteCookie('token');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/skills/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to delete skill');
      }

      setSkills(skills.filter(skill => skill._id !== id));
    } catch (err) {
      console.error('❌ Error deleting skill:', err);
      setError('Failed to delete skill');
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
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.name || 'there'}! 👋
                </h1>
                <p className="text-gray-600">
                  Here's what's happening with your skill exchange journey
                </p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <Link
                  href="/match"
                  className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Find Matches
                </Link>
                <Link
                  href="/add-skill"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Skill
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Analytics Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Profile Views</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.profileViews}</p>
                  <div className="flex items-center mt-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+12% this week</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                  <Eye className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skill Matches</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.skillMatches}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">+3 new</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.messagesReceived}</p>
                  <div className="flex items-center mt-2">
                    <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">5 unread</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Skills Added</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{skills.length}</p>
                  <div className="flex items-center mt-2">
                    <Plus className="h-4 w-4 text-purple-500 mr-1" />
                    <span className="text-sm text-purple-600 font-medium">Keep growing!</span>
                  </div>
                </div>
                <div className="p-3 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Skills */}
            <div className="lg:col-span-2">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200"
              >
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">Your Skills</h2>
                    <p className="text-gray-600">Manage and showcase your abilities</p>
                  </div>
                  <Link
                    href="/add-skill"
                    className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill
                  </Link>
                </div>

                {skills.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <div className="text-6xl mb-4">🎯</div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">No skills added yet</h3>
                    <p className="text-gray-600 mb-6">Start your skill exchange journey by adding your first skill</p>
                    <Link
                      href="/add-skill"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Skill
                    </Link>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={skill._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="bg-gradient-to-br from-white to-gray-50 p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 group relative border border-gray-200"
                      >
                        <button
                          onClick={() => handleDelete(skill._id)}
                          className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold z-10"
                          title="Delete Skill"
                        >
                          ×
                        </button>
                        
                        <div className="mb-4">
                          <h3 className="text-lg font-bold text-gray-800 mb-2 pr-8">{skill.title}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
                              {skill.level}
                            </span>
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                              {skill.category || 'General'}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm leading-relaxed">
                            {skill.description || 'No description provided'}
                          </p>
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                          <span className="text-xs text-gray-500">
                            {skill.skillType || 'Skill'}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            <span className="text-xs text-gray-600">4.5</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              
              {/* Recent Activity */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
                  <Activity className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <span className="text-lg">{activity.icon}</span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{activity.message}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link
                  href="/activity"
                  className="block mt-4 text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  View all activity
                </Link>
              </motion.div>

              {/* Learning Progress */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Learning Progress</h3>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Profile Completion</span>
                      <span className="text-sm font-bold text-purple-600">{analytics.learningProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${analytics.learningProgress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Tasks</h4>
                    <div className="space-y-2">
                      {upcomingTasks.map((task, index) => (
                        <div key={index} className={`flex items-center justify-between p-2 rounded-lg ${
                          task.urgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                        }`}>
                          <div className="flex-1">
                            <p className="text-xs font-medium text-gray-800">{task.task}</p>
                            <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                              <div 
                                className={`h-1 rounded-full ${
                                  task.urgent ? 'bg-red-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          {task.urgent && (
                            <span className="ml-2 w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <Link
                  href="/profile"
                  className="block mt-4 text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  Complete profile →
                </Link>
              </motion.div>
              
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/match"
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-purple-600" />
                      <span className="font-medium text-gray-800">Find Skill Matches</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-purple-600 transition-colors" />
                  </Link>
                  
                  <Link
                    href="/messages"
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <MessageCircle className="h-5 w-5 text-blue-600" />
                      <span className="font-medium text-gray-800">Check Messages</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </Link>
                  
                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-teal-50 rounded-lg hover:from-green-100 hover:to-teal-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Award className="h-5 w-5 text-green-600" />
                      <span className="font-medium text-gray-800">Update Profile</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                  </Link>
                </div>
              </motion.div>
              
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
