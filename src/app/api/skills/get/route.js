import {NextResponse} from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/utils/auth';
import connectDB from '@/utils/db';
import Skill from '@/models/Skill';

export async function GET(){
    try{
        const cookieStore = cookies();
        const token = (await cookieStore).get("token")?.value;

        if(!token){
            return NextResponse.json({ message : "Unauthorized"}, {status : 401});
        }

        const decoded = verifyToken(token);
        if(!decoded){
            return NextResponse.json({message : "Invalid token"}, {status : 403})
        }

        await connectDB();
        const skills = await Skill.find({ createdBy: decoded.id}).sort({createdAt: -1});

        return NextResponse.json({skills}, {status: 200});
    } catch (err){
        console.error("Error fetching skills:",err);
        return NextResponse({message: "Server Error"}, {status: 500})
    }
}