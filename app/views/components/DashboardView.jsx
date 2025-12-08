'use client';
import React from 'react';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import CoursesView from './CoursesView';
import GradesView from './GradesView';
import FacultyView from './FacultyView';
import { useSession  } from "@/context/SessionProvider";


export default function DashboardView({
  session,
  sections,
  enrollments,
  onEnroll,
  onDrop,
  onUploadGrade,
  onToggleEnrollment,
  message
}) {
  // Get section IDs that the student is already enrolled in
  const enrolledSectionIds = enrollments.map(e => e.section_id);
  const { logout } = useSession();
  
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
          <Button 
            onClick={logout} 
            variant="outline"
            className="bg-white shadow-md">
            Logout
          </Button>
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
                sections={sections}
                userRole={session.role}
                onEnroll={onEnroll}
                enrolledSectionIds={enrolledSectionIds}
              />
            </TabsContent>

            <TabsContent value="grades">
              <GradesView
                enrollments={enrollments}
                onDrop={onDrop}
              />
            </TabsContent>
          </Tabs>
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