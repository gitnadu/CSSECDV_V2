// app/api/auth/register/route.js
import { NextResponse } from "next/server";
import { connectDB } from "lib/db";
import { hashPassword } from "lib/auth";
import { isValidEmail, isValidPassword } from "@/lib/validation";
import mongoose from "mongoose";

await connectDB();

const UserSchema = new mongoose.Schema({
  email: String,
  passwordHash: String,
  role: String,
  failedLogins: { type: Number, default: 0 },
  passwordLastChangedAt: Date
});
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;
    if (!isValidEmail(email) || !isValidPassword(password)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const existing = await User.findOne({ email });
    if (existing) return NextResponse.json({ error: "User exists" }, { status: 409 });
    const pwHash = await hashPassword(password);
    const user = await User.create({ email, passwordHash: pwHash, role: "student", passwordLastChangedAt: new Date() });
    return NextResponse.json({ ok: true, id: user._id });
  } catch (e) {
    console.error('ERROR');
    return NextResponse.json({ error: "An error occurred" }, { status: 500 });
  }
}
