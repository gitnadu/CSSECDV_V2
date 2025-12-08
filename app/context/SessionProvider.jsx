  
'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import AuthService from "@/services/authService";
import CourseService from "@/services/courseService";
import EnrollmentService from "@/services/enrollmentService";
import GradeService from "@/services/gradeService";
import AdminService from '@/services/adminService';
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
  // admin lists (used by admin view)
  const [faculty, setFaculty] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);

  const loadSectionsAndEnrollments = async (role) => {
  try {
    // fetch sections
    const sectionsRes = await CourseService.getAllSections();

    if (sectionsRes.success) {
      setSections(sectionsRes.sections || []);
    }
    console.log("Sections loaded:", sectionsRes.sections);

    // fetch my enrollments

    let enrollmentsRes;

    if (role == 'student') {
      enrollmentsRes = await EnrollmentService.getMyEnrollments(); // this gets the enrollment for the logged STUDENT
    }else{
      enrollmentsRes = await EnrollmentService.getMyEnrollmentsFaculty();
      console.log("Faculty enrollments loaded");
    }

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
        console.log(result.user.role)

        if (result.success) { // only run the following if the session is valid
          setSession(result.user);
          
          await loadSectionsAndEnrollments(result.user.role); // load sections and enrollments after setting session

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

  // ----- UPDATE PROFILE -----
  const updateProfile = async (profileData) => {
    const result = await AuthService.updateProfile(profileData);

    if (result.success) {
      // Update session with new profile data
      setSession((prev) => ({
        ...prev,
        first_name: profileData.first_name,
        last_name: profileData.last_name,
        email: profileData.email,
      }));
    }

    return result;
  };

  // ----- CHANGE PASSWORD -----
  const changePassword = async (currentPassword, newPassword) => {
    const result = await AuthService.changePassword(currentPassword, newPassword);
    // Password change doesn't update session state, just return result
    return result;
  };

  // ----- TOGGLE ENROLLMENT (faculty) -----
  const toggleEnrollment = async (sectionId, isOpen) => {
    const result = await CourseService.toggleSectionEnrollment(sectionId, isOpen);

    console.log("Toggle enrollment result:", result.success);

    if (result.success) {
      // Update local sections state with the returned section
      const updatedSection = result.section;
      setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)));
    }

    return result;
  };

  // ----- ADMIN: FETCH DATA -----
  const fetchAdminData = async () => {
    const result = await AdminService.fetchAdminData();
    if (result.success) {
      setFaculty(result.faculty || []);
      setStudents(result.students || []);
      setCourses(result.courses || []);
      setSections(result.sections || []); // update shared sections
    }
    return result;
  };

  // ----- ADMIN: CHANGE ROLE -----
  const changeUserRole = async (userId, newRole) => {
    const result = await AdminService.changeRole(userId, newRole);
    if (result.success) {
      // refresh admin lists
      await fetchAdminData();
    }
    return result;
  };

  // ----- ADMIN: ASSIGN PROFESSOR -----
  const assignProfessor = async (sectionId, professorId) => {
    const result = await AdminService.assignProfessorToSection(sectionId, professorId);
    if (result.success) {
      await fetchAdminData();
    }
    return result;
  };

  // ----- ADMIN: STUDENT ENROLLMENTS -----
  const getStudentEnrollments = async (studentId) => {
    return await AdminService.getStudentEnrollments(studentId);
  };

  const enrollStudent = async (sectionId, studentId) => {
    const result = await AdminService.enrollStudentInSection(sectionId, studentId);
    if (result.success) {
      // refresh student enrollments and admin lists handled by caller if needed
      await fetchAdminData();
    }
    return result;
  };

  const dropStudentEnrollment = async (studentId, enrollmentId) => {
    const result = await AdminService.dropStudentEnrollment(studentId, enrollmentId);
    if (result.success) {
      await fetchAdminData();
    }
    return result;
  };

  // ----- DROP -----
  const drop = async (enrollmentId) => {
    const result = await EnrollmentService.dropEnrollment(enrollmentId);

    if (result.success) {
      // Refresh enrollments and sections to sync counts
      await loadSectionsAndEnrollments(session?.role);
    }

    return result;
  };

  // ----- UPLOAD GRADE (faculty) -----
  const uploadGrade = async (enrollmentId, grade) => {
    const result = await GradeService.uploadGrade(enrollmentId, grade);

    if (result.success) {
      // Update local enrollments list with the returned enrollment
      const updatedEnrollment = result.enrollment;
      setEnrollments((prev) =>
        prev.map((e) => {
          // Support both id and enrollment_id naming
          if ((e.enrollment_id || e.id) === (updatedEnrollment.enrollment_id || updatedEnrollment.id)) {
            return { ...e, ...updatedEnrollment };
          }
          return e;
        })
      );
    }

    return result;
  };

  // ----- LOGIN -----
  const login = async (username, password) => {
    const result = await AuthService.login(username, password);

    if (result.success) {
      // Backend sets HttpOnly cookie; just store user object
      setSession(result.user);
      // Load sections and enrollments after login
      await loadSectionsAndEnrollments(result.user.role);
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
      setSections(null);
      setEnrollments(null);
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
    uploadGrade,
    toggleEnrollment,
    isAuthenticated: !!session,
    updateProfile,
    changePassword,
    // admin helpers
    faculty,
    students,
    courses,
    fetchAdminData,
    changeUserRole,
    assignProfessor,
    getStudentEnrollments,
    enrollStudent,
    dropStudentEnrollment,
  };

  return (
    <SessionContext.Provider value={value}>
      {children}
    </SessionContext.Provider>
  );
}
