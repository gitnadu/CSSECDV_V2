'use client';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/**
 * GradesView - Shows student's enrolled sections and grades
 * Enrollments now include section info (course_code, section_name, etc.)
 * Grade scale: 0.0, 1.0, 1.5, 2.0, 2.5, 3.0, 3.5, 4.0 (NULL = not graded)
 */
export default function GradesView({ enrollments, onDrop }) {
  const getGradeColor = (grade) => {
    if (grade === null || grade === undefined || grade === 0) return 'text-gray-400';
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade)) return 'text-gray-400';
    if (numGrade >= 3.5) return 'text-green-600';  // 3.5-4.0 = Excellent
    if (numGrade >= 2.5) return 'text-blue-600';   // 2.5-3.0 = Good
    if (numGrade >= 1.5) return 'text-yellow-600'; // 1.5-2.0 = Passing
    return 'text-red-600';                          // 0.0-1.0 = Failing
  };

  const formatGrade = (grade) => {
    if (grade === null || grade === undefined || grade === 0) return 'N/A';
    return parseFloat(grade).toFixed(1);
  };

  const isGraded = (grade) => {
    return grade !== null && grade !== undefined && grade !== 0;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Enrolled Sections & Grades</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {enrollments.map(enrollment => {
            const graded = isGraded(enrollment.grade);

            return (
              <div
                key={enrollment.id}
                className="relative p-4 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-lg">
                      {enrollment.course_code}-{enrollment.section_name}
                    </p>
                    <p className="text-gray-700">{enrollment.course_name}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Professor: {enrollment.professor_name || 'TBA'}
                    </p>
                    {enrollment.enrolled_at && (
                      <p className="text-xs text-gray-400 mt-1">
                        Enrolled: {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Grade:</p>
                    <p className={`text-3xl font-bold ${getGradeColor(enrollment.grade)}`}>
                      {formatGrade(enrollment.grade)}
                    </p>
                    {graded && enrollment.graded_at && (
                      <p className="text-xs text-gray-400">
                        {new Date(enrollment.graded_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {/* Drop button - only show if not graded */}
                {!graded && onDrop && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => onDrop(enrollment.id)}
                  >
                    Drop Course
                  </Button>
                )}
                {graded && (
                  <p className="mt-3 text-xs text-gray-400">
                    Cannot drop - course has been graded
                  </p>
                )}
              </div>
            );
          })}
          {enrollments.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No enrollments yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Go to Available Sections to enroll in classes
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
