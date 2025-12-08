'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GradesView from '@/views/components/GradesView';
import { useSession } from '@/context/SessionProvider';

export default function GradesPageClient({ initialEnrollments }) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [isDropping, setIsDropping] = useState(false);
  const router = useRouter();

  const { drop } = useSession();

  const handleDrop = async (enrollmentId) => {
    if (!confirm('Are you sure you want to drop this course?')) {
      return;
    }

    setIsDropping(true);

    try {
      // Use SessionProvider's drop which delegates to EnrollmentService
      const result = await drop(enrollmentId);

      if (result.success) {
        // Remove the dropped enrollment from local state
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));

        // Keep page data consistent (server-side fetched page) — refresh to revalidate
        router.refresh();
      } else {
        alert(result.error || 'Failed to drop course');
      }
    } catch (error) {
      console.error('Drop course error:', error);
      alert('An error occurred while dropping the course');
    } finally {
      setIsDropping(false);
    }
  };

  return (
    <GradesView 
      enrollments={enrollments} 
      onDrop={isDropping ? null : handleDrop}
    />
  );
}
