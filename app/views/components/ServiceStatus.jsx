'use client';
import React from 'react';

const StatusDot = ({ status }) => {
  const color = status === 'up' ? 'bg-green-500' : 'bg-red-500';
  const pulse = status === 'up' ? '' : 'animate-pulse';

  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} ${pulse}`} />
  );
};

export default function ServiceStatus({ services, onRefresh }) {
  if (!services) return null;

  const serviceList = [
    { key: 'gateway', label: 'Gateway', data: services.gateway },
    { key: 'auth', label: 'Auth', data: services.auth },
    { key: 'course', label: 'Course', data: services.course },
    { key: 'grade', label: 'Grade', data: services.grade },
  ];

  const allUp = serviceList.every(s => s.data?.status === 'up');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`bg-white rounded-lg shadow-lg border p-3 ${!allUp ? 'border-red-300' : 'border-gray-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          <StatusDot status={allUp ? 'up' : 'down'} />
          <span className="text-xs font-semibold text-gray-700">
            {allUp ? 'All Services Online' : 'Service Disruption'}
          </span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="ml-2 text-xs text-blue-500 hover:text-blue-700"
              title="Refresh status"
            >
              ↻
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          {serviceList.map(({ key, label, data }) => (
            <div key={key} className="flex items-center gap-1.5">
              <StatusDot status={data?.status || 'down'} />
              <span className={`text-xs ${data?.status === 'up' ? 'text-gray-600' : 'text-red-600 font-medium'}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {!allUp && (
          <div className="mt-2 pt-2 border-t border-gray-100">
            <p className="text-xs text-red-600">
              Some features may be unavailable
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
