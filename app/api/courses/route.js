import { NextResponse } from "next/server";
import { CourseRepository } from "@/lib/courseRepository";
import { formatCourse } from "@/lib/formatters";
import { verifyToken } from "@/lib/auth";

export async function GET() {
  try {
    const courses = await CourseRepository.findAll();
    return NextResponse.json({ courses: courses.map(formatCourse) });
  } catch (err) {
    console.error("[Course] GetAllCourses error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const token = req.cookies.get("session")?.value;
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { code, name, description } = await req.json();

    if (!code || !name) {
      return NextResponse.json(
        { error: "Course code and name are required" },
        { status: 400 }
      );
    }

    // Check if course code already exists
    const existing = await CourseRepository.findByCode(code);
    if (existing) {
      return NextResponse.json(
        { error: "Course code already exists" },
        { status: 400 }
      );
    }

    const course = await CourseRepository.create({
      code,
      name,
      description: description || null
    });

    return NextResponse.json({ course: formatCourse(course) }, { status: 201 });
  } catch (err) {
    console.error("[Course] CreateCourse error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
