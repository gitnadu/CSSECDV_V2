'use client';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import LoginView from '../views/components/LoginView';
import DashboardView from '../views/components/DashboardView';
import authService from '../services/authService';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import gradeService from '../services/gradeService';
import statusService from '../services/statusService';
import TokenManager from '../lib/TokenManager';

// Status polling interval (5 seconds)
const STATUS_POLL_INTERVAL = 5000;

// User-friendly error messages for each service
const SERVICE_ERROR_MESSAGES = {
  gateway: 'Unable to connect to the server. Please check your internet connection.',
  auth: 'Authentication service is temporarily unavailable. You may have trouble logging in.',
  course: 'Course information is temporarily unavailable. Some features may not work.',
  grade: 'Grade and enrollment service is temporarily unavailable.',
};

export default function Home() {
  const [session, setSession] = useState(null);
  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [serviceToast, setServiceToast] = useState(null);

  // Track previous service status to detect changes
  const prevStatusRef = useRef({});

  // Background service status polling with toast notifications
  const checkServiceStatus = useCallback(async () => {
    const result = await statusService.getStatus();
    const services = result.services;

    if (services) {
      const prevStatus = prevStatusRef.current;

      // Check each service for status changes (only notify on transitions to 'down')
      for (const [key, data] of Object.entries(services)) {
        const wasUp = prevStatus[key]?.status === 'up';
        const isDown = data?.status === 'down';

        // Only show toast if service just went down (was up before, now down)
        if (wasUp && isDown && SERVICE_ERROR_MESSAGES[key]) {
          setServiceToast({
            message: SERVICE_ERROR_MESSAGES[key],
            type: 'warning',
          });
          // Auto-dismiss after 5 seconds
          setTimeout(() => setServiceToast(null), 5000);
          break; // Show one toast at a time
        }
      }

      // Update previous status reference
      prevStatusRef.current = { ...services };
    }
  }, []);

  useEffect(() => {
    // Check for existing session with JWT token
    const checkSession = async () => {
      const user = TokenManager.getUser();
      if (user) {
        // Verify session is still valid across nodes
        const validation = await authService.verifySession();
        if (validation.valid) {
          setSession(user);
        } else {
          // Token invalid, clear and show login
          TokenManager.clearTokens();
        }
      }
      setLoading(false);
    };

    checkSession();
    checkServiceStatus();
  }, [checkServiceStatus]);

  // Poll service status every 5 seconds
  useEffect(() => {
    const interval = setInterval(checkServiceStatus, STATUS_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkServiceStatus]);

  useEffect(() => {
    if (session) {
      loadData();
    }
  }, [session]);

  const loadData = async () => {
    // Load enrollments based on role
    if (session) {
      if (session.role === 'student') {
        // Students see all sections for enrollment
        const sectionsResult = await courseService.getAllSections();
        if (sectionsResult.success) {
          setSections(sectionsResult.sections);
        }

        const enrollmentsResult = await enrollmentService.getStudentEnrollments(session.id);
        if (enrollmentsResult.success) {
          setEnrollments(enrollmentsResult.enrollments);
        }
      } else if (session.role === 'faculty') {
        // Faculty see only their assigned sections
        const facultySectionsResult = await courseService.getSectionsByProfessor(session.id);
        if (facultySectionsResult.success) {
          setSections(facultySectionsResult.sections);

          // Get enrollments for each section the faculty teaches
          const allEnrollments = [];
          for (const section of facultySectionsResult.sections) {
            const gradesResult = await gradeService.getSectionGrades(section.id);
            if (gradesResult.success) {
              allEnrollments.push(...gradesResult.grades);
            }
          }
          setEnrollments(allEnrollments);
        }
      }
    }
  };

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleLogin = async (username, password) => {
    const result = await authService.login(username, password);

    if (result.success) {
      setSession(result.user);
    }

    return result;
  };

  const handleLogout = async () => {
    await authService.logout();
    setSession(null);
    setSections([]);
    setEnrollments([]);
  };

  const handleEnroll = async (sectionId) => {
    const result = await enrollmentService.enrollInSection(sectionId);

    if (result.success) {
      showMessage('Successfully enrolled in section!', 'success');
      await loadData();
    } else {
      showMessage(result.error, 'error');
    }
  };

  const handleDrop = async (enrollmentId) => {
    const result = await enrollmentService.unenrollStudent(enrollmentId);

    if (result.success) {
      showMessage('Successfully dropped course!', 'success');
      await loadData();
    } else {
      showMessage(result.error, 'error');
    }
  };

  const handleUploadGrade = async (enrollmentId, grade) => {
    const result = await gradeService.uploadGrade(enrollmentId, grade);

    if (result.success) {
      showMessage('Grade updated successfully!', 'success');
      await loadData();
    } else {
      showMessage(result.error, 'error');
    }
  };

  const handleToggleEnrollment = async (sectionId, isOpen) => {
    const result = await courseService.toggleSectionEnrollment(sectionId, isOpen);

    if (result.success) {
      showMessage(result.message || `Enrollment ${isOpen ? 'opened' : 'closed'} successfully!`, 'success');
      await loadData();
    } else {
      showMessage(result.error, 'error');
    }
  };

  // Toast notification component
  const ServiceToast = () => {
    if (!serviceToast) return null;

    return (
      <div className="fixed top-4 right-4 z-50 animate-fade-in">
        <div className="bg-amber-50 border border-amber-200 rounded-lg shadow-lg p-4 max-w-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 text-amber-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-sm text-amber-800">{serviceToast.message}</p>
            </div>
            <button
              onClick={() => setServiceToast(null)}
              className="flex-shrink-0 text-amber-400 hover:text-amber-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
        <ServiceToast />
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LoginView onLogin={handleLogin} />
        <ServiceToast />
      </>
    );
  }

  return (
    <>
      <DashboardView
        session={session}
        onLogout={handleLogout}
        sections={sections}
        enrollments={enrollments}
        onEnroll={handleEnroll}
        onDrop={handleDrop}
        onUploadGrade={handleUploadGrade}
        onToggleEnrollment={handleToggleEnrollment}
        message={message}
      />
      <ServiceToast />
    </>
  );
}