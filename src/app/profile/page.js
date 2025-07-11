'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [skillsOffered, setSkillsOffered] = useState([]);
  const [skillsNeeded, setSkillsNeeded] = useState([]);
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
      setSkillsOffered(data.user.skillsOffered || []);
      setSkillsNeeded(data.user.skillsNeeded || []);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Profile</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Skills Offered</h2>
                <div className="space-y-2">
                  {skillsOffered.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...skillsOffered];
                          newSkills[index] = e.target.value;
                          setSkillsOffered(newSkills);
                        }}
                        placeholder="Enter skill"
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsOffered.filter((_, i) => i !== index);
                          setSkillsOffered(newSkills);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSkillsOffered([...skillsOffered, ''])}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    + Add Skill Offered
                  </button>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold mb-4">Skills Needed</h2>
                <div className="space-y-2">
                  {skillsNeeded.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={skill}
                        onChange={(e) => {
                          const newSkills = [...skillsNeeded];
                          newSkills[index] = e.target.value;
                          setSkillsNeeded(newSkills);
                        }}
                        placeholder="Enter skill"
                        className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => {
                          const newSkills = skillsNeeded.filter((_, i) => i !== index);
                          setSkillsNeeded(newSkills);
                        }}
                        className="px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setSkillsNeeded([...skillsNeeded, ''])}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                  >
                    + Add Skill Needed
                  </button>
                </div>
              </div>

              <button
                onClick={handleSkillsUpdate}
                className="w-full bg-green-500 text-white py-3 rounded hover:bg-green-600 transition text-lg font-semibold"
              >
                Update Skills
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
