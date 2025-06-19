/**
 * Login Page Component
 * 
 * This component provides user authentication functionality for the OrangeWave trading platform.
 * It handles user login with email/password validation, role-based redirection, and integration
 * with the authentication system.
 * 
 * Features:
 * - Form validation using Zod schema
 * - Password visibility toggle
 * - Loading states during authentication
 * - Role-based navigation (admin vs regular user)
 * - Automatic redirection when already authenticated
 * - Integration with AuthContext for user management
 */

// React hooks for state management and navigation
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Form handling with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI icons from Lucide React
import { Eye, EyeOff, Loader2 } from 'lucide-react';

// shadcn/ui form components for consistent styling and functionality
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Authentication context for user login functionality
import { useAuth } from '@/contexts/AuthContext';

/**
 * Form validation schema using Zod
 * 
 * Defines validation rules for login form fields:
 * - Email: Must be valid email format
 * - Password: Required field (minimum 1 character)
 */
const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

// TypeScript type inference from Zod schema for type safety
type FormData = z.infer<typeof formSchema>;

/**
 * Login Component
 * 
 * Main authentication form component that handles:
 * - User credential validation and submission
 * - Password visibility toggle
 * - Loading states during authentication
 * - Role-based redirection after successful login
 * - Navigation prevention when already authenticated
 * 
 * @returns JSX.Element - The complete login form interface
 */
const Login = () => {
  // Authentication context hooks for login functionality and user state
  const { login, isAuthenticated, user } = useAuth();
  
  // Navigation hook for redirecting after successful login
  const navigate = useNavigate();
  
  // Toast notifications for user feedback
  const { toast } = useToast();
  
  // Component state management
  const [isLoading, setIsLoading] = useState(false); // Tracks form submission state
  const [showPassword, setShowPassword] = useState(false); // Controls password visibility
  
  /**
   * Auto-redirect effect for authenticated users
   * 
   * Automatically redirects users based on their role when already authenticated:
   * - Admin users: redirect to /admin dashboard
   * - Regular users: redirect to /dashboard
   * This prevents authenticated users from accessing the login page
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    }
  }, [isAuthenticated, user, navigate]);
  
  /**
   * React Hook Form setup with Zod validation
   * 
   * Configures form handling with:
   * - Zod schema validation resolver
   * - Default empty values for email and password fields
   * - Type-safe form data structure
   */
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  /**
   * Form submission handler
   * 
   * Processes the login form data by:
   * 1. Setting loading state to prevent multiple submissions
   * 2. Extracting validated form credentials
   * 3. Calling the login function from AuthContext
   * 4. Handling success/error states (navigation handled by useEffect)
   * 5. Resetting loading state
   * 
   * @param data - Validated form data containing email and password
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Call authentication function with validated credentials
      await login(data.email, data.password);
      // Note: Redirection is handled by the useEffect hook above based on user role
    } catch (error) {
      // Error handling and user notifications are managed by the AuthContext login function
      // This includes displaying toast messages for invalid credentials or network errors
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };

  return (
    // Main container with full-screen layout and centered content
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Login card with glass effect styling */}
      <Card className="w-full max-w-md glass-card">
        {/* Card header with title and description */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>
        
        {/* Main form content */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <Link 
                        to="/password-recovery" 
                        className="text-xs text-primary hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type={showPassword ? "text" : "password"} 
                          placeholder="********" 
                          {...field} 
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-1 text-muted-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Sign up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
