import connectDB from "@/utils/db";
import Skill from "@/models/Skill";
import { verifyToken } from "@/utils/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req) {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        console.log("Token received:", token ? "Present" : "Missing");

        if (!token) {
            return NextResponse.json({ message: "Unauthorized - No token provided" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        console.log("Decoded JWT:", decoded);

        if (!decoded || !decoded.id) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const { title, description, level, category, skillType } = await req.json();
        console.log("Request body:", { title, description, level, category, skillType });

        // Validate required fields
        if (!title || !level || !category || !skillType) {
            return NextResponse.json({ 
                message: "Title, level, category, and skillType are required" 
            }, { status: 400 });
        }

        const skillData = {
            title,
            description: description || "",
            level,
            category,
            skillType,
            createdBy: decoded.id,
        };

        console.log("Creating skill with data:", skillData);

        const newSkill = new Skill(skillData);
        const savedSkill = await newSkill.save();

        console.log("Skill saved successfully:", savedSkill);

        return NextResponse.json({
            message: "Skill added successfully",
            skill: savedSkill
        }, { status: 201 });

    } catch (err) {
        console.error("Skill creation error:", err);

        if (err.name === 'ValidationError') {
            return NextResponse.json({
                message: "Validation error",
                details: err.message
            }, { status: 400 });
        }

        return NextResponse.json({
            message: "Server error",
            error: err.message
        }, { status: 500 });
    }
}


export async function GET() {
    try {
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        console.log("GET Token received:", token ? "Present" : "Missing");

        if (!token) {
            return NextResponse.json({ message: "Unauthorized - No token" }, { status: 401 });
        }

        const decoded = verifyToken(token);
        console.log("GET Decoded JWT:", decoded);

        if (!decoded || !decoded.id) {
            return NextResponse.json({ message: "Invalid token" }, { status: 401 });
        }

        const skills = await Skill.find({ createdBy: decoded.id });

        return NextResponse.json({ skills }, { status: 200 });

    } catch (err) {
        console.error("GET /api/skills error:", err);
        return NextResponse.json({
            message: "Server error",
            error: err.message
        }, { status: 500 });
    }
}
