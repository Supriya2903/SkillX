import connectDB from "@/utils/db";
import User from "@/models/Users";
import bcrypt from "bcryptjs";
import { generateToken } from "@/utils/auth";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

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

    // ✅ Use Next.js 15 cookies() function - this is the recommended approach
    const cookieStore = cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    });

    return NextResponse.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    }, { status: 200 });

  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
