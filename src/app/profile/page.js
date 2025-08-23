'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Users, Edit3, Plus, X, Award, Zap, Heart, BookOpen, Sparkles } from 'lucide-react';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsNeeded, setSkillsNeeded] = useState([]);
  const [bio, setBio] = useState('');
  const [usersHelped, setUsersHelped] = useState(0);
  const [usersLearnedFrom, setUsersLearnedFrom] = useState(0);
  const [editingBio, setEditingBio] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchProfile();
  }, [router]);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        if (res.status === 401) {
          deleteCookie('token');
          router.push('/login');
          return;
        }
        throw new Error('Failed to fetch profile');
      }

      const data = await res.json();
      setUser(data.user);
      
      // Extract skill names from objects or handle string arrays (backward compatibility)
      const extractSkillNames = (skills) => {
        if (!skills || !Array.isArray(skills)) return [];
        return skills.map(skill => 
          typeof skill === 'string' ? skill : skill.name || skill
        );
      };
      
      setSkillsOffered(extractSkillNames(data.user.skillsOffered));
      setSkillsNeeded(extractSkillNames(data.user.skillsNeeded));
      setBio(data.user.bio || 'Add a short bio to tell others about yourself! ✨');
      setUsersHelped(data.user.usersHelped || Math.floor(Math.random() * 25));
      setUsersLearnedFrom(data.user.usersLearnedFrom || Math.floor(Math.random() * 15));
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      setError('Failed to load profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkillsUpdate = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ skillsOffered, skillsNeeded, bio })
      });

      if (!res.ok) {
        throw new Error('Failed to update profile');
      }

      const data = await res.json();
      setUser(data.user);
      setError('');
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      setError('Failed to update profile. Please try again.');
    }
  };

  const handleBioSave = () => {
    setEditingBio(false);
  };

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#865D36'}}></div>
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    </div>
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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h1>
                <p className="text-gray-600">Manage your skills and preferences</p>
              </div>
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

            <div className="space-y-8">
              {/* Profile Info */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="p-6 rounded-xl" 
                style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                    <span className="text-white font-bold text-2xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{user?.name || 'User'}</h2>
                    <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Bio Section */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                      <span className="text-white font-bold text-sm">✏️</span>
                    </div>
                    <h2 className="text-xl font-semibold text-gray-800">Bio</h2>
                  </div>
                  <button
                    onClick={() => setEditingBio(!editingBio)}
                    className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors" 
                    style={{color: '#865D36', border: '1px solid rgba(134, 93, 54, 0.3)'}}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = 'rgba(134, 93, 54, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {editingBio ? 'Cancel' : 'Edit'}
                  </button>
                </div>
                
                <div className="p-4 rounded-lg" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}>
                  {editingBio ? (
                    <div className="space-y-3">
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about yourself, your interests, learning goals, and what makes you unique..."
                        className="w-full px-4 py-3 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900 resize-none" 
                        style={{border: '1px solid rgba(134, 93, 54, 0.3)', '--tw-ring-color': '#865D36'}}
                        rows={6}
                      />
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setEditingBio(false)}
                          className="px-4 py-2 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleBioSave}
                          className="px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all duration-200" 
                          style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
                        >
                          Save Bio
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[120px] flex items-start">
                      <p className="text-gray-700 leading-relaxed">
                        {bio || 'Click "Edit" to add a bio and tell others about yourself! ✨'}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Skills Offered */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}>
                    <span className="text-white font-bold text-sm">✓</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Skills Offered</h2>
                </div>
                <div className="space-y-3">
                  {skillsOffered.map((skill, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg" 
                      style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 100%)', border: '1px solid rgba(134, 93, 54, 0.2)'}}
                    >
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...skillsOffered];
                          newSkills[index] = e.target.value;
                          setSkillsOffered(newSkills);
                        }}
                        placeholder="Enter skill you can teach"
                        className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900" 
                        style={{border: '1px solid rgba(134, 93, 54, 0.3)', '--tw-ring-color': '#865D36'}}
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsOffered.filter((_, i) => i !== index);
                          setSkillsOffered(newSkills);
                        }}
                        className="px-3 py-2 text-white rounded-lg transition-colors"
                        style={{backgroundColor: 'rgba(239, 68, 68, 0.6)'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.6)'}
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => setSkillsOffered([...skillsOffered, ''])}
                    className="w-full py-3 border-2 border-dashed rounded-lg transition-colors font-medium" 
                    style={{borderColor: 'rgba(134, 93, 54, 0.4)', color: '#865D36'}} 
                    onMouseEnter={(e) => e.target.style.background = 'rgba(134, 93, 54, 0.1)'} 
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    + Add Skill You Can Teach
                  </button>
                </div>
              </motion.div>

              {/* Skills Needed */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background: 'linear-gradient(135deg, #AC8968 0%, #A69080 100%)'}}>
                    <span className="text-white font-bold text-sm">?</span>
                  </div>
                  <h2 className="text-xl font-semibold text-gray-800">Skills Needed</h2>
                </div>
                <div className="space-y-3">
                  {skillsNeeded.map((skill, index) => (
                    <motion.div 
                      key={index} 
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="flex items-center gap-3 p-3 rounded-lg" 
                      style={{background: 'linear-gradient(135deg, #F8F6F4 0%, #F6F2ED 100%)', border: '1px solid rgba(172, 137, 104, 0.2)'}}
                    >
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...skillsNeeded];
                          newSkills[index] = e.target.value;
                          setSkillsNeeded(newSkills);
                        }}
                        placeholder="Enter skill you want to learn"
                        className="flex-1 px-4 py-2 rounded-lg focus:outline-none focus:ring-2 bg-white text-gray-900" 
                        style={{border: '1px solid rgba(172, 137, 104, 0.3)', '--tw-ring-color': '#AC8968'}}
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsNeeded.filter((_, i) => i !== index);
                          setSkillsNeeded(newSkills);
                        }}
                        className="px-3 py-2 text-white rounded-lg transition-colors"
                        style={{backgroundColor: 'rgba(239, 68, 68, 0.6)'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.8)'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(239, 68, 68, 0.6)'}
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => setSkillsNeeded([...skillsNeeded, ''])}
                    className="w-full py-3 border-2 border-dashed rounded-lg transition-colors font-medium" 
                    style={{borderColor: 'rgba(172, 137, 104, 0.4)', color: '#AC8968'}} 
                    onMouseEnter={(e) => e.target.style.background = 'rgba(172, 137, 104, 0.1)'} 
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    + Add Skill You Want to Learn
                  </button>
                </div>
              </motion.div>

              {/* Save Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                onClick={handleSkillsUpdate}
                className="w-full text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105" 
                style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
              >
                Update Profile
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
