'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/utils/cookies';

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const token = getCookie('token');
        if (!token) {
            router.push('/login');
        } else {
            // You can decode the token here if needed to show user info
            setUser({ message: 'User authenticated successfully!' });
        }
    }, [router]);

    const handleLogout = () => {
        deleteCookie('token');
        router.push('/login');
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
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
                        <p className="font-semibold">✅ Authentication Cookie Working!</p>
                        <p className="text-sm">Your JWT token is successfully stored in the browser cookie.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-6 rounded-lg">
                            <h3 className="font-semibold mb-2">Cookie Status</h3>
                            <p className="text-sm text-gray-600">
                                Token: {getCookie('token') ? '✅ Present' : '❌ Missing'}
                            </p>
                        </div>
                        
                        <div className="bg-yellow-50 p-6 rounded-lg">
                            <h3 className="font-semibold mb-2">Authentication</h3>
                            <p className="text-sm text-gray-600">
                                Status: ✅ Authenticated
                            </p>
                        </div>
                        
                        <div className="bg-purple-50 p-6 rounded-lg">
                            <h3 className="font-semibold mb-2">Session</h3>
                            <p className="text-sm text-gray-600">
                                Active: ✅ Valid
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
