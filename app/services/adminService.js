const AdminService = {
  async fetchAdminData() {
    try {
      const [facultyRes, studentsRes, coursesRes, sectionsRes] = await Promise.all([
        fetch('/api/admin/faculty', { credentials: 'include' }),
        fetch('/api/admin/students', { credentials: 'include' }),
        fetch('/api/admin/courses', { credentials: 'include' }),
        fetch('/api/admin/sections', { credentials: 'include' })
      ]);

      if (!facultyRes.ok || !studentsRes.ok || !coursesRes.ok || !sectionsRes.ok) {
        const errs = await Promise.all([facultyRes, studentsRes, coursesRes, sectionsRes].map(r => r.json().catch(() => ({}))));
        throw new Error(errs.find(e => e.error)?.error || 'Failed to fetch admin data');
      }

      const [facultyData, studentsData, coursesData, sectionsData] = await Promise.all([
        facultyRes.json(), studentsRes.json(), coursesRes.json(), sectionsRes.json()
      ]);

      return {
        success: true,
        faculty: facultyData.faculty || [],
        students: studentsData.students || [],
        courses: coursesData.courses || [],
        sections: sectionsData.sections || []
      };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to fetch admin data' };
    }
  },

  async changeRole(userId, newRole) {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to update role');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to update role' };
    }
  },

  async assignProfessorToSection(sectionId, professorId) {
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}/assign`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ professor_id: professorId })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to assign professor');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to assign professor' };
    }
  },

  async getStudentEnrollments(studentId) {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/enrollments`, {
        credentials: 'include'
      });

      if (!res.ok) {
        throw new Error('Failed to fetch enrollments');
      }

      const data = await res.json();
      return { success: true, enrollments: data.enrollments || [] };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to fetch enrollments' };
    }
  },

  async enrollStudentInSection(sectionId, studentId) {
    try {
      const res = await fetch(`/api/admin/sections/${sectionId}/enroll`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to enroll student');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to enroll student' };
    }
  },

  async dropStudentEnrollment(studentId, enrollmentId) {
    try {
      const res = await fetch(`/api/admin/students/${studentId}/enrollments`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enrollment_id: enrollmentId })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to drop student');
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message || 'Failed to drop student' };
    }
  }
};

export default AdminService;
