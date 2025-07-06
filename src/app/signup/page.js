"use client";

import {useState} from "react";

export default function Signup(){
    const [form, setForm] = useState({name: "", email: "", password: ""})
    const [message, setMessage] = useState("");     

    const handleChange = (e) => {
        setForm({...form, [e.target.name]: e.target.value});
    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch("/api/signup",{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(form)
        })

        const data = await res.json();
        setMessage(data.message  || data.error);
    }

    return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      <h2 className="text-2xl font-bold mb-4">Signup to SkillSwap</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-80">
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 border border-gray-600"
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 border border-gray-600"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 border border-gray-600"
        />
        <button type="submit" className="bg-green-500 hover:bg-green-600 p-2 rounded">
          Signup
        </button>
      </form>
      {message && <p className="mt-4">{message}</p>}
    </div>
    );
}