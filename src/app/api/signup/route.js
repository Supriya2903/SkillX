import User from "@/models/Users";
import connectDB from "@/utils/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  await connectDB();

  try {
    const { name, email, password } = await req.json();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return new Response(JSON.stringify({ error: "User already exists!" }), {
        status: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      skillsOffered: [],
      skillsNeeded: [],
    });

    return new Response(JSON.stringify({ message: "User created", user: newUser }), {
      status: 201,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
