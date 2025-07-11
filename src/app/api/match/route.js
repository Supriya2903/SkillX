import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Users from "@/models/Users";
import Fuse from "fuse.js";


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

    const normalizeSkills = skills => skills.map(skill => skill.toLowerCase().trim());

    // Get all other users
    const allUsers = await Users.find({ _id: { $ne: currentUser._id } }).select("name email skillsOffered skillsNeeded");

    // Normalize current user's skills
    const currentUserSkillsOffered = normalizeSkills(skillsOffered || []);
    const currentUserSkillsNeeded = normalizeSkills(skillsNeeded || []);

    console.log("🎯 Current User Skills:", { offered: currentUserSkillsOffered, needed: currentUserSkillsNeeded });

    // Function to calculate fuzzy match score between two skills
    const calculateSkillMatch = (skill1, skill2) => {
      if (skill1 === skill2) return 1.0; // Perfect match
      
      // Use Fuse.js for fuzzy matching between individual skills
      const fuse = new Fuse([skill2], {
        threshold: 0.4, // More lenient for individual skill matching
        distance: 100,
        includeScore: true
      });
      
      const result = fuse.search(skill1);
      if (result.length > 0) {
        // Convert Fuse.js score (lower is better) to match score (higher is better)
        return 1 - result[0].score;
      }
      
      // Check for partial matches
      if (skill1.includes(skill2) || skill2.includes(skill1)) {
        return 0.7; // Partial match score
      }
      
      return 0; // No match
    };

    // Function to calculate overall match score for a user
    const calculateUserMatchScore = (user) => {
      const userSkillsOffered = normalizeSkills(user.skillsOffered || []);
      const userSkillsNeeded = normalizeSkills(user.skillsNeeded || []);
      
      let totalScore = 0;
      let matchCount = 0;
      
      // Check if current user's needed skills match with this user's offered skills
      currentUserSkillsNeeded.forEach(neededSkill => {
        userSkillsOffered.forEach(offeredSkill => {
          const score = calculateSkillMatch(neededSkill, offeredSkill);
          if (score > 0.3) { // Only count significant matches
            totalScore += score;
            matchCount++;
          }
        });
      });
      
      // Check if current user's offered skills match with this user's needed skills
      currentUserSkillsOffered.forEach(offeredSkill => {
        userSkillsNeeded.forEach(neededSkill => {
          const score = calculateSkillMatch(offeredSkill, neededSkill);
          if (score > 0.3) { // Only count significant matches
            totalScore += score;
            matchCount++;
          }
        });
      });
      
      return matchCount > 0 ? totalScore / matchCount : 0;
    };

    // Calculate match scores for all users
    const usersWithScores = allUsers.map(user => ({
      ...user.toObject(),
      matchScore: calculateUserMatchScore(user)
    }));

    // Filter users with meaningful matches and sort by score
    let matchedUsers = usersWithScores
      .filter(user => user.matchScore > 0.3) // Only include users with decent matches
      .sort((a, b) => b.matchScore - a.matchScore) // Sort by match score (highest first)
      .slice(0, 20); // Limit to top 20 matches

    // Fallback strategy for small datasets
    if (matchedUsers.length === 0 && allUsers.length > 0) {
      console.log("⚠️ No high-quality matches found. Using fallback strategy...");
      
      // Lower the threshold to find any potential matches
      matchedUsers = usersWithScores
        .filter(user => user.matchScore > 0.1) // Lower threshold
        .sort((a, b) => b.matchScore - a.matchScore)
        .slice(0, 10); // Limit to top 10 matches
      
      // If still no matches, show users with at least one skill in common
      if (matchedUsers.length === 0) {
        console.log("⚠️ No matches with score > 0.1. Showing users with any skill overlap...");
        
        matchedUsers = usersWithScores
          .filter(user => user.matchScore > 0) // Any match at all
          .sort((a, b) => b.matchScore - a.matchScore)
          .slice(0, 5); // Limit to top 5 matches
      }
    }

    console.log("✅ Final Matched Users:", matchedUsers.length, "matches found");
    console.log("📊 Match scores:", matchedUsers.map(u => ({ name: u.name, score: u.matchScore })));

    return NextResponse.json({ matchedUsers }, { status: 200 });

  } catch (err) {
    console.error("❌ Matching Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
