import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function POST(req, { params }) {
  const { id } = params;
  const { is_open } = await req.json();

  try {
    await SectionRepository.toggleEnrollmentStatus(id, is_open);
    const updated = await SectionRepository.findById(id);
    return NextResponse.json({ section: formatSection(updated) });
  } catch (err) {
    console.error("[Section] Toggle error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
