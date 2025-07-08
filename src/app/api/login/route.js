import connectDB from "@/utils/db";
import User from "@/models/Users";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { serialize } from "cookie"; 

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    await connectDB();

    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: "Invalid password" }, { status: 401 });
    }

    const token = generateToken(user);

    // ✅ Serialize cookie with improved settings
    const cookie = serialize("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax", // More permissive in development
    });
    
    // ✅ Create response and set the Set-Cookie header manually
    const response = NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    }, { status: 200 });
    
    response.headers.set("Set-Cookie", cookie);
    
    // Additional headers for better CORS handling in development
    if (process.env.NODE_ENV === "development") {
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }

    return response;

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
