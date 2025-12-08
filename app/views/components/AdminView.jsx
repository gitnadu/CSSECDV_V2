'use client';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/ui/button';

export default function AdminView({ session }) {
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentEnrollments, setStudentEnrollments] = useState([]);
  const [notification, setNotification] = useState(null);
  const [dropConfirmation, setDropConfirmation] = useState(null);
  const [newCourseData, setNewCourseData] = useState({ code: '', name: '', description: '' });
  const [showAddSectionModal, setShowAddSectionModal] = useState(false);
  const [newSectionData, setNewSectionData] = useState({ course_id: '', section_name: '', capacity: '5', schedule: '', professor_id: '' });

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel with cookie credentials
      const [facultyRes, studentsRes, coursesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/faculty', { credentials: 'include' }),
        fetch('/api/admin/students', { credentials: 'include' }),
        fetch('/api/admin/courses', { credentials: 'include' }),
        fetch('/api/admin/sections', { credentials: 'include' })
      ]);

      if (!facultyRes.ok || !studentsRes.ok || !coursesRes.ok || !sectionsRes.ok) {
        throw new Error('Failed to fetch admin data');
      }

      const [facultyData, studentsData, coursesData, sectionsData] = await Promise.all([
        facultyRes.json(),
        studentsRes.json(),
        coursesRes.json(),
        sectionsRes.json()
      ]);

      setFaculty(facultyData.faculty || []);
      setStudents(studentsData.students || []);
      setCourses(coursesData.courses || []);
      setSections(sectionsData.sections || []);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update role');
      }

      alert('Role updated successfully');
      setShowRoleModal(false);
      setSelectedFaculty(null);
      await fetchAdminData();
    } catch (err) {
      console.error('Error updating role:', err);
      alert(err.message || 'Failed to update role');
    }
  };

  const handleAssignToSection = async () => {
    if (!selectedFaculty || !selectedSection) return;

    try {
      const response = await fetch(`/api/admin/sections/${selectedSection.id}/assign`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professor_id: selectedFaculty.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to assign professor');
      }

      alert('Professor assigned successfully');
      setShowAssignModal(false);
      setSelectedFaculty(null);
      setSelectedSection(null);
      await fetchAdminData();
    } catch (err) {
      console.error('Error assigning professor:', err);
      alert(err.message || 'Failed to assign professor');
    }
  };

  const handleViewStudentEnrollments = async (student) => {
    try {
      setSelectedStudent(student);
      const response = await fetch(`/api/admin/students/${student.id}/enrollments`, {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await response.json();
      setStudentEnrollments(data.enrollments || []);
    } catch (err) {
      console.error('Error fetching student enrollments:', err);
      alert('Failed to load student enrollments');
    }
  };

  const handleEnrollStudent = async (section) => {
    if (!selectedStudent || !section) return;

    try {
      const response = await fetch(`/api/admin/sections/${section.id}/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: selectedStudent.id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to enroll student');
      }

      // Show success notification
      setNotification({
        type: 'success',
        message: `Successfully enrolled ${selectedStudent.first_name} ${selectedStudent.last_name} in ${section.course_code}-${section.section_name}`
      });

      // Refresh the student's enrollments
      await handleViewStudentEnrollments(selectedStudent);

      // Auto-hide notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error enrolling student:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to enroll student'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleDropStudentEnrollment = async (enrollmentId) => {
    // Show confirmation modal instead of confirm()
    setDropConfirmation({ enrollmentId });
  };

  const confirmDropStudent = async () => {
    if (!dropConfirmation) return;

    try {
      const response = await fetch(`/api/admin/students/${selectedStudent.id}/enrollments`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: dropConfirmation.enrollmentId })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to drop student');
      }

      setNotification({
        type: 'success',
        message: `Student dropped successfully`
      });

      await handleViewStudentEnrollments(selectedStudent);
      setDropConfirmation(null);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error dropping student:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to drop student'
      });
      setDropConfirmation(null);
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleAddCourse = async () => {
    try {
      if (!newCourseData.code.trim() || !newCourseData.name.trim()) {
        setNotification({
          type: 'error',
          message: 'Course code and name are required'
        });
        return;
      }

      const response = await fetch('/api/courses', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCourseData.code.trim(),
          name: newCourseData.name.trim(),
          description: newCourseData.description.trim() || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create course');
      }

      const data = await response.json();
      setCourses([...courses, data.course]);
      
      setNotification({
        type: 'success',
        message: `Course "${data.course.name}" created successfully`
      });

      setNewCourseData({ code: '', name: '', description: '' });
      setShowAddCourseModal(false);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding course:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create course'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  const handleAddSection = async () => {
    try {
      if (!newSectionData.course_id || !newSectionData.section_name.trim()) {
        setNotification({
          type: 'error',
          message: 'Course and section name are required'
        });
        return;
      }

      const response = await fetch('/api/sections', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          course_id: newSectionData.course_id,
          section_name: newSectionData.section_name.trim(),
          capacity: newSectionData.capacity || '5',
          schedule: newSectionData.schedule.trim() || null,
          professor_id: newSectionData.professor_id || null
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create section');
      }

      const data = await response.json();
      setSections([...sections, data.section]);
      
      setNotification({
        type: 'success',
        message: `Section "${data.section.section_name}" created successfully`
      });

      setNewSectionData({ course_id: '', section_name: '', capacity: '5', schedule: '', professor_id: '' });
      setShowAddSectionModal(false);

      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding section:', err);
      setNotification({
        type: 'error',
        message: err.message || 'Failed to create section'
      });
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-600">Loading admin dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="faculty" className="space-y-4">
        <TabsList>
          <TabsTrigger value="faculty">Faculty ({faculty.length})</TabsTrigger>
          <TabsTrigger value="students">Students ({students.length})</TabsTrigger>
          <TabsTrigger value="courses">Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="sections">Sections ({sections.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="faculty">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Members</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Username</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Email</th>
                      <th className="text-left p-2">Created At</th>
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {faculty.map((f) => (
                      <tr key={f.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{f.id}</td>
                        <td className="p-2">{f.username}</td>
                        <td className="p-2">{f.first_name} {f.last_name}</td>
                        <td className="p-2">{f.email}</td>
                        <td className="p-2">{new Date(f.created_at).toLocaleDateString()}</td>
                        <td className="p-2">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFaculty(f);
                                setShowAssignModal(true);
                              }}
                            >
                              Assign to Section
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedFaculty(f);
                                setShowRoleModal(true);
                              }}
                            >
                              Change Role
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students">
          {!selectedStudent ? (
            <Card>
              <CardHeader>
                <CardTitle>Students</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">ID</th>
                        <th className="text-left p-2">Username</th>
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Email</th>
                        <th className="text-left p-2">Created At</th>
                        <th className="text-left p-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s) => (
                        <tr key={s.id} className="border-b hover:bg-gray-50">
                          <td className="p-2">{s.id}</td>
                          <td className="p-2">{s.username}</td>
                          <td className="p-2">{s.first_name} {s.last_name}</td>
                          <td className="p-2">{s.email}</td>
                          <td className="p-2">{new Date(s.created_at).toLocaleDateString()}</td>
                          <td className="p-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedStudent(s);
                                handleViewStudentEnrollments(s);
                              }}
                            >
                              Manage
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Student Dashboard: {selectedStudent.first_name} {selectedStudent.last_name}</CardTitle>
                    <p className="text-sm text-gray-600">Username: {selectedStudent.username}</p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedStudent(null);
                      setStudentEnrollments([]);
                      setNotification(null);
                    }}
                  >
                    Back to Students
                  </Button>
                </div>
              </CardHeader>
              {notification && (
                <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
                  <div className={`px-6 py-4 rounded-lg shadow-lg pointer-events-auto max-w-md ${
                    notification.type === 'success' 
                      ? 'bg-green-100 border border-green-400 text-green-800' 
                      : 'bg-red-100 border border-red-400 text-red-800'
                  }`}>
                    {notification.message}
                  </div>
                </div>
              )}
              {dropConfirmation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <Card className="w-96">
                    <CardHeader>
                      <CardTitle>Confirm Drop</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 mb-6">
                        Are you sure you want to drop this student from the course? This action cannot be undone if the course has been graded.
                      </p>
                      <div className="flex gap-3">
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={confirmDropStudent}
                        >
                          Drop
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setDropConfirmation(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-6">
                      {Object.entries(
                        sections.reduce((acc, section) => {
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
                        }, {})
                      ).map(([courseCode, courseData]) => (
                        <div key={courseCode} className="space-y-3">
                          <h3 className="text-lg font-semibold border-b pb-2">
                            {courseCode} - {courseData.course_name}
                          </h3>
                          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {courseData.sections.map((section) => {
                              const isFull = section.enrolled_count >= section.capacity;
                              const isEnrolledInSection = studentEnrollments.some(e => e.section_id === section.id);
                              const enrollmentData = studentEnrollments.find(e => e.section_id === section.id);
                              const isEnrolledInCourse = studentEnrollments.some(e => e.course_id === section.course_id);
                              const canEnroll = !isFull && !isEnrolledInCourse;
                              const graded = enrollmentData && enrollmentData.grade !== null && enrollmentData.grade !== undefined && enrollmentData.grade !== 0;
                              
                              const getGradeColor = (grade) => {
                                if (grade === null || grade === undefined || grade === 0) return 'text-gray-400';
                                const numGrade = parseFloat(grade);
                                if (isNaN(numGrade)) return 'text-gray-400';
                                if (numGrade >= 3.5) return 'text-green-600';
                                if (numGrade >= 2.5) return 'text-blue-600';
                                if (numGrade >= 1.5) return 'text-yellow-600';
                                return 'text-red-600';
                              };

                              return (
                                <Card key={section.id} className={isEnrolledInSection ? 'border-green-500 border-2' : isFull || isEnrolledInCourse ? 'border-red-300 border-2 bg-gray-50' : ''}>
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-base flex justify-between items-center">
                                      <span>{section.course_code}-{section.section_name}</span>
                                      <div className="flex gap-2">
                                        {isEnrolledInSection && (
                                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                            Enrolled
                                          </span>
                                        )}
                                        {graded && (
                                          <span className={`text-xs font-bold px-2 py-1 rounded ${getGradeColor(enrollmentData.grade).replace('text-', 'bg-').replace('-600', '-100')} ${getGradeColor(enrollmentData.grade)}`}>
                                            {parseFloat(enrollmentData.grade).toFixed(1)}
                                          </span>
                                        )}
                                      </div>
                                    </CardTitle>
                                    <CardDescription>{section.professor_name || 'TBA'}</CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-3 text-sm">
                                      <p><strong>Capacity:</strong> {section.enrolled_count}/{section.capacity}</p>
                                      <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                          className={`h-2 rounded-full ${isEnrolledInSection ? 'bg-green-500' : isFull || isEnrolledInCourse ? 'bg-red-500' : 'bg-blue-600'}`}
                                          style={{ width: `${(section.enrolled_count / section.capacity) * 100}%` }}
                                        />
                                      </div>
                                      <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => {
                                          if (isEnrolledInSection) {
                                            handleDropStudentEnrollment(enrollmentData.id);
                                          } else {
                                            handleEnrollStudent(section);
                                          }
                                        }}
                                        disabled={!canEnroll && !isEnrolledInSection || (isEnrolledInSection && graded)}
                                        variant={isEnrolledInSection ? 'destructive' : 'default'}
                                      >
                                        {isFull ? 'Section Full' : isEnrolledInSection && graded ? 'Course Completed' : isEnrolledInSection ? 'Drop Course' : isEnrolledInCourse ? 'Already Enrolled in Course' : 'Enroll'}
                                      </Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Courses</CardTitle>
              <Button onClick={() => setShowAddCourseModal(true)} className="bg-blue-600 hover:bg-blue-700">
                Add Course
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">ID</th>
                      <th className="text-left p-2">Code</th>
                      <th className="text-left p-2">Name</th>
                      <th className="text-left p-2">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {courses.map((c) => (
                      <tr key={c.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{c.id}</td>
                        <td className="p-2 font-medium">{c.code}</td>
                        <td className="p-2">{c.name}</td>
                        <td className="p-2 text-sm text-gray-600">{c.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sections">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Sections</CardTitle>
              <Button onClick={() => setShowAddSectionModal(true)} className="bg-blue-600 hover:bg-blue-700">
                Add Section
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Course ID</th>
                      <th className="text-left p-2">Course Code</th>
                      <th className="text-left p-2">Section</th>
                      <th className="text-left p-2">Professor Name</th>
                      <th className="text-left p-2">Capacity</th>
                      <th className="text-left p-2">Enrolled</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sections.map((s) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">{s.course_id}</td>
                        <td className="p-2 font-medium">{s.course_code}</td>
                        <td className="p-2">{s.section_name}</td>
                        <td className="p-2">{s.professor_name}</td>
                        <td className="p-2">{s.capacity}</td>
                        <td className="p-2">{s.enrolled_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Change Role Modal */}
      {showRoleModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Change Role for {selectedFaculty.first_name} {selectedFaculty.last_name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">Current role: <strong>{selectedFaculty.role}</strong></p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleChangeRole(selectedFaculty.id, 'admin')}
                    className="flex-1"
                  >
                    Make Admin
                  </Button>
                  <Button
                    onClick={() => handleChangeRole(selectedFaculty.id, 'faculty')}
                    variant="outline"
                    className="flex-1"
                  >
                    Keep Faculty
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    setShowRoleModal(false);
                    setSelectedFaculty(null);
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign to Section Modal */}
      {showAssignModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-[600px] max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Assign {selectedFaculty.first_name} {selectedFaculty.last_name} to Section</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="max-h-96 overflow-y-auto border rounded">
                  <table className="w-full">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr className="border-b">
                        <th className="text-left p-2">Course</th>
                        <th className="text-left p-2">Section</th>
                        <th className="text-left p-2">Current Professor</th>
                        <th className="text-left p-2">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sections.map((s) => {
                        const isAssignedToFaculty = s.professor_id === selectedFaculty.id;
                        return (
                          <tr key={s.id} className="border-b hover:bg-gray-50">
                            <td className="p-2">{s.course_code}</td>
                            <td className="p-2">{s.section_name}</td>
                            <td className="p-2 text-sm">{s.professor_name || 'Unassigned'}</td>
                            <td className="p-2">
                              <Button
                                size="sm"
                                onClick={() => setSelectedSection(s)}
                                variant={selectedSection?.id === s.id ? "default" : "outline"}
                                disabled={isAssignedToFaculty && selectedSection?.id !== s.id}
                              >
                                {isAssignedToFaculty && selectedSection?.id !== s.id ? "Assigned" : selectedSection?.id === s.id ? "Selected" : "Select"}
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleAssignToSection}
                    disabled={!selectedSection}
                    className="flex-1"
                  >
                    Assign to Selected Section
                  </Button>
                  <Button
                    onClick={() => {
                      setShowAssignModal(false);
                      setSelectedFaculty(null);
                      setSelectedSection(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Course</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input
                  type="text"
                  placeholder="e.g., CS101"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCourseData.code}
                  onChange={(e) => setNewCourseData({ ...newCourseData, code: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                <input
                  type="text"
                  placeholder="e.g., Introduction to Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newCourseData.name}
                  onChange={(e) => setNewCourseData({ ...newCourseData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                <textarea
                  placeholder="Enter course description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows="3"
                  value={newCourseData.description}
                  onChange={(e) => setNewCourseData({ ...newCourseData, description: e.target.value })}
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddCourse}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Course
                </Button>
                <Button
                  onClick={() => {
                    setShowAddCourseModal(false);
                    setNewCourseData({ code: '', name: '', description: '' });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {showAddSectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSectionData.course_id}
                  onChange={(e) => setNewSectionData({ ...newSectionData, course_id: e.target.value })}
                >
                  <option value="">Select a course</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Section Name</label>
                <input
                  type="text"
                  placeholder="e.g., A, B, C"
                  maxLength="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                  value={newSectionData.section_name}
                  onChange={(e) => setNewSectionData({ ...newSectionData, section_name: e.target.value.toUpperCase() })}
                />
                <p className="text-xs text-gray-500 mt-1">Must be a single letter (A-Z)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                <input
                  type="number"
                  min="1"
                  placeholder="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSectionData.capacity}
                  onChange={(e) => setNewSectionData({ ...newSectionData, capacity: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., MWF 10:00-11:00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSectionData.schedule}
                  onChange={(e) => setNewSectionData({ ...newSectionData, schedule: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Professor (Optional)</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newSectionData.professor_id}
                  onChange={(e) => setNewSectionData({ ...newSectionData, professor_id: e.target.value })}
                >
                  <option value="">No professor assigned</option>
                  {faculty.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.first_name} {f.last_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleAddSection}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  Add Section
                </Button>
                <Button
                  onClick={() => {
                    setShowAddSectionModal(false);
                    setNewSectionData({ course_id: '', section_name: '', capacity: '5', schedule: '', professor_id: '' });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}

