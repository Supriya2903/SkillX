import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Users from "@/models/Users";


export async function GET() {
  try {
    await connectDB();
    console.log("✅ Connected to MongoDB");

    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    console.log("📦 Token:", token);

    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    console.log("🔍 Decoded Token:", decoded);

    if (!decoded) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }

    const currentUser = await Users.findById(decoded.id);
    console.log("🙋‍♀️ Current User:", currentUser);

    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const { skillsOffered, skillsNeeded } = currentUser;
    console.log("🎯 Matching With:", { skillsOffered, skillsNeeded });

    const matchedUsers = await Users.find({
      _id: { $ne: currentUser._id },
      skillsOffered: { $in: skillsNeeded },
      skillsNeeded: { $in: skillsOffered },
    }).select("name email skillsOffered skillsNeeded");

    console.log("✅ Matched Users:", matchedUsers);

    return NextResponse.json({ matchedUsers }, { status: 200 });

  } catch (err) {
    console.error("❌ Matching Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
