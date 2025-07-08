'use client';
import {use, useState} from 'react';
import {useRouter} from 'next/navigation';
import Navigation from '@/components/Navigation';

export default function AddSkill() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        level: "Beginner",
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
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Submit
        </button>
      </form>
      </div>
    </>
  );
}