import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function GET(req, { params }) {
  const { courseId } = params;

  try {
    const sections = await SectionRepository.findByCourseId(courseId);
    return NextResponse.json({ sections: sections.map(formatSection) });
  } catch (err) {
    console.error("[Section] GetSectionsByCourse error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
