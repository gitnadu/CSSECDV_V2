import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function GET() {
  try {
    const sections = await SectionRepository.findAll();
    return NextResponse.json({ sections: sections.map(formatSection) });
  } catch (err) {
    console.error("[Section] GetAllSections error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
