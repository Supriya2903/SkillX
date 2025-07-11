'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p>Loading your dashboard...</p>
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
              <h1 className="text-3xl font-bold">Dashboard</h1>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>
            </div>

            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6">
              <p className="font-semibold">✅ Welcome!</p>
              <p className="text-sm">Your skills are listed below.</p>
            </div>

            {skills.length === 0 ? (
              <div className="text-center text-gray-500">No skills added yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {skills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-blue-50 p-6 rounded-lg shadow-md relative group hover:shadow-lg transition-shadow duration-200"
                >
                  <button
                    onClick={() => handleDelete(skill._id)}
                    className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                    title="Delete Skill"
                  >
                    ×
                  </button>
                  <h3 className="text-xl font-semibold mb-2 pr-10">{skill.title}</h3>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Level:</strong> {skill.level}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Description:</strong>{' '}
                    {skill.description ? skill.description : 'N/A'}
                  </p>
                </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
