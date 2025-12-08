'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { useSession } from '@/context/SessionProvider';

export default function SettingsPageClient({ session }) {
    const routerNav = useRouter();
    const { updateProfile, changePassword } = useSession();
  
  const router = routerNav;
  const [formData, setFormData] = useState({
    first_name: session.first_name || '',
    last_name: session.last_name || '',
    email: session.email || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState([]);
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [currentPasswordError, setCurrentPasswordError] = useState('');
  const [passwordAgeError, setPasswordAgeError] = useState('');

  const validatePassword = (password) => {
    const errors = [];
    
    // Length requirement (minimum 12 characters for strong security)
    if (password.length < 12) {
      errors.push('Password must be at least 12 characters long');
    }
    
    // Maximum length check
    if (password.length > 128) {
      errors.push('Password must not exceed 128 characters');
    }
    
    // Uppercase letter requirement
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter (A-Z)');
    }
    
    // Lowercase letter requirement
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter (a-z)');
    }
    
    // Number requirement
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number (0-9)');
    }
    
    // Special character requirement
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?)');
    }
    
    // Check for common patterns
    if (/^(?:password|12345678|qwerty|abc123)/i.test(password)) {
      errors.push('Password contains common patterns and is too weak');
    }
    
    // Check for sequential characters
    if (/(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(password)) {
      errors.push('Password should not contain sequential characters');
    }
    
    return errors;
  };

  const calculatePasswordStrength = (password) => {
    if (!password) return { score: 0, label: '', color: '' };
    
    let score = 0;
    
    // Length scoring (0-30 points)
    if (password.length >= 8) score += 10;
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;
    
    // Character variety (0-40 points)
    if (/[a-z]/.test(password)) score += 10;
    if (/[A-Z]/.test(password)) score += 10;
    if (/[0-9]/.test(password)) score += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
    
    // Complexity bonus (0-20 points)
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 5;
    if (/[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 5;
    if (password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 10;
    
    // Penalty for common patterns (-20 points)
    if (/^(?:password|12345678|qwerty|abc123)/i.test(password)) score -= 20;
    if (/(012|123|234|345|456|567|678|789|abc|bcd|cde|def)/i.test(password)) score -= 10;
    
    // Ensure score is between 0-100
    score = Math.max(0, Math.min(100, score));
    
    // Determine strength label and color
    if (score < 30) {
      return { score, label: 'Weak', color: 'bg-red-500', textColor: 'text-red-600' };
    } else if (score < 60) {
      return { score, label: 'Fair', color: 'bg-yellow-500', textColor: 'text-yellow-600' };
    } else if (score < 80) {
      return { score, label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600' };
    } else {
      return { score, label: 'Strong', color: 'bg-green-500', textColor: 'text-green-600' };
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear current password error when user starts typing
    if (name === 'current_password' && currentPasswordError) {
      setCurrentPasswordError('');
      setMessage(null);
    }
    
    // Real-time password validation
    if (name === 'new_password') {
      const errors = validatePassword(value);
      setPasswordErrors(errors);
      // Check if confirm password matches when new password changes
      if (formData.confirm_password && value !== formData.confirm_password) {
        setPasswordMatchError('Passwords do not match');
      } else {
        setPasswordMatchError('');
      }
    }
    
    // Real-time password match validation
    if (name === 'confirm_password') {
      if (value && formData.new_password !== value) {
        setPasswordMatchError('Passwords do not match');
      } else {
        setPasswordMatchError('');
      }
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);


    const result = await updateProfile({
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
    });

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Profile updated successfully!' });
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to update profile' });
    }
    setLoading(false);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (formData.new_password !== formData.confirm_password) {
      setPasswordMatchError('Passwords do not match');
      setLoading(false);
      return;
    }

    // Validate password complexity
    const errors = validatePassword(formData.new_password);
    if (errors.length > 0) {
      setMessage({ type: 'error', text: 'Password does not meet complexity requirements' });
      setPasswordErrors(errors);
      setLoading(false);
      return;
    }

    const result = await changePassword(formData.current_password, formData.new_password);

    if (result.success) {
      setMessage({ type: 'success', text: result.message || 'Password changed successfully!' });
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
      setPasswordErrors([]);
      setPasswordMatchError('');
      setCurrentPasswordError('');
      setPasswordAgeError('');
    } else {
      // Check if error is about password verification or password age
      const errorMsg = result.error || 'Failed to change password';
      if (errorMsg.toLowerCase().includes('verify') || errorMsg.toLowerCase().includes('current password')) {
        setCurrentPasswordError('Unable to verify current password');
        setMessage({ type: 'error', text: 'Password change failed. Please verify your current password and try again.' });
      } else if (errorMsg.toLowerCase().includes('one day old') || errorMsg.toLowerCase().includes('wait')) {
        // Password age policy error - display in the password policy banner
        setPasswordAgeError(errorMsg);
      } else {
        setMessage({ type: 'error', text: errorMsg });
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
            <p className="text-sm text-gray-600">
              Manage your account information and preferences
            </p>
          </div>
          <Button 
            onClick={() => router.push('/dashboard')}
            variant="outline"
            className="bg-white shadow-md"
          >
            Back to Dashboard
          </Button>
        </div>

        {message && (
          <Alert className="mb-4" variant={message.type === 'error' ? 'destructive' : 'default'}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Profile Information Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <Input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleChange}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleChange}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <Input
                    type="text"
                    value={session.username}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Username cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <Input
                    type="text"
                    value={session.role}
                    disabled
                    className="bg-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1">Role is assigned by administrator</p>
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
              <div className={`mt-2 p-3 rounded text-xs ${passwordAgeError ? 'bg-red-50 border border-red-200' : 'bg-blue-50 border border-blue-200'}`}>
                {passwordAgeError ? (
                  <p className="text-red-800"><strong>⚠ {passwordAgeError}</strong></p>
                ) : (
                  <p className="text-blue-800"><strong>Password Policy:</strong> For security reasons, passwords must be at least one day old before they can be changed.</p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="current_password"
                    value={formData.current_password}
                    onChange={handleChange}
                    placeholder="Enter current password"
                    required
                    className={currentPasswordError ? 'border-red-500' : ''}
                  />
                  {currentPasswordError && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs font-medium text-red-800">⚠ {currentPasswordError}</p>
                      <p className="text-xs text-red-700 mt-1">Your existing password remains active. Please double-check your current password and try again.</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="new_password"
                    value={formData.new_password}
                    onChange={handleChange}
                    placeholder="Enter new password"
                    required
                    className={passwordErrors.length > 0 && formData.new_password ? 'border-red-500' : ''}
                  />
                  {formData.new_password && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-gray-700">Password Strength:</span>
                        <span className={`text-xs font-bold ${calculatePasswordStrength(formData.new_password).textColor}`}>
                          {calculatePasswordStrength(formData.new_password).label}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full transition-all duration-300 ${calculatePasswordStrength(formData.new_password).color}`}
                          style={{ width: `${calculatePasswordStrength(formData.new_password).score}%` }}
                        />
                      </div>
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-medium text-gray-700">Password must contain:</p>
                    <ul className="text-xs space-y-0.5 ml-4">
                      <li className={formData.new_password.length >= 12 ? 'text-green-600' : 'text-gray-600'}>
                        • At least 12 characters
                      </li>
                      <li className={/[A-Z]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-600'}>
                        • At least one uppercase letter (A-Z)
                      </li>
                      <li className={/[a-z]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-600'}>
                        • At least one lowercase letter (a-z)
                      </li>
                      <li className={/[0-9]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-600'}>
                        • At least one number (0-9)
                      </li>
                      <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.new_password) ? 'text-green-600' : 'text-gray-600'}>
                        • At least one special character (!@#$%^&*...)
                      </li>
                      <li className={!/(012|123|234|345|456|567|678|789|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)/i.test(formData.new_password) && formData.new_password ? 'text-green-600' : 'text-gray-600'}>
                        • No sequential characters
                      </li>
                    </ul>
                    {passwordErrors.length > 0 && formData.new_password && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                        <p className="text-xs font-medium text-red-800 mb-1">Issues found:</p>
                        <ul className="text-xs text-red-700 space-y-0.5 ml-4">
                          {passwordErrors.map((error, index) => (
                            <li key={index}>• {error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    placeholder="Confirm new password"
                    required
                    className={passwordMatchError && formData.confirm_password ? 'border-red-500' : ''}
                  />
                  {passwordMatchError && formData.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">{passwordMatchError}</p>
                  )}
                </div>
                <Button type="submit" disabled={loading}>
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}