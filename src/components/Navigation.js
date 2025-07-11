'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { deleteCookie, getCookie } from '@/utils/cookies';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Default to true since middleware protects routes
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const token = getCookie('token');
    setIsLoggedIn(!!token);
  }, []);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <span className="text-xl font-bold">SkillSwap</span>
          <div className="space-x-4">Loading...</div>
        </div>
      </nav>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.log('Logout API error:', error);
    }
    
    deleteCookie('token');
    setIsLoggedIn(false);
    router.push('/login');
  };

  if (!isLoggedIn) {
    return (
      <nav className="bg-blue-600 text-white p-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">SkillSwap</Link>
          <div className="space-x-4">
            <Link href="/login" className="hover:text-blue-200">Login</Link>
            <Link href="/signup" className="hover:text-blue-200">Sign Up</Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/dashboard" className="text-xl font-bold">SkillSwap</Link>
        <div className="space-x-4">
          <Link href="/dashboard" className="hover:text-blue-200">Dashboard</Link>
          <Link href="/add-skill" className="hover:text-blue-200">Add Skill</Link>
          <Link href="/profile" className="hover:text-blue-200">Profile</Link>
          <Link href="/match" className="hover:text-blue-200">Find Matches</Link>
          <button 
            onClick={handleLogout}
            className="hover:text-blue-200 bg-transparent border-none cursor-pointer"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
