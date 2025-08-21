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
        body: JSON.stringify({ skillsOffered, skillsNeeded })
      });

      if (!res.ok) {
        throw new Error('Failed to update profile skills');
      }

      const data = await res.json();
      setUser(data.user);
      setError('');
      alert('Skills updated successfully!');
    } catch (error) {
      console.error('❌ Error updating skills:', error);
      setError('Failed to update skills. Please try again.');
    }
  };

  const handleLogout = () => {
    deleteCookie('token');
    router.push('/login');
  };

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    </div>
  );
}


  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200"
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
                className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{user?.name || 'User'}</h2>
                    <p className="text-gray-600">{user?.email || 'email@example.com'}</p>
                  </div>
                </div>
              </motion.div>

              {/* Skills Offered */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-400 rounded-lg flex items-center justify-center">
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
                      className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
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
                        className="flex-1 px-4 py-2 border border-green-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-900"
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsOffered.filter((_, i) => i !== index);
                          setSkillsOffered(newSkills);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => setSkillsOffered([...skillsOffered, ''])}
                    className="w-full py-3 border-2 border-dashed border-green-300 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium"
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
                  <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-red-400 rounded-lg flex items-center justify-center">
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
                      className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg border border-orange-200"
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
                        className="flex-1 px-4 py-2 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white text-gray-900"
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsNeeded.filter((_, i) => i !== index);
                          setSkillsNeeded(newSkills);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </motion.div>
                  ))}
                  <button
                    onClick={() => setSkillsNeeded([...skillsNeeded, ''])}
                    className="w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors font-medium"
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
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-xl font-semibold text-lg hover:shadow-lg transition-all duration-200 transform hover:scale-105"
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
