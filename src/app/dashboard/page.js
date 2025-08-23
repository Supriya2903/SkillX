'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
  TrendingUp, Users, Award, MessageCircle, Calendar, Clock,
  Target, Star, Zap, BookOpen, Plus, BarChart3, Activity,
  PieChart, ArrowUpRight, Eye, Heart, ChevronRight, Phone,
  Mail, MapPin, ExternalLink
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
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#865D36', borderTopColor: 'transparent'}}></div>
          <p className="text-gray-600 font-medium">Loading your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Welcome Banner */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}></div>
              <div className="absolute inset-0 opacity-5">
                <div className="w-full h-full" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23865D36' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  backgroundSize: '60px 60px'
                }}></div>
              </div>
              
              <div className="relative px-8 py-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex-1">
                    <div className="mb-4">
                      <h1 className="text-4xl font-bold text-gray-900 mb-3">
                        Welcome back, {user?.name || 'there'}! 👋
                      </h1>
                      <p className="text-lg text-gray-600 mb-4">
                        Ready to explore new skills and share your expertise?
                      </p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span>Active learning journey</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                          <span>Community connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 lg:mt-0 lg:ml-8">
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <Link
                        href="/match"
                        className="inline-flex items-center justify-center px-6 py-3 bg-white border-2 rounded-xl text-sm font-medium transition-all duration-200 hover:shadow-md"
                        style={{borderColor: '#D5C7BC', color: '#5A4E44'}}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#F6F2ED';
                          e.currentTarget.style.color = '#865D36';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.color = '#5A4E44';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <Users className="h-5 w-5 mr-2" />
                        Find Matches
                      </Link>
                      <Link
                        href="/add-skill"
                        className="inline-flex items-center justify-center px-6 py-3 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                        style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Skill
                      </Link>
                    </div>
                  </div>
                </div>
                
              </div>
            </div>
          </motion.div>

          {/* Key Metrics - Simplified */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
          >
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Skills</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{skills.length}</p>
                  <div className="flex items-center mt-2">
                    <Plus className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Ready to share</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Potential Matches</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{analytics.skillMatches}</p>
                  <div className="flex items-center mt-2">
                    <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 font-medium">Discover now</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                  <Target className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">New Messages</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{Math.floor(analytics.messagesReceived / 3)}</p>
                  <div className="flex items-center mt-2">
                    <MessageCircle className="h-4 w-4 text-blue-500 mr-1" />
                    <span className="text-sm text-blue-600 font-medium">Unread today</span>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                  <MessageCircle className="h-6 w-6 text-white" />
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
                    className="inline-flex items-center px-4 py-2 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                    style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
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
                      className="inline-flex items-center px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                      style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
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
                            <span className="px-3 py-1 bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 rounded-full text-sm font-medium">
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
                  className="block mt-4 text-center text-sm font-medium"
                  style={{color: '#865D36'}}
                  onMouseEnter={(e) => e.target.style.color = '#B8956A'}
                  onMouseLeave={(e) => e.target.style.color = '#865D36'}
                >
                  View all activity
                </Link>
              </motion.div>

              
              {/* Quick Actions */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-gray-200"
              >
                <h3 className="text-lg font-bold text-gray-800 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    href="/match"
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg hover:from-orange-100 hover:to-amber-100 transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-orange-600" />
                      <span className="font-medium text-gray-800">Find Skill Matches</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-orange-600 transition-colors" />
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
      <Footer />
    </>
  );
}
