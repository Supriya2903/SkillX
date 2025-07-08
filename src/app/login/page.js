'use client';
import {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {getCookie} from '@/utils/cookies';

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
            // (You can add token validation here if needed)
            router.push('/dashboard');
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm bg-white p-8 shadow-xl rounded-lg"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center">Login to SkillSwap</h2>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-4 border rounded"
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          className="w-full px-4 py-2 mb-6 border rounded"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}