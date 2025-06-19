/**
 * @file ChangePasswordForm.tsx
 * @brief React component for authenticated users to change their password.
 *
 * This component renders a Card containing:
 *  - An input for the current password
 *  - An input for the new password
 *  - An input to confirm the new password
 *  - Client-side validation for mismatch and minimum length
 *  - A POST request to the authenticated API endpoint to update the password
 *  - Toast notifications for success, validation errors, and API errors
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
  CardTitle
} from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';

/**
 * @brief Component that renders the change password form.
 *
 * Manages form state, validation, and API integration to allow a user
 * to update their password securely.
 *
 * @returns JSX.Element containing the form wrapped in a Card.
 */
const ChangePasswordForm = (): JSX.Element => {
  /** @brief State for storing the current password input by the user. */
  const [currentPassword, setCurrentPassword] = useState<string>('');
  /** @brief State for storing the new password input by the user. */
  const [newPassword, setNewPassword] = useState<string>('');
  /** @brief State for storing the confirmation of the new password. */
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  /** @brief State flag indicating whether the password change request is in progress. */
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /** @brief Authentication context providing the current user object. */
  const { user } = useAuth();
  /** @brief Toast context for showing notifications to the user. */
  const { toast } = useToast();

  /**
   * @brief Handles form submission to change the password.
   *
   * Performs the following steps:
   *  1. Prevent default form behavior.
   *  2. Validate that the new password matches the confirmation.
   *  3. Validate that the new password meets the minimum length.
   *  4. Retrieve JWT token and ensure the user is authenticated.
   *  5. Send a POST request to the API endpoint with the current and new passwords.
   *  6. Handle success and error responses, showing appropriate toasts.
   *
   * @param e React.FormEvent triggered by submitting the form.
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate that the new password and confirmation match
    if (newPassword !== confirmPassword) {
      toast({
        title: "Password mismatch",
        description: "New password and confirmation don't match.",
        variant: "destructive"
      });
      return;
    }

    // Validate minimum length of the new password
    if (newPassword.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long.",
        variant: "destructive"
      });
      return;
    }

    // Retrieve the JWT token from localStorage and ensure user context
    const token = localStorage.getItem('authToken');
    if (!token || !user) {
      toast({
        title: "Authentication error",
        description: "Please log in again.",
        variant: "destructive"
      });
      return;
    }

    // Set loading state to disable form inputs and show progress indicator
    setIsLoading(true);

    try {
      // Send POST request to change the password
      const response = await fetch(
        'http://localhost:3001/api/users/me/change-password',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            oldPassword: currentPassword,
            newPassword: newPassword
          })
        }
      );

      if (response.ok) {
        // On success, notify user and clear form fields
        toast({
          title: "Password changed",
          description: "Your password has been successfully updated."
        });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        // On failure, parse and display the error message
        const errorData = await response.json();
        toast({
          title: "Failed to change password",
          description: errorData.message || "Please check your current password and try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      // Handle unexpected errors (network issues, etc.)
      console.error('Error changing password:', error);
      toast({
        title: "Error",
        description: "An error occurred while changing your password.",
        variant: "destructive"
      });
    } finally {
      // Reset loading state regardless of outcome
      setIsLoading(false);
    }
  };

  // Render the Card containing the change password form
  return (
    <Card>
      {/** Card header with title and description */}
      <CardHeader>
        <CardTitle>Change Password</CardTitle>
        <CardDescription>
          Update your account password. Make sure to use a strong password.
        </CardDescription>
      </CardHeader>

      {/** Card content containing the form */}
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/** Current Password Field */}
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

          {/** New Password Field */}
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

          {/** Confirm New Password Field */}
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

          {/** Submit Button: disabled while loading or if any field is empty */}
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
