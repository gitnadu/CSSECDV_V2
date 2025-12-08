  import { NextResponse } from "next/server";
  import { SectionRepository } from "lib/sectionRepository";
  import { formatSection } from "lib/formatters";
  import { verifyToken } from "lib/auth";

  export async function GET() {
    try {
      const sections = await SectionRepository.findAll();
      return NextResponse.json({ sections: sections.map(formatSection) });
    } catch (err) {
      console.error("[Section] GetAllSections error:", err);
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

      const { course_id, section_name, capacity, schedule, professor_id } = await req.json();

      if (!course_id || !section_name) {
        return NextResponse.json(
          { error: "Course ID and section name are required" },
          { status: 400 }
        );
      }

      // Validate section_name is a single character A-Z
      const sectionUpper = section_name.trim().toUpperCase();
      if (sectionUpper.length !== 1 || !/^[A-Z]$/.test(sectionUpper)) {
        return NextResponse.json(
          { error: "Section name must be a single letter (A-Z)" },
          { status: 400 }
        );
      }

      const capacityNum = capacity ? parseInt(capacity) : 5;
      if (capacityNum < 1) {
        return NextResponse.json(
          { error: "Capacity must be at least 1" },
          { status: 400 }
        );
      }

      const section = await SectionRepository.create({
        course_id: parseInt(course_id),
        section_name: sectionUpper,
        capacity: capacityNum,
        schedule: schedule || null,
        professor_id: professor_id || null
      });

      const sectionWithDetails = await SectionRepository.findById(section.id);
      return NextResponse.json({ section: formatSection(sectionWithDetails) }, { status: 201 });
    } catch (err) {
      console.error("[Section] CreateSection error:", err);
      return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
    }
  }
