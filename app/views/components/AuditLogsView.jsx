'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { useSession } from '@/context/SessionProvider';

/**
 * AuditLogsView - Admin-only component for viewing and analyzing audit logs
 * Shows validation failures, auth attempts, and access control failures
 */
export default function AuditLogsView({ session }) {
  const { getAuditLogs } = useSession();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [pagination, setPagination] = useState({ limit: 50, offset: 0 });

  // Check admin role
  if (session?.role !== 'admin') {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-700">Access Denied</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Only administrators can view audit logs.</p>
        </CardContent>
      </Card>
    );
  }

  // Fetch audit logs using SessionProvider
  const fetchLogs = async (filterType = 'all', limit = 50, offset = 0) => {
    setLoading(true);
    try {
      const eventType = filterType !== 'all' ? filterType : null;
      const result = await getAuditLogs(limit, offset, eventType);

      console.log('Audit logs fetched:', result.logs);

      if (result.success) {
        setLogs(result.logs);
        setPagination({ limit, offset });

      } else {
        console.error('Failed to fetch audit logs:', result.error);
        alert('Failed to load audit logs');
        setLogs([]);
      }
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      alert('Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(filter, pagination.limit, pagination.offset);
  }, []);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    fetchLogs(newFilter, 50, 0);
  };

  const handleNextPage = () => {
    const newOffset = pagination.offset + pagination.limit;
    fetchLogs(filter, pagination.limit, newOffset);
  };

  const handlePreviousPage = () => {
    if (pagination.offset >= pagination.limit) {
      const newOffset = pagination.offset - pagination.limit;
      fetchLogs(filter, pagination.limit, newOffset);
    }
  };

  // Format event type for display
  const formatEventType = (type) => {
    return type.split('_').map(word => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  // Get badge color based on event type
  const getEventColor = (type) => {
    switch (type) {
      case 'AUTH_SUCCESS':
        return 'bg-green-100 text-green-800';
      case 'AUTH_FAILURE':
      case 'AUTH_LOCKOUT':
        return 'bg-red-100 text-red-800';
      case 'ACCESS_DENIED':
        return 'bg-orange-100 text-orange-800';
      case 'VALIDATION_FAILURE':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Monitor validation failures, authentication attempts, and access control violations
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {loading ? (
              <p className="text-center text-gray-600 py-8">Loading audit logs...</p>
            ) : logs.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No logs found</p>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="border-b-2">
                      <tr className="text-left">
                        <th className="pb-3 px-4 font-semibold">Timestamp</th>
                        <th className="pb-3 px-4 font-semibold">Event Type</th>
                        <th className="pb-3 px-4 font-semibold">Username</th>
                        <th className="pb-3 px-4 font-semibold">IP Address</th>
                        <th className="pb-3 px-4 font-semibold">Resource</th>
                        <th className="pb-3 px-4 font-semibold">Status</th>
                        <th className="pb-3 px-4 font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-gray-700">
                            {formatTime(log.created_at)}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${getEventColor(log.event_type)}`}>
                              {formatEventType(log.event_type)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-700">
                            {log.username || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-700 font-mono text-xs">
                            {log.ip_address || 'N/A'}
                          </td>
                          <td className="py-3 px-4 text-gray-700 truncate max-w-xs">
                            {log.resource || 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              log.status === 'SUCCESS'
                                ? 'bg-green-100 text-green-800'
                                : log.status === 'FAILURE'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-600 text-xs max-w-xs">
                            {log.details ? (
                              <details className="cursor-pointer">
                                <summary className="underline">Show</summary>
                                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
                                  {typeof log.details === 'string' ? JSON.stringify(JSON.parse(log.details), null, 2) : JSON.stringify(log.details, null, 2)}
                                </pre>
                              </details>
                            ) : (
                              'N/A'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="flex justify-between items-center mt-6">
                  <Button
                    onClick={handlePreviousPage}
                    disabled={pagination.offset === 0}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <p className="text-sm text-gray-600">
                    Showing {pagination.offset + 1} - {pagination.offset + logs.length} (limit: {pagination.limit})
                  </p>
                  <Button
                    onClick={handleNextPage}
                    disabled={logs.length < pagination.limit}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
