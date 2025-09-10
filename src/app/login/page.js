'use client';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {getCookie} from '@/utils/cookies';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

export default function Login(){
    const [formData, setFormData] = useState({email : '', password : ''})
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    
    // Check if user is already logged in
    useEffect(() => {
        const token = getCookie('token');
        if (token) {
            // If token exists, redirect to dashboard
            // Adding a small delay to ensure proper navigation
            setTimeout(() => {
                router.push('/dashboard');
            }, 100);
        }
    }, [router]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name] : e.target.value}));
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try{
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: {'Content-Type' : 'application/json'},
                credentials: 'include', // ✅ This is crucial for cookie handling
                body: JSON.stringify(formData),
            })
            const data = await res.json();

            if(res.ok){
                setSuccess('Login successful!');
                setFormData({email: '', password: ''});
                
                // Small delay to ensure cookie is set before redirect
                setTimeout(() => {
                    router.push('/dashboard');
                }, 100);
            }else{
                setError(data.message || 'Login failed');
                setLoading(false);
            }
        }catch(err){
            setError('Something went Wrong!');
            setLoading(false);
        }
    }
    return (
    <div className="min-h-screen flex items-center justify-center p-6" style={{background: 'linear-gradient(135deg, #FCFAF7 0%, #F6F2ED 50%, #F0E9E2 100%)'}}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center space-x-2"
          >
            {/* ✅ Logo image instead of just S box */}
            <Image
               src="/logo.png"
               alt="SkillX Logo"
               width={48}
               height={48}
               className="rounded-xl"
             />
            <span className="text-2xl font-bold" style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>SkillX</span>
          </motion.div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          onSubmit={handleSubmit}
          className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-gray-200"
        >
          <h2 className="text-2xl font-bold mb-6 text-center" style={{color: '#3E362E'}}>Welcome back!</h2>
          <p className="text-center mb-8" style={{color: '#5A4E44'}}>Sign in to continue your skill journey</p>

          {error && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg mb-4 text-sm"
            >
              {success}
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                style={{'--tw-ring-color': '#865D36'}}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                style={{'--tw-ring-color': '#865D36'}}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
            style={{background: 'linear-gradient(135deg, #865D36 0%, #B8956A 100%)'}}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{color: '#5A4E44'}}>
              Don&apos;t have an account?{' '}
              <Link href="/signup" className="font-medium transition-colors" style={{color: '#865D36'}} onMouseEnter={(e) => e.target.style.color = '#B8956A'} onMouseLeave={(e) => e.target.style.color = '#865D36'}>
                Sign up here
              </Link>
            </p>
          </div>
        </motion.form>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link 
            href="/" 
            className="transition-colors text-sm font-medium"
            style={{color: '#5A4E44'}}
            onMouseEnter={(e) => e.target.style.color = '#865D36'}
            onMouseLeave={(e) => e.target.style.color = '#5A4E44'}
          >
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
}