import { NextResponse } from "next/server";
import { CourseRepository } from "lib/courseRepository";
import { formatCourse } from "lib/formatters";

export async function GET(req, { params }) {
  const { code } = params;

  if (!code) {
    return NextResponse.json({ error: "Course code required" }, { status: 400 });
  }

  try {
    const course = await CourseRepository.findByCode(code);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    return NextResponse.json({ course: formatCourse(course) });
  } catch (err) {
    console.error('ERROR');
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
