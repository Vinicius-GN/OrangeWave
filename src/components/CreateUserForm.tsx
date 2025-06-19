/**
 * @file ChangePasswordForm.tsx
 * @brief React component for changing the password of an authenticated user.
 *
 * This component renders a form inside a Card that allows the user to:
 *  - Enter their current password
 *  - Type a new password and confirm it
 *  - Validate that the new password matches the confirmation and meets minimum length
 *  - Send an authenticated request to change the password via API
 *  - Display success or error feedback using toasts
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @brief Component rendering the password change form.
 *
 * Renders inside a Card with header, description, and form fields.
 * The form contains three password fields and a submit button.
 *
 * Validations before submission:
 *  - New password must match confirmation
 *  - New password must be at least 6 characters long
 *  - User must be authenticated and have a JWT token
 *
 * On submit, sends POST to `/api/users/me/change-password` with:
 *  - oldPassword: the current password
 *  - newPassword: the new password
 *
 * Displays toast notifications for success or error based on the API response.
 *
 * @return JSX.Element The complete Card structure with the change password form.
 */
const ChangePasswordForm = (): JSX.Element => {
  /** @brief State for the current password entered by the user. */
  const [currentPassword, setCurrentPassword] = useState<string>('');
  /** @brief State for the new password chosen by the user. */
  const [newPassword, setNewPassword] = useState<string>('');
  /** @brief State for the confirmation of the new password. */
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  /** @brief State indicating whether the password change request is in progress. */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** @brief Authentication context providing the current user object. */
  const { user } = useAuth();
  /** @brief Hook for displaying toast notifications to the user. */
  const { toast } = useToast();

  /**
   * @brief Form submit handler for changing the password.
   *
   * Performs client-side validations, then:
   *  1. Retrieves JWT token from localStorage
   *  2. Sends an authenticated POST request to change the password
   *  3. Handles the API response:
   *     - On success: shows a success toast and clears form fields
   *     - On error: shows an error toast with the returned message
   *
   * @param e React.FormEvent triggered by form submission.
   */
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();

    // Validate that the new password matches the confirmation
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive",
      });
      return;
    }

    // Validate that the new password meets minimum length requirement
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    // Retrieve JWT token and ensure the user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token || !user) {
      toast({
        title: "Authentication error",
        description: "Please log in again.",
        variant: "destructive",
      });
      return;
    }

    // Set loading state to disable the form while the request is in flight
    setIsLoading(true);

    try {
      // Send the change-password request to the backend API
      const response = await fetch(
        'http://localhost:3001/api/users/me/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword,
          }),
        }
      );

      // Check the HTTP response status
      if (response.ok) {
        // Success: notify the user and reset form fields
        toast({
          title: "Password changed",
          description: "Your password has been successfully updated.",
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // Failure: parse error message and display toast
        const errorData = await response.json();
        toast({
          title: "Failed to change password",
          description:
            errorData.message ||
            "Please check your current password and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      // Network or unexpected error handling
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "An error occurred while changing your password.",
        variant: "destructive",
      });
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  // Render the Card containing the change password form
  return (
    <Card>
      {/* Card header with title and description */}
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password. Make sure to use a strong password.
        </CardDescription>
      </CardHeader>

      {/* Card content: the form itself */}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Section: Current Password field */}
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Current Password</Label>
            <Input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>

          {/* Section: New Password field */}
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Section: Confirm New Password field */}
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          {/* Submit button: disabled when loading or fields are empty */}
          <Button
            type="submit"
            disabled={
              isLoading ||
              !currentPassword ||
              !newPassword ||
              !confirmPassword
            }
            className="w-full"
          >
            {isLoading ? "Changing Password..." : "Change Password"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordForm;
