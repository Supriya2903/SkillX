import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/utils/auth";
import connectDB from "@/utils/db";
import Skill from "@/models/Skill";
import { PathParamsContext } from "next/dist/shared/lib/hooks-client-context.shared-runtime";

export async function DELETE(req, {params}) {
    try{
        await connectDB();

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;
        const user = verifyToken(token);

        if(!user){
            return NextResponse.json({ message: "Unauthorized"}, {status: 401});
        }

        const skillId = params.id;

        const deletedSkill = await Skill.findOneAndDelete({
            _id : skillId,
            createdBy: user.id,
        })

        if(!deletedSkill){
            return NextResponse.json({message: "Skill not found"}, {status: 404});
        }
        return NextResponse.json({message: "Skill deleted successfully"});
    }catch(err){
        console.error("Delete error:", err);
        return NextResponse.json({message: "Server error"}, {status: 500});
    }
}