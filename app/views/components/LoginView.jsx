'use client';
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useSession  } from "@/context/SessionProvider";

export default function LoginView() {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //console.log("Submitting login with:", formData);
  const { login } = useSession();
  
  const handleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      
      const result = await login(formData.username, formData.password);

      if (!result.success) {
        setError(result.error);
      }

    } catch (err) {
      console.log("the error inside handleSubmit:", err.message);
      setError('An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-xxl max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Enrollment System Login</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                disabled={loading}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSubmit()}
                disabled={loading}
              />
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button 
              onClick={handleSubmit} 
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login'}
            </Button>
            <div className="text-center">
              <a 
                href="/forgot-password" 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Forgot Password?
              </a>
            </div>
            {/* <div className="text-sm text-gray-600 mt-4 bg-gray-50 rounded p-3">
              <p className="font-semibold mb-2">Test Accounts:</p>
              <p>👤 Student: <code className="bg-white px-1">student1</code> / <code className="bg-white px-1">pass123</code></p>
              <p>👨‍🏫 Faculty: <code className="bg-white px-1">faculty1</code> / <code className="bg-white px-1">pass123</code></p>
            </div> */}
            {/* <div className="text-xs text-gray-500 mt-4 bg-blue-50 rounded p-2 border border-blue-200">
              <p className="font-semibold mb-1">🔐 Security Features:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>JWT token-based authentication</li>
                <li>Distributed session tracking</li>
                <li>Automatic token refresh</li>
                <li>Cross-node session validation</li>
              </ul>
            </div> */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}