'use client';
import {use, useState} from 'react';
import {useRouter} from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function AddSkill() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        level: "Beginner",
        category: "Other",
        skillType: "Offering"
    });

    const router = useRouter();

    const handleChange = (e) => {
        setForm(prev => ({
            ...prev,
            [e.target.name] : e.target.value,
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch("/api/skills", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include", // Important: This ensures cookies are sent
                body: JSON.stringify(form),
            });

            if (res.ok) {
                const data = await res.json();
                console.log("Skill created successfully:", data);
                console.log("About to redirect to dashboard...");
                router.push("/dashboard");
            } else {
                const errorData = await res.json();
                console.error("Error response:", errorData);
                alert(`Error: ${errorData.message || "Failed to submit skill"}`);
            }
        } catch (error) {
            console.error("Network error:", error);
            alert("Network error occurred. Please try again.");
        }
    }

    return (
    <>
      <Navigation />
      <div className="min-h-screen" style={{background: 'linear-gradient(135deg, #F6F2ED 0%, #FCFAF7 50%, #F0E9E2 100%)'}}>
        <div className="max-w-2xl mx-auto pt-8 pb-16 px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-200">
            <h2 className="text-3xl font-bold mb-2" style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Post a New Skill</h2>
            <p className="text-gray-600 mb-8">Share your expertise or find someone to learn from</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Skill Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., React.js Development, Photography, Guitar Lessons"
                  required
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{borderColor: '#D5C7BC', focusRingColor: '#865D36'}}
                  onFocus={(e) => e.target.style.borderColor = '#865D36'}
                  onBlur={(e) => e.target.style.borderColor = '#D5C7BC'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your skill, experience level, and what you can offer or want to learn..."
                  rows="4"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors resize-vertical"
                  style={{borderColor: '#D5C7BC'}}
                  onFocus={(e) => e.target.style.borderColor = '#865D36'}
                  onBlur={(e) => e.target.style.borderColor = '#D5C7BC'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                  <select
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{borderColor: '#D5C7BC'}}
                    onFocus={(e) => e.target.style.borderColor = '#865D36'}
                    onBlur={(e) => e.target.style.borderColor = '#D5C7BC'}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
        
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{borderColor: '#D5C7BC'}}
                    onFocus={(e) => e.target.style.borderColor = '#865D36'}
                    onBlur={(e) => e.target.style.borderColor = '#D5C7BC'}
                    required
                  >
          <option value="Other">Other</option>
          <option value="Programming">Programming</option>
          <option value="Web Development">Web Development</option>
          <option value="Mobile Development">Mobile Development</option>
          <option value="Data Science">Data Science</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value="DevOps">DevOps</option>
          <option value="Cloud Computing">Cloud Computing</option>
          <option value="Cybersecurity">Cybersecurity</option>
          <option value="UI/UX Design">UI/UX Design</option>
          <option value="Graphic Design">Graphic Design</option>
          <option value="Digital Marketing">Digital Marketing</option>
          <option value="Content Writing">Content Writing</option>
          <option value="Photography">Photography</option>
          <option value="Video Editing">Video Editing</option>
          <option value="Music Production">Music Production</option>
          <option value="Language Learning">Language Learning</option>
          <option value="Business">Business</option>
          <option value="Finance">Finance</option>
          <option value="Project Management">Project Management</option>
          <option value="Sales">Sales</option>
          <option value="Communication">Communication</option>
          <option value="Leadership">Leadership</option>
          <option value="Teaching">Teaching</option>
          <option value="Research">Research</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type *</label>
                  <select
                    name="skillType"
                    value={form.skillType}
                    onChange={handleChange}
                    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors"
                    style={{borderColor: '#D5C7BC'}}
                    onFocus={(e) => e.target.style.borderColor = '#865D36'}
                    onBlur={(e) => e.target.style.borderColor = '#D5C7BC'}
                    required
                  >
                    <option value="Offering">I can teach this skill</option>
                    <option value="Learning">I want to learn this skill</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button 
                  type="button" 
                  onClick={() => router.push('/dashboard')}
                  className="px-6 py-3 border rounded-lg font-medium transition-colors"
                  style={{borderColor: '#D5C7BC', color: '#5A4E44'}}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#F6F2ED';
                    e.target.style.color = '#865D36';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'transparent';
                    e.target.style.color = '#5A4E44';
                  }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-200 transform hover:scale-105"
                  style={{background: 'linear-gradient(135deg, #865D36 0%, #9378B5 100%)'}}
                >
                  Post Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}