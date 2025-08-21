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
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Post a New Skill</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Skill Title"
          required
          className="w-full p-2 border rounded"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Skill Description"
          className="w-full p-2 border rounded"
        />
        <select
          name="level"
          value={form.level}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
        
        <select
          name="category"
          value={form.category}
          onChange={handleChange}
          className="w-full p-2 border rounded"
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
        
        <select
          name="skillType"
          value={form.skillType}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          required
        >
          <option value="Offering">I can teach this skill</option>
          <option value="Learning">I want to learn this skill</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
      </div>
    </>
  );
}