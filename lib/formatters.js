// lib/formatters.js

export function formatCourse(course) {
  return {
    id: course.id,
    code: course.code,
    name: course.name,
    description: course.description || "",
  };
}

export function formatSection(section) {
  return {
    id: section.id,
    course_id: section.course_id,
    course_code: section.course_code || "",
    course_name: section.course_name || "",
    section_name: section.section_name,
    professor_id: section.professor_id,
    professor_name: section.professor_name || "",
    capacity: section.capacity,
    enrolled_count: section.enrolled_count,
    schedule: section.schedule || "",
    is_open: section.is_open !== false,
  };
}
