import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Users from "@/models/Users";
import Skill from "@/models/Skill";
import Notification from "@/models/Notification";
import Fuse from "fuse.js";

// Skill category weights for better matching
const CATEGORY_WEIGHTS = {
  'Programming': 1.2,
  'Web Development': 1.2,
  'Data Science': 1.1,
  'Machine Learning': 1.1,
  'UI/UX Design': 1.0,
  'Digital Marketing': 1.0,
  'Other': 0.8
};

// Level compatibility matrix
const LEVEL_COMPATIBILITY = {
  'Beginner': { 'Beginner': 0.6, 'Intermediate': 1.0, 'Advanced': 1.2 },
  'Intermediate': { 'Beginner': 0.8, 'Intermediate': 1.0, 'Advanced': 1.1 },
  'Advanced': { 'Beginner': 0.5, 'Intermediate': 0.9, 'Advanced': 1.0 }
};

export async function GET(request) {
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
    
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit')) || 20;
    const category = url.searchParams.get('category');
    const level = url.searchParams.get('level');
    const location = url.searchParams.get('location');
    
    // Get current user with populated skill details
    const currentUser = await Users.findById(decoded.id);
    if (!currentUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    
    // Get user's skills from the Skill collection
    const userOfferedSkills = await Skill.find({
      createdBy: decoded.id,
      skillType: 'Offering',
      isActive: true
    });
    
    const userNeededSkills = await Skill.find({
      createdBy: decoded.id,
      skillType: 'Learning',
      isActive: true
    });
    
    // Get all other users with their skills
    const allUsers = await Users.find({
      _id: { $ne: currentUser._id },
      isActive: { $ne: false }
    })
    .select('name email avatar bio location preferences stats badges isEmailVerified')
    .lean();
    
    // Enhanced matching algorithm
    const calculateAdvancedMatchScore = async (user) => {
      let totalScore = 0;
      let factors = [];
      
      // Get other user's skills
      const otherUserOfferedSkills = await Skill.find({
        createdBy: user._id,
        skillType: 'Offering',
        isActive: true
      });
      
      const otherUserNeededSkills = await Skill.find({
        createdBy: user._id,
        skillType: 'Learning',
        isActive: true
      });
      
      // Extract simple arrays of titles for UI consumption
      const offeredTitles = otherUserOfferedSkills.map(s => s.title);
      const neededTitles = otherUserNeededSkills.map(s => s.title);
      
      // 1. Skill Complementarity (40% weight)
      let skillScore = 0;
      let skillMatches = [];
      
      // Current user needs → Other user offers
      for (const neededSkill of userNeededSkills) {
        for (const offeredSkill of otherUserOfferedSkills) {
          const textMatch = calculateTextSimilarity(neededSkill.title, offeredSkill.title);
          const categoryMatch = neededSkill.category === offeredSkill.category ? 1.2 : 0.8;
          const levelCompatibility = LEVEL_COMPATIBILITY[neededSkill.level]?.[offeredSkill.level] || 0.5;
          const categoryWeight = CATEGORY_WEIGHTS[offeredSkill.category] || 1.0;
          
          if (textMatch > 0.3) {
            const matchScore = textMatch * categoryMatch * levelCompatibility * categoryWeight;
            skillScore += matchScore;
            skillMatches.push({
              type: 'learn',
              skill: neededSkill.title,
              match: offeredSkill.title,
              score: matchScore,
              teacherLevel: offeredSkill.level,
              learnerLevel: neededSkill.level
            });
          }
        }
      }
      
      
      // Current user offers → Other user needs
      for (const offeredSkill of userOfferedSkills) {
        for (const neededSkill of otherUserNeededSkills) {
          const textMatch = calculateTextSimilarity(offeredSkill.title, neededSkill.title);
          const categoryMatch = offeredSkill.category === neededSkill.category ? 1.2 : 0.8;
          const levelCompatibility = LEVEL_COMPATIBILITY[offeredSkill.level]?.[neededSkill.level] || 0.5;
          const categoryWeight = CATEGORY_WEIGHTS[offeredSkill.category] || 1.0;
          
          if (textMatch > 0.3) {
            const matchScore = textMatch * categoryMatch * levelCompatibility * categoryWeight;
            skillScore += matchScore;
            skillMatches.push({
              type: 'teach',
              skill: offeredSkill.title,
              match: neededSkill.title,
              score: matchScore,
              teacherLevel: offeredSkill.level,
              learnerLevel: neededSkill.level
            });
          }
        }
      }
      
      totalScore += skillScore * 0.4;
      factors.push({ name: 'Skill Match', score: skillScore, weight: 0.4 });
      
      // 2. User Activity & Engagement (20% weight)
      let activityScore = 0;
      if (user.stats?.lastActive) {
        const daysSinceActive = (Date.now() - new Date(user.stats.lastActive)) / (1000 * 60 * 60 * 24);
        activityScore = Math.max(0, 1 - (daysSinceActive / 30)); // Decay over 30 days
      }
      activityScore += (user.stats?.successfulExchanges || 0) * 0.1;
      activityScore += (user.stats?.rating || 0) / 5; // Normalize rating to 0-1
      activityScore += user.isEmailVerified ? 0.2 : 0;
      
      totalScore += activityScore * 0.2;
      factors.push({ name: 'User Activity', score: activityScore, weight: 0.2 });
      
      // 3. Profile Completeness (15% weight)
      let profileScore = 0;
      profileScore += user.avatar ? 0.3 : 0;
      profileScore += user.bio ? 0.3 : 0;
      profileScore += user.location?.city ? 0.2 : 0;
      profileScore += user.badges?.length ? Math.min(0.2, user.badges.length * 0.05) : 0;
      
      totalScore += profileScore * 0.15;
      factors.push({ name: 'Profile Complete', score: profileScore, weight: 0.15 });
      
      // 4. Geographic Proximity (10% weight)
      let locationScore = 0;
      if (currentUser.location?.city && user.location?.city) {
        if (currentUser.location.city.toLowerCase() === user.location.city.toLowerCase()) {
          locationScore = 1.0; // Same city
        } else if (currentUser.location.country?.toLowerCase() === user.location.country?.toLowerCase()) {
          locationScore = 0.6; // Same country
        } else {
          locationScore = 0.3; // Different country but location provided
        }
      } else {
        locationScore = 0.1; // No location data
      }
      
      totalScore += locationScore * 0.1;
      factors.push({ name: 'Location', score: locationScore, weight: 0.1 });
      
      // 5. Availability & Preferences (10% weight)
      let availabilityScore = 0;
      if (user.preferences?.availableForMentoring) {
        availabilityScore += 0.5;
      }
      if (currentUser.preferences?.preferredCommunication === user.preferences?.preferredCommunication) {
        availabilityScore += 0.3;
      }
      availabilityScore += Math.random() * 0.2; // Add slight randomness to avoid stale results
      
      totalScore += availabilityScore * 0.1;
      factors.push({ name: 'Availability', score: availabilityScore, weight: 0.1 });
      
      // 6. Mutual Learning Potential (5% weight)
      let mutualScore = skillMatches.filter(m => m.type === 'learn').length > 0 && 
                       skillMatches.filter(m => m.type === 'teach').length > 0 ? 1.0 : 0.5;
      
      totalScore += mutualScore * 0.05;
      factors.push({ name: 'Mutual Learning', score: mutualScore, weight: 0.05 });
      
      return {
        totalScore,
        factors,
        skillMatches,
        // include simple skills arrays for UI rendering
        offeredTitles,
        neededTitles,
        recommendation: generateRecommendationText(skillMatches, totalScore)
      };
    };
    
    // Calculate matches for all users
    const matchPromises = allUsers.map(async (user) => {
      const matchData = await calculateAdvancedMatchScore(user);
      return {
        ...user,
        matchScore: matchData.totalScore,
        matchFactors: matchData.factors,
        skillMatches: matchData.skillMatches,
        // expose arrays used by UI
        skillsOffered: matchData.offeredTitles,
        skillsNeeded: matchData.neededTitles,
        recommendation: matchData.recommendation
      };
    });
    
    let allMatches = await Promise.all(matchPromises);
    
    // Apply filters
    if (category) {
      allMatches = allMatches.filter(user => 
        user.skillMatches.some(match => 
          match.skill.toLowerCase().includes(category.toLowerCase())
        )
      );
    }
    
    if (location) {
      allMatches = allMatches.filter(user => 
        user.location?.city?.toLowerCase().includes(location.toLowerCase()) ||
        user.location?.country?.toLowerCase().includes(location.toLowerCase())
      );
    }
    
    // Sort by match score and limit results
    const matchedUsers = allMatches
      .filter(user => user.matchScore > 0.2) // Minimum threshold
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, limit);
    
    // Create notifications for high-quality matches (score > 0.7)
    const highQualityMatches = matchedUsers.filter(user => user.matchScore > 0.7);
    for (const match of highQualityMatches.slice(0, 3)) { // Notify only top 3
      try {
        await Notification.createFromTemplate(
          'skill_match',
          decoded.id,
          { userName: match.name },
          {
            data: {
              userId: match._id,
              matchScore: match.matchScore
            },
            actionUrl: `/profile/${match._id}`,
            priority: 'normal'
          }
        );
      } catch (notifError) {
        console.error('Failed to create match notification:', notifError);
      }
    }
    
    return NextResponse.json({
      matchedUsers,
      total: matchedUsers.length,
      filters: { category, level, location },
      suggestions: generateMatchSuggestions(currentUser, userOfferedSkills, userNeededSkills)
    });
    
  } catch (err) {
    console.error("❌ Advanced Matching Error:", err);
    return NextResponse.json({ message: "Server error", error: err.message }, { status: 500 });
  }
}

// Helper function for text similarity
function calculateTextSimilarity(text1, text2) {
  const fuse = new Fuse([text2], {
    threshold: 0.4,
    distance: 100,
    includeScore: true
  });
  
  const result = fuse.search(text1);
  if (result.length > 0) {
    return 1 - result[0].score;
  }
  
  // Check for partial matches
  if (text1.toLowerCase().includes(text2.toLowerCase()) || 
      text2.toLowerCase().includes(text1.toLowerCase())) {
    return 0.7;
  }
  
  return 0;
}

// Generate recommendation text
function generateRecommendationText(skillMatches, totalScore) {
  if (totalScore > 0.8) {
    return "Excellent match! Strong skill compatibility and high engagement.";
  } else if (totalScore > 0.6) {
    return "Great match! Good skill overlap and active user.";
  } else if (totalScore > 0.4) {
    return "Good match! Some skill compatibility found.";
  } else {
    return "Potential match. Consider exploring this connection.";
  }
}

// Generate match suggestions
function generateMatchSuggestions(user, offeredSkills, neededSkills) {
  const suggestions = [];
  
  if (offeredSkills.length === 0) {
    suggestions.push({
      type: 'add_skills',
      message: 'Add skills you can teach to find more matches',
      action: 'Add Skills'
    });
  }
  
  if (neededSkills.length === 0) {
    suggestions.push({
      type: 'add_learning',
      message: 'Add skills you want to learn to discover mentors',
      action: 'Add Learning Goals'
    });
  }
  
  if (!user.bio) {
    suggestions.push({
      type: 'complete_profile',
      message: 'Complete your profile to improve match quality',
      action: 'Update Profile'
    });
  }
  
  return suggestions;
}
