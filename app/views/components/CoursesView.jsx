'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { useSession  } from "@/context/SessionProvider";

/**
 * CoursesView - Displays sections for enrollment
 * Now shows SECTIONS (concrete) instead of courses (abstract)
 * Each section has: course code, section name, professor, capacity (max 5)
 */
export default function CoursesView({userRole}) {

  const { enroll, sections, enrollments, loadSectionsAndEnrollments } = useSession();

  const [loadingSection, setLoadingSection] = useState(null);
  const [error, setError] = useState("");

  const enrolledSectionIds = enrollments.map(e => e.section_id);
  const enrolledCourseIds = enrollments.map(e => e.course_id);

  const handleEnroll = async (sectionId) => {
    setError("");
    setLoadingSection(sectionId); // show loading state on that button only

    try {
      const result = await enroll(sectionId);  // call SessionProvider.enroll

      if (!result.success) {
        setError(result.error || "Enrollment failed");
      }

      // If success → SessionProvider updates global state → UI re-renders
      await loadSectionsAndEnrollments(userRole); // refresh data to reflect new enrollment
    } catch (err) {
      console.error("Enroll error:", err);
      setError("Unexpected enrollment error");
    } finally {
      setLoadingSection(null);
    }
  };

  // Group sections by course for better organization
  const sectionsByCourse = sections.reduce((acc, section) => {
    const courseCode = section.course_code;
    if (!acc[courseCode]) {
      acc[courseCode] = {
        course_name: section.course_name,
        course_id: section.course_id,
        sections: []
      };
    }
    acc[courseCode].sections.push(section);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(sectionsByCourse).map(([courseCode, courseData]) => (
        <div key={courseCode} className="space-y-3">
          <h3 className="text-lg font-semibold border-b pb-2">
            {courseCode} - {courseData.course_name}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courseData.sections.map(section => {

              const isFull = section.enrolled_count >= section.capacity;
              const isEnrolled = enrolledSectionIds.includes(section.id);
              const isEnrolledInCourse = enrolledCourseIds.includes(section.course_id);
              const isClosed = section.is_open === false;
              const canEnroll = !isFull && !isClosed && !isEnrolledInCourse;

              return (
                <Card key={section.id} className={isEnrolled ? 'border-green-500 border-2' : isClosed ? 'border-red-300 border-2 bg-gray-50' : ''}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex justify-between items-center">
                      <span>{section.course_code}-{section.section_name}</span>
                      <div className="flex gap-2">
                        {isClosed && (
                          <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                            Closed
                          </span>
                        )}
                        {isEnrolled && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Enrolled
                          </span>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription>{section.professor_name || 'TBA'}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      {/* {section.schedule && (
                        <p><strong>Schedule:</strong> {section.schedule}</p>
                      )} */}
                      <p><strong>Capacity:</strong> {section.enrolled_count}/{section.capacity}</p>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${isFull ? 'bg-red-500' : isClosed ? 'bg-gray-400' : 'bg-blue-600'}`}
                          style={{ width: `${(section.enrolled_count / section.capacity) * 100}%` }}
                        />
                      </div>
                      {userRole === 'student' && !isEnrolled && (
                        <Button
                          onClick={() => handleEnroll(section.id)}
                          disabled={!canEnroll || loadingSection === section.id}
                          className="w-full mt-2"
                          size="sm"
                        >
                          {loadingSection === section.id
                            ? "Processing..."
                            : isClosed 
                              ? 'Closed'
                              : isFull 
                                ? 'Full'
                                : isEnrolledInCourse
                                  ? 'Already in Course'
                                  : 'Enroll'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ))}
      {sections.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No sections available
        </div>
      )}
    </div>
  );
}
