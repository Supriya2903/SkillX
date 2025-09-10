'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Users, MessageCircle, ArrowLeft, Calendar } from 'lucide-react';

export default function UserProfile({ params }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const router = useRouter();
  const { id } = params;

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchUserProfile();
  }, [id, router]);

  const fetchUserProfile = async () => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          deleteCookie('token');
          router.push('/login');
          return;
        }
        if (res.status === 404) {
          setError('User not found');
          return;
        }
        throw new Error('Failed to fetch user profile');
      }

      const data = await res.json();
      setUser(data.user);
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      setError('Failed to load user profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = () => {
    router.push(`/messages?user=${id}`);
  };

  const formatJoinDate = (date) => {
    if (!date) return 'Recently joined';
    const joinDate = new Date(date);
    const now = new Date();
    const diffTime = Math.abs(now - joinDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) {
      return `Joined ${diffDays} days ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `Joined ${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `Joined ${years} year${years > 1 ? 's' : ''} ago`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#865D36'}}></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
          <div className="text-center">
            <div className="text-6xl mb-4">😞</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-6 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200"
              style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)'}}
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen p-6" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-8" 
            style={{border: '1px solid rgba(134, 93, 54, 0.2)'}}
          >
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Matches
              </button>
            </div>

            <div className="space-y-8">
              {/* Profile Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-center p-8 rounded-xl" 
                style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}
              >
                <div className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center mb-4" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                  <span className="text-white font-bold text-3xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{user?.name || 'User'}</h1>
                <div className="flex items-center justify-center text-gray-600 mb-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>{formatJoinDate(user?.joinedDate)}</span>
                </div>
                
                {/* Stats */}
                <div className="flex justify-center space-x-8 mb-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Trophy className="h-5 w-5 text-yellow-600 mr-1" />
                      <span className="text-2xl font-bold text-gray-800">{user?.usersHelped || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Users Helped</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-5 w-5 text-blue-600 mr-1" />
                      <span className="text-2xl font-bold text-gray-800">{user?.usersLearnedFrom || 0}</span>
                    </div>
                    <p className="text-sm text-gray-600">Learned From</p>
                  </div>
                </div>

                <button
                  onClick={handleSendMessage}
                  className="inline-flex items-center px-8 py-3 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105 bg-blue-500 hover:bg-blue-600"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Send Message
                </button>
              </motion.div>

              {/* Bio Section */}
              {user?.bio && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                      <span className="text-white font-bold text-sm">💬</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">About</h2>
                  </div>
                  
                  <div className="p-6 rounded-lg" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}>
                    <p className="text-gray-700 leading-relaxed">{user.bio}</p>
                  </div>
                </motion.div>
              )}

              {/* Skills Offered */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Skills Offered</h2>
                </div>
                <div className="p-6 rounded-lg" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}>
                  {user?.skillsOffered && user.skillsOffered.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-green-100 to-teal-100 text-green-800 text-sm rounded-full font-medium"
                        >
                          {typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No skills offered yet.</p>
                  )}
                </div>
              </motion.div>

              {/* Skills Needed */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #AC8968 0%, #A69080 100%)'}}>
                    <Target className="h-4 w-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Skills Needed</h2>
                </div>
                <div className="p-6 rounded-lg" style={{background: 'linear-gradient(135deg, #F8F6F4 0%, #F6F2ED 100%)', border: '1px solid rgba(172, 137, 104, 0.2)'}}>
                  {user?.skillsNeeded && user.skillsNeeded.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {user.skillsNeeded.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-orange-100 to-red-100 text-orange-800 text-sm rounded-full font-medium"
                        >
                          {typeof skill === 'string' ? skill : skill?.name || 'Unknown Skill'}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">Not looking to learn any skills at the moment.</p>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
