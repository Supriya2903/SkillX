import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear the token cookie
    const cookieStore = cookies();
    cookieStore.delete("token");

    return NextResponse.json({ 
      message: "Logged out successfully" 
    }, { status: 200 });

  } catch (err) {
    console.error("Logout error:", err);
    return NextResponse.json({ 
      message: "Server error" 
    }, { status: 500 });
  }
}
