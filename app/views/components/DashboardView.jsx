'use client';
import React, { useEffect, useState } from 'react';
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

  const { logout, enrollments, sections, drop, loadSectionsAndEnrollments, lastLoginInfo, clearLastLoginInfo } = useSession();
  const [showLoginNotification, setShowLoginNotification] = useState(true);

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

  // Handle dismissing the last login notification
  const dismissLoginNotification = () => {
    setShowLoginNotification(false);
    clearLastLoginInfo();
  };

  // Format the last login notification message
  const formatLastLoginMessage = () => {
    if (!lastLoginInfo) return null;

    const formatDate = (dateStr) => {
      if (!dateStr) return 'Unknown';
      const date = new Date(dateStr);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    };

    if (lastLoginInfo.was_successful) {
      return {
        type: 'success',
        title: '✅ Last Successful Login',
        message: `Your last successful login was on ${formatDate(lastLoginInfo.timestamp)}.`
      };
    } else {
      return {
        type: 'warning',
        title: '⚠️ Security Notice',
        message: `There was a failed login attempt on your account on ${formatDate(lastLoginInfo.timestamp)}. If this wasn't you, please change your password immediately.`
      };
    }
  };

  const loginNotification = formatLastLoginMessage();

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

        {/* Last Login Security Notification */}
        {showLoginNotification && loginNotification && (
          <Alert 
            className={`mb-4 ${loginNotification.type === 'warning' ? 'border-yellow-500 bg-yellow-50' : 'border-green-500 bg-green-50'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-semibold ${loginNotification.type === 'warning' ? 'text-yellow-800' : 'text-green-800'}`}>
                  {loginNotification.title}
                </p>
                <AlertDescription className={loginNotification.type === 'warning' ? 'text-yellow-700' : 'text-green-700'}>
                  {loginNotification.message}
                </AlertDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={dismissLoginNotification}
                className="text-gray-500 hover:text-gray-700 -mt-1 -mr-2"
              >
                ✕
              </Button>
            </div>
          </Alert>
        )}

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
            session={session}
            onUploadGrade={onUploadGrade}
            onToggleEnrollment={onToggleEnrollment}
          />
        )}
      </div>
    </div>
  );
}