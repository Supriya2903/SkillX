'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Users, MessageCircle, Star, Zap } from 'lucide-react';

export default function Match() {
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userSkills, setUserSkills] = useState({ offered: [], needed: [] });
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    fetchMatches();
  }, [router]);

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/match', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          deleteCookie('token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch matches');
      }

      const data = await res.json();
      setMatchedUsers(data.matchedUsers || []);
    } catch (error) {
      console.error('❌ Error fetching matches:', error);
      setError('Failed to load matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSkills = () => {
    router.push('/profile'); // Redirect to profile page to update skills
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{borderColor: '#865D36', borderTopColor: 'transparent'}}></div>
          <p className="text-gray-600">Finding your skill matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200"
          >
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold mb-2" style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Skill Matches ⚡</h1>
                <p className="text-gray-600">Connect with people who have complementary skills</p>
              </div>
              <button
                onClick={handleUpdateSkills}
                className="text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)'}}
              >
                Update Skills
              </button>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm"
              >
                {error}
              </motion.div>
            )}

            {matchedUsers.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No matches found</h3>
                <p className="text-gray-600 mb-4">
                  We couldn't find any users with skills that match your interests.
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  Try updating your skills offered and needed to find more matches!
                </p>
                <button
                  onClick={handleUpdateSkills}
                  className="inline-flex items-center px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
                  style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)'}}
                >
                  <Users className="mr-2 h-5 w-5" />
                  Update Profile
                </button>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-lg p-4 mb-6"
                  style={{background: 'linear-gradient(135deg, #F0E9E2 0%, #F6F2ED 100%)', borderColor: '#D5C7BC', border: '1px solid'}}
                >
                  <div className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" style={{color: '#865D36'}} />
                    <p className="font-semibold" style={{color: '#865D36'}}>Great news!</p>
                  </div>
                  <p className="text-sm mt-1" style={{color: '#5A4E44'}}>
                    We found {matchedUsers.length} user{matchedUsers.length !== 1 ? 's' : ''} with complementary skills.
                  </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedUsers.map((user, index) => (
                    <motion.div
                      key={user._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                          <div className="text-white rounded-2xl w-12 h-12 flex items-center justify-center font-bold text-lg" style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)'}}>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-600">{user.email}</p>
                          </div>
                        </div>
                        {user.matchScore && (
                          <div className="bg-gradient-to-r from-green-100 to-blue-100 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-green-800">
                              {Math.round(user.matchScore * 100)}% match
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Star className="h-4 w-4 text-green-600 mr-1" />
                            <h4 className="text-sm font-medium text-gray-700">Skills Offered:</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(user.skillsOffered || []).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-xs rounded-full font-medium"
                              >
                                {typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill'}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center mb-2">
                            <Zap className="h-4 w-4 text-orange-600 mr-1" />
                            <h4 className="text-sm font-medium text-gray-700">Skills Needed:</h4>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(user.skillsNeeded || []).map((skill, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-xs rounded-full font-medium"
                              >
                                {typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill'}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-100">
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => router.push(`/messages?user=${user._id}`)}
                            className="flex-1 text-white py-2.5 px-4 rounded-xl font-medium hover:shadow-lg transition-all duration-200 flex items-center justify-center bg-blue-500 hover:bg-blue-600"
                          >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Message
                          </button>
                          <button 
                            onClick={() => router.push(`/users/${user._id}`)}
                            className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
