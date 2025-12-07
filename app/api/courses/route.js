import { NextResponse } from "next/server";
import { CourseRepository } from "@/lib/courseRepository";
import { formatCourse } from "@/lib/formatters";

export async function GET() {
  try {
    const courses = await CourseRepository.findAll();
    return NextResponse.json({ courses: courses.map(formatCourse) });
  } catch (err) {
    console.error("[Course] GetAllCourses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
