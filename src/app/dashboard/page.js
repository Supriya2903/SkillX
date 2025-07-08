'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';
import Navigation from '@/components/Navigation';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Since middleware already protects this route, we can assume user is authenticated
    setUser({ message: 'User authenticated successfully!' });
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const res = await fetch('/api/skills', {
        method: 'GET',
        credentials: 'include',
      });

      if (!res.ok) {
        throw new Error('Failed to fetch skills');
      }

      const data = await res.json();
      setSkills(data.skills || []);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
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
                <div key={skill._id} className="bg-blue-50 p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-1">{skill.title}</h3>
                  <p className="text-sm text-gray-700 mb-1">
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
