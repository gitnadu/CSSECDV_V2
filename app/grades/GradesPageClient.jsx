'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import GradesView from '@/views/components/GradesView';

export default function GradesPageClient({ initialEnrollments }) {
  const [enrollments, setEnrollments] = useState(initialEnrollments);
  const [isDropping, setIsDropping] = useState(false);
  const router = useRouter();

  const handleDrop = async (enrollmentId) => {
    if (!confirm('Are you sure you want to drop this course?')) {
      return;
    }

    setIsDropping(true);

    try {
      const response = await fetch(`/api/enrollment/${enrollmentId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        // Remove the dropped enrollment from state
        setEnrollments(prev => prev.filter(e => e.id !== enrollmentId));
        
        // Optionally refresh the page to sync with server
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
