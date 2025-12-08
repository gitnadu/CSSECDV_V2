'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';

export default function ForgotPasswordView() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: username, 2: questions, 3: new password
  const [username, setUsername] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);

  const validatePassword = (password) => {
    const errors = [];
    
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    if (/(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password)) {
      errors.push('Password should not contain sequential characters');
    }
    
    return errors;
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
        credentials: 'include'
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to retrieve security questions');
        } else {
          throw new Error('Failed to retrieve security questions');
        }
      }

      const data = await response.json();
      setQuestions(data.questions);
      setStep(2);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAnswersSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate all questions are answered
    const unanswered = questions.filter(q => !answers[q.id] || answers[q.id].trim().length === 0);
    if (unanswered.length > 0) {
      setMessage({ type: 'error', text: 'Please answer all security questions' });
      setLoading(false);
      return;
    }

    setStep(3);
    setLoading(false);
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      setLoading(false);
      return;
    }

    // Validate password complexity
    const errors = validatePassword(newPassword);
    if (errors.length > 0) {
      setMessage({ type: 'error', text: 'Password does not meet complexity requirements' });
      setPasswordErrors(errors);
      setLoading(false);
      return;
    }

    try {
      const answerArray = questions.map(q => ({
        answer_id: q.id,
        answer_text: answers[q.id]
      }));

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          answers: answerArray,
          new_password: newPassword
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to reset password');
        } else {
          throw new Error('Failed to reset password');
        }
      }

      const data = await response.json();
      setMessage({ type: 'success', text: data.message });
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            {step === 1 && 'Enter your username to begin password recovery'}
            {step === 2 && 'Answer your security questions'}
            {step === 3 && 'Create a new password'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {message && (
            <Alert className="mb-4" variant={message.type === 'error' ? 'destructive' : 'default'}>
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}

          {step === 1 && (
            <form onSubmit={handleUsernameSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Username
                </label>
                <Input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/login')}
                  className="flex-1"
                >
                  Back to Login
                </Button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleAnswersSubmit} className="space-y-4">
              <div className="space-y-4">
                {questions.map((q) => (
                  <div key={q.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {q.question_text}
                    </label>
                    <Input
                      type="text"
                      value={answers[q.id] || ''}
                      onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
                      placeholder="Your answer"
                      required
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? 'Verifying...' : 'Continue'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep(1);
                    setQuestions([]);
                    setAnswers({});
                  }}
                  className="flex-1"
                >
                  Back
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    const errors = validatePassword(e.target.value);
                    setPasswordErrors(errors);
                  }}
                  placeholder="Enter new password"
                  required
                  className={passwordErrors.length > 0 && newPassword ? 'border-red-500' : ''}
                />
                <div className="mt-2 space-y-1">
                  <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                  <ul className="text-xs space-y-0.5 ml-4">
                    <li className={newPassword.length >= 12 ? 'text-green-600' : 'text-gray-600'}>
                      • At least 12 characters
                    </li>
                    <li className={/[A-Z]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}>
                      • At least one uppercase letter (A-Z)
                    </li>
                    <li className={/[a-z]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}>
                      • At least one lowercase letter (a-z)
                    </li>
                    <li className={/[0-9]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}>
                      • At least one number (0-9)
                    </li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword) ? 'text-green-600' : 'text-gray-600'}>
                      • At least one special character
                    </li>
                    <li className={!/(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(newPassword) && newPassword ? 'text-green-600' : 'text-gray-600'}>
                      • No sequential characters
                    </li>
                  </ul>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  className={confirmPassword && newPassword !== confirmPassword ? 'border-red-500' : ''}
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
