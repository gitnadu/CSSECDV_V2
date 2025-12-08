'use client';
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useSession  } from "@/context/SessionProvider";


export default function FacultyView({ enrollments, sections }) {

  const { uploadGrade, toggleEnrollment } = useSession();

  const [gradeForm, setGradeForm] = useState({ enrollmentId: '', grade: '' });
  const [error, setError] = useState('');
  const [selectedSection, setSelectedSection] = useState('all');
  const [sortBy, setSortBy] = useState('student'); // 'student', 'grade', 'enrollment_id'
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('by-section'); // 'by-section' or 'all'


  // Valid grade options
  const gradeOptions = [
    { value: '', label: 'Select Grade' },
    { value: '1.00', label: '1.00' },
    { value: '1.50', label: '1.50' },
    { value: '2.00', label: '2.00' },
    { value: '2.50', label: '2.50' },
    { value: '3.00', label: '3.00' },
    { value: '4.00', label: '4.00' },
    { value: '0.00', label: '0.00 (Failure)' }
  ];

  // Group enrollments by section and include all professor's sections (even with 0 enrollments)
  const enrollmentsBySection = useMemo(() => {
    // First, create entries for all professor's sections
    const sectionMap = {};
    
    sections.forEach(section => {
      const sectionKey = `${section.course_code}-${section.section_name}`;
      sectionMap[sectionKey] = {
        course_code: section.course_code,
        course_name: section.course_name,
        section_name: section.section_name,
        enrollments: []
      };
    });

    // Then add enrollments to their respective sections
    enrollments.forEach(enrollment => {
      const sectionKey = `${enrollment.course_code}-${enrollment.section_name}`;
      if (sectionMap[sectionKey]) {
        sectionMap[sectionKey].enrollments.push(enrollment);
      }
    });

    return sectionMap;
  }, [enrollments, sections]);

  // Get section options for filter
  const sectionOptions = useMemo(() => {
    return Object.keys(enrollmentsBySection).sort();
  }, [enrollmentsBySection]);

  // Filter and sort enrollments
  const filteredAndSortedEnrollments = useMemo(() => {
    let filtered = enrollments;

    // Filter by section
    if (selectedSection !== 'all') {
      filtered = enrollmentsBySection[selectedSection]?.enrollments || [];
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(e => 
        e.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.id?.toString().includes(searchTerm) ||
        e.course_code?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'student':
          return (a.student_name || '').localeCompare(b.student_name || '');
        case 'grade':
          const gradeA = a.grade ? parseFloat(a.grade) : 999;
          const gradeB = b.grade ? parseFloat(b.grade) : 999;
          return gradeA - gradeB;
        case 'enrollment_id':
          return a.id - b.id;
        default:
          return 0;
      }
    });

    return sorted;
  }, [enrollments, enrollmentsBySection, selectedSection, searchTerm, sortBy]);


const handleSubmit = () => {
    // Clear previous errorf
    setError('');

    // Validate enrollment ID
    if (!gradeForm.enrollmentId || gradeForm.enrollmentId.trim() === '') {
      setError('Please enter an Enrollment ID');
      return;
    }

    // Validate grade
    if (!gradeForm.grade || gradeForm.grade === '') {
      setError('Please select a grade');
      return;
    }

    // Check if enrollment ID exists
    const enrollmentExists = enrollments.some(
      e => e.id === parseInt(gradeForm.Id)
    );

    if (!enrollmentExists) {
      setError('Enrollment ID not found in your sections');
      return;
    }

    // Submit if validation passes
    uploadGrade(parseInt(gradeForm.enrollmentId), gradeForm.grade);
    setGradeForm({ enrollmentId: '', grade: '' });
    setError('');
  };

  // Statistics
  const stats = useMemo(() => {
    const total = enrollments.length;
    const graded = enrollments.filter(e => e.grade).length;
    const ungraded = total - graded;
    const avgGrade = graded > 0 
      ? enrollments
          .filter(e => e.grade && !isNaN(parseFloat(e.grade)))
          .reduce((sum, e) => sum + parseFloat(e.grade), 0) / graded
      : 0;
    
    return { total, graded, ungraded, avgGrade };
  }, [enrollments]);

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Students</CardDescription>
            <CardTitle className="text-3xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Graded</CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.graded}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Ungraded</CardDescription>
            <CardTitle className="text-3xl text-amber-600">{stats.ungraded}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Grade</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {stats.avgGrade > 0 ? stats.avgGrade.toFixed(2) : 'N/A'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Main Card */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Student Grades</CardTitle>
          <CardDescription>
            View and grade students in your sections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={viewMode} onValueChange={setViewMode} className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="by-section">By Section</TabsTrigger>
              <TabsTrigger value="all">All Students</TabsTrigger>
            </TabsList>

            <TabsContent value="by-section" className="space-y-4">
              {/* Section Tabs */}
              {sectionOptions.length > 0 ? (
                <Tabs defaultValue={sectionOptions[0]} className="space-y-4">
                  <TabsList className="flex flex-wrap h-auto">
                    {sectionOptions.map(sectionKey => (
                      <TabsTrigger key={sectionKey} value={sectionKey} className="flex-none">
                        {sectionKey} ({enrollmentsBySection[sectionKey].enrollments.length})
                      </TabsTrigger>
                    ))}
                  </TabsList>

                  {sectionOptions.map(sectionKey => {
                    const section = enrollmentsBySection[sectionKey];
                    // Find the full section data to get is_open status and section ID
                    const fullSection = sections.find(s => 
                      s.course_code === section.course_code && s.section_name === section.section_name
                    );
                    const isOpen = fullSection?.is_open !== false;
                    const sectionId = fullSection?.id;

                    return (
                      <TabsContent key={sectionKey} value={sectionKey} className="space-y-4">
                        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold">
                              {section.course_code}-{section.section_name}
                            </h3>
                            <p className="text-sm text-gray-500">{section.course_name}</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right text-sm">
                              <p className="text-gray-500">{section.enrollments.filter(e => e.grade).length}/{section.enrollments.length} graded</p>
                              <p className={`font-semibold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                {isOpen ? 'Enrollment Open' : 'Enrollment Closed'}
                              </p>
                            </div>
                            {sectionId && (
                              <Button
                                onClick={() => toggleEnrollment(sectionId, !isOpen)}
                                variant={isOpen ? 'destructive' : 'default'}
                                size="sm"
                              >
                                {isOpen ? 'Close Enrollment' : 'Open Enrollment'}
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Student List */}
                        <div className="space-y-2">
                          {section.enrollments
                            .sort((a, b) => (a.student_name || '').localeCompare(b.student_name || ''))
                            .map(enrollment => (
                              <EnrollmentCard 
                                key={enrollment.id} 
                                enrollment={enrollment}
                                gradeOptions={gradeOptions}
                                uploadGrade={uploadGrade}
                              />
                            ))}
                        </div>
                      </TabsContent>
                    );
                  })}
                </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No sections assigned
                </div>
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-4">
              {/* Filters and Search */}
              <div className="grid grid-cols-3 gap-4">
                <Input
                  placeholder="Search student name or enrollment ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="all">All Sections</option>
                  {sectionOptions.map(section => (
                    <option key={section} value={section}>
                      {section} ({enrollmentsBySection[section].enrollments.length})
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="student">Sort by: Student Name</option>
                  <option value="grade">Sort by: Grade</option>
                  <option value="id">Sort by: Enrollment ID</option>
                </select>
              </div>

              {/* Student List */}
              <div className="space-y-2">
                {filteredAndSortedEnrollments.map(enrollment => (
                  <EnrollmentCard 
                    enrollment={enrollment}
                    gradeOptions={gradeOptions}
                    uploadGrade={uploadGrade}
                  />
                ))}
                {filteredAndSortedEnrollments.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No enrollments found
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Enrollment Card Component
function EnrollmentCard({ enrollment, gradeOptions, uploadGrade }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newGrade, setNewGrade] = useState(enrollment.grade || '');

  const handleSave = () => {
    if (newGrade && newGrade !== '') {
      console.log('Uploading grade:', newGrade, 'for enrollment ID:', enrollment.id);
      uploadGrade(enrollment.id, newGrade);
      setIsEditing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <p className="font-semibold text-lg">{enrollment.student_name || 'Unknown'}</p>
              <p className="text-xs text-gray-500">
                ID: {enrollment.id} | {enrollment.course_code}-{enrollment.section_name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isEditing ? (
            <>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(e.target.value)}
                className="flex h-10 w-32 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {gradeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <Button onClick={handleSave} size="sm" className="w-20">
                Save
              </Button>
              <Button onClick={() => setIsEditing(false)} size="sm" variant="outline" className="w-20">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="text-right min-w-[80px]">
                <p className="text-xs text-gray-500">Grade</p>
                <p className="text-2xl font-bold">
                  {enrollment.grade ? (
                    parseFloat(enrollment.grade).toFixed(2)
                  ) : (
                    <span className="text-gray-400 text-base">Not graded</span>
                  )}
                </p>
              </div>
              <Button onClick={() => setIsEditing(true)} size="sm" className="w-24">
                {enrollment.grade ? 'Update' : 'Grade'}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}