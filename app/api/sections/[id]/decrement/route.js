import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function POST(req, { params }) {
  const { id } = params;

  try {
    await SectionRepository.decrementEnrollment(id);
    const updated = await SectionRepository.findById(id);
    return NextResponse.json({ section: formatSection(updated) });
  } catch (err) {
    console.error("[Section] Decrement error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
