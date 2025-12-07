import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function GET(req, { params }) {
  const { id } = params;

  try {
    const section = await SectionRepository.findById(id);
    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json({ section: formatSection(section) });
  } catch (err) {
    console.error("[Section] GetSectionById error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
