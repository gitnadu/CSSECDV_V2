import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function GET() {

  try {
    const sections = await SectionRepository.findByProfessorId(professorId);
    return NextResponse.json({ sections: sections.map(formatSection) });
  } catch (err) {
    console.error("[Section] GetSectionsByProfessor error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
