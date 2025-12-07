// app/api/courses/list/route.js
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import mongoose from "mongoose";

await connectDB();
const CourseSchema = new mongoose.Schema({
  code: String,
  title: String,
  slots: Number
});
const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

export async function GET() {
  const courses = await Course.find().lean().limit(100);
  return NextResponse.json({ courses });
}
