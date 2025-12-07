import { NextResponse } from "next/server";
import { SectionRepository } from "@/lib/sectionRepository";
import { formatSection } from "@/lib/formatters";

export async function POST(req, { params }) {
  const { id } = params;

  try {
    await SectionRepository.incrementEnrollment(id);
    const updated = await SectionRepository.findById(id);
    return NextResponse.json({ section: formatSection(updated) });
  } catch (err) {
    if (err.message === "Section not found") {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }
    if (err.message === "Section is full") {
      return NextResponse.json({ error: "Section is full" }, { status: 409 });
    }

    console.error("[Section] Increment error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
