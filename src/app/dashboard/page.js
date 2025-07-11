'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [profileSkills, setProfileSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // Validate token by making a test API call
    validateTokenAndFetchData(token);
  }, [router]);

  const validateTokenAndFetchData = async (token) => {
    try {
      // Test the token by making an API call
      const res = await fetch('/api/skills/get', {
        method: 'GET',
        credentials: 'include',
      });
      
      if (res.ok) {
        // Token is valid
        setUser({ message: 'User authenticated successfully!' });
        const data = await res.json();
        setSkills(data.skills || []);
      } else {
        // Token is invalid or expired
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

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills/get', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('❌ Error fetching skills:', error);
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

      // Refresh the skill list
      fetchSkills();
    } catch (err) {
      console.error('❌ Error deleting skill:', err);
    }
  };

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Profile Summary */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-8 border border-gray-200"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back! 👋</h1>
                <p className="text-gray-600">Manage your skills and track your progress</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">{skills.length}</div>
                <div className="text-sm text-gray-600">Skills Added</div>
              </div>
              <div className="bg-gradient-to-r from-blue-100 to-cyan-100 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">0</div>
                <div className="text-sm text-gray-600">Connections</div>
              </div>
              <div className="bg-gradient-to-r from-green-100 to-teal-100 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600">0</div>
                <div className="text-sm text-gray-600">Exchanges</div>
              </div>
            </div>
          </motion.div>

          {/* Skills Management */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Your Skills</h2>
                <p className="text-gray-600 dark:text-gray-300">Add, manage, and showcase your abilities</p>
              </div>
              <Link
                href="/add-skill"
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                + Add Skill
              </Link>
            </div>

            {skills.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No skills added yet</h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">Start by adding your first skill to begin your journey</p>
                <Link
                  href="/add-skill"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                >
                  Add Your First Skill
                </Link>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {skills.map((skill, index) => (
                <motion.div
                  key={skill._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 group relative border border-gray-200 dark:border-gray-600"
                >
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10"
                    title="Delete Skill"
                  >
                    ×
                  </button>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 pr-10">{skill.title}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 text-purple-700 dark:text-purple-300 rounded-full text-sm font-medium">
                        {skill.level}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                      {skill.description || 'No description provided'}
                    </p>
                  </div>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-xs text-gray-500 dark:text-gray-400">Added recently</span>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
