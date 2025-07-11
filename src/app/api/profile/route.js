import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Users from "@/models/Users";

// GET user profile
export async function GET() {
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

    const user = await Users.findById(decoded.id).select("-password");
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });

  } catch (err) {
    console.error("❌ Profile GET Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// UPDATE user profile skills
export async function PUT(req) {
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

    const { skillsOffered, skillsNeeded } = await req.json();

    if (!Array.isArray(skillsOffered) || !Array.isArray(skillsNeeded)) {
      return NextResponse.json({ message: "Skills must be arrays" }, { status: 400 });
    }

    // Normalize skills to lowercase for consistent matching
    const normalizeSkills = (skills) => 
      skills
        .filter(skill => skill.trim() !== '')
        .map(skill => skill.toLowerCase().trim());

    const updatedUser = await Users.findByIdAndUpdate(
      decoded.id,
      { 
        skillsOffered: normalizeSkills(skillsOffered),
        skillsNeeded: normalizeSkills(skillsNeeded)
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "Profile updated successfully",
      user: updatedUser 
    }, { status: 200 });

  } catch (err) {
    console.error("❌ Profile UPDATE Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
