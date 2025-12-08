import { NextResponse } from "next/server";
import { EnrollmentRepository } from "@/lib/enrollmentRepository";

export async function GET(req, { params }) {
  const { id } = params;

  const enrollments = await EnrollmentRepository.findByStudentId(id);

  return NextResponse.json({ success: true, enrollments });
}
