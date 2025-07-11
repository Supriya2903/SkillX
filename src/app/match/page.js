'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Finding your skill matches...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-xl p-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold">Skill Matches</h1>
              <button
                onClick={handleUpdateSkills}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
              >
                Update Skills
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6">
                <p>{error}</p>
              </div>
            )}

            {matchedUsers.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 mb-4">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No matches found</h3>
                  <p className="text-gray-500 mb-4">
                    We couldn't find any users with skills that match your interests.
                  </p>
                  <p className="text-sm text-gray-400">
                    Try updating your skills offered and needed to find more matches!
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 text-blue-700 p-4 mb-6">
                  <p className="font-semibold">✨ Great news!</p>
                  <p className="text-sm">We found {matchedUsers.length} user{matchedUsers.length !== 1 ? 's' : ''} with complementary skills.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {matchedUsers.map((user) => (
                    <div
                      key={user._id}
                      className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow duration-200"
                    >
                      <div className="flex items-center mb-4">
                        <div className="bg-blue-500 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-semibold text-gray-900">{user.name}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Offered:</h4>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsOffered.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Skills Needed:</h4>
                          <div className="flex flex-wrap gap-1">
                            {user.skillsNeeded.map((skill, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition text-sm">
                          Connect
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
