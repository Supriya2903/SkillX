import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Users from "@/models/Users";

// GET specific user's public profile
export async function GET(req, { params }) {
  try {
    await connectDB();

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const { id } = params;

    // Find the user by ID, excluding sensitive information
    const user = await Users.findById(id).select("-password -email");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Return public profile information
    const publicProfile = {
      _id: user._id,
      name: user.name,
      bio: user.bio || "",
      skillsOffered: user.skillsOffered || [],
      skillsNeeded: user.skillsNeeded || [],
      usersHelped: user.usersHelped || 0,
      usersLearnedFrom: user.usersLearnedFrom || 0,
      joinedDate: user.createdAt || user._id.getTimestamp()
    };

    return NextResponse.json({ user: publicProfile }, { status: 200 });

  } catch (err) {
    console.error("❌ User Profile GET Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
