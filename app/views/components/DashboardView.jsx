'use client';
import React, { useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import CoursesView from './CoursesView';
import GradesView from './GradesView';
import FacultyView from './FacultyView';
import AdminView from './AdminView';
import { useSession  } from "@/context/SessionProvider";


export default function DashboardView({
  session, // decoded session object
  onUploadGrade,
  onToggleEnrollment,
  message
}) {

  const { logout, enrollments, sections, drop, loadSectionsAndEnrollments } = useSession();

  // Ensure sections/enrollments are loaded after client-side login/navigation
  useEffect(() => {
    if (!session) return;

    // If there is no data yet, request it from the provider
    if ((!sections || sections.length === 0) || (!enrollments || enrollments.length === 0)) {
      loadSectionsAndEnrollments(session.role);
    }
  }, [session?.id]);

  const enrolledSectionIds = enrollments.map(e => e.section_id);

  const handleDrop = async (enrollmentId) => {
    if (!confirm('Are you sure you want to drop this course?')) {
      return;
    }

    const result = await drop(enrollmentId);

    if (!result.success) {
      alert(result.error || 'Failed to drop course');
    }
  };

  const handleSettings = () => {
    window.location.href = '/settings';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">    
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Enrollment System</h1>
            <p className="text-sm text-gray-600">
              Welcome, {session.first_name && session.last_name 
                ? `${session.first_name} ${session.last_name}` 
                : session.username || session.id} ({session.role})
            </p>          
            </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleSettings} 
              variant="outline"
              className="bg-white shadow-md">
              Settings
            </Button>
            <Button 
              onClick={logout} 
              variant="outline"
              className="bg-white shadow-md">
              Logout
            </Button>
          </div>
        </div>

        {message && (
          <Alert className="mb-4" variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        {session.role === 'student' ? (
          <Tabs defaultValue="courses" className="space-y-4">
            <TabsList>
              <TabsTrigger value="courses">Available Sections</TabsTrigger>
              <TabsTrigger value="grades">My Grades</TabsTrigger>
            </TabsList>

            <TabsContent value="courses">
              <CoursesView
                userRole={session.role}
                //enroll={enroll}
              />
            </TabsContent>

            <TabsContent value="grades">
              <GradesView
                enrollments={enrollments}
                onDrop={handleDrop}
              />
            </TabsContent>
          </Tabs>
        ) : session.role === 'admin' ? (
          <AdminView session={session} />
        ) : (
          <FacultyView
            enrollments={enrollments}
            sections={sections}
            onUploadGrade={onUploadGrade}
            onToggleEnrollment={onToggleEnrollment}
          />
        )}
      </div>
    </div>
  );
}