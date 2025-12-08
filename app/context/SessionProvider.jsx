'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "@/services/authService";
import CourseService from "@/services/courseService";
import EnrollmentService from "@/services/enrollmentService";
import { useRouter } from "next/navigation";

const SessionContext = createContext();

export function useSession() {

  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}

export function SessionProvider({ children }) {

  const router = useRouter();

  const [session, setSession] = useState(null);       // user object
  const [loading, setLoading] = useState(true);       // initial load
  const [checking, setChecking] = useState(false);    // session refresh flag

  const [sections, setSections] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const loadSectionsAndEnrollments = async () => {
  try {
    // fetch sections
    const sectionsRes = await CourseService.getAllSections();

    if (sectionsRes.success) {
      setSections(sectionsRes.sections || []);
    }
    console.log("Sections loaded:", sectionsRes.sections);

    // fetch my enrollments

    const enrollmentsRes = await EnrollmentService.getMyEnrollments();
    if (enrollmentsRes.success) {
      setEnrollments(enrollmentsRes.enrollments || []);
    }

    console.log("Enrollments loaded:", enrollmentsRes.enrollments);

  } catch (err) {
    console.error("Error loading sections/enrollments:", err);
  }
};

  // Load session on first mount
  useEffect(() => {
    const loadSession = async () => {
      try {
        const result = await AuthService.getCurrentUser();

        console.log("this is the result.user from auth")
        console.log(result)
        if (result.success) { // only run the following if the session is valid
          setSession(result.user);
          
          await loadSectionsAndEnrollments(result.user);



        } else {
          setSession(null);
        }
      } catch {
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, []);

  // ----- ENROLL -----
  const enroll = async (sectionId) => {
    const result = await EnrollmentService.enrollInSection(sectionId);

    console.log("Enrollment result:", result.success);

    if (result.success) {
      // Refresh enrollments to get full details
      await loadSectionsAndEnrollments();
    }

    return result;
  };

  // ----- DROP -----
  const drop = async (enrollmentId) => {
    try {
      const response = await fetch(`/api/enrollment/${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // Refresh enrollments and sections to sync counts
        await loadSectionsAndEnrollments();
      }

      return result;
    } catch (error) {
      console.error('Drop course error:', error);
      return {
        success: false,
        error: 'An error occurred while dropping the course'
      };
    }
  };

  // ----- LOGIN -----
  const login = async (username, password) => {
    const result = await AuthService.login(username, password);

    if (result.success) {
      // Backend sets HttpOnly cookie; just store user object
      setSession(result.user);
    }
    return result;
  };

  // ----- LOGOUT -----
  const logout = async () => {
    try {
      await AuthService.logout();  // backend clears cookies
    } finally {
      setSession(null);
      router.push("/login");
    }
  };

  // ----- REFRESH SESSION (manual validate) -----
  const refreshSession = async () => {
    setChecking(true);
    try {
      const result = await AuthService.getCurrentUser();
      if (result.success) {
        setSession(result.user);
        return { success: true };
      } else {
        setSession(null);
        return { success: false };
      }
    } catch (err) {
      setSession(null);
      return { success: false, error: err?.message };
    } finally {
      setChecking(false);
    }
  };


  const value = {
    session,
    loading,
    checking,
    login,
    logout,
    refreshSession,
    enroll,
    drop,
    sections,
    setSections,
    enrollments,
    setEnrollments,
    isAuthenticated: !!session,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
