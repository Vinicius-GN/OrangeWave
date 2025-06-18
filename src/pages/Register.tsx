/**
 * Register Page Component
 * 
 * This component provides a comprehensive user registration form for the OrangeWave trading platform.
 * It handles user account creation with validation, address collection, and integration with the
 * authentication system.
 * 
 * Features:
 * - Form validation using Zod schema
 * - Responsive design with mobile-first approach
 * - Password visibility toggle
 * - Loading states during registration
 * - Complete address collection for user profiles
 * - Integration with AuthContext for user management
 */

// React hooks for state management and navigation
import { useState } from 'react';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

// Authentication context for user registration functionality
import { useAuth } from '@/contexts/AuthContext';

/**
 * Form validation schema using Zod
 * 
 * Defines validation rules for all registration form fields:
 * - Personal information (name, email, password, phone)
 * - Complete address information (country, state, city, street, number)
 * 
 * Each field has minimum length requirements and appropriate validation
 * for email format and other field-specific rules.
 */
const formSchema = z.object({
  fullName: z.string().min(2, { message: 'Full name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  phone: z.string().min(10, { message: 'Please enter a valid phone number.' }),
  country: z.string().min(2, { message: 'Country is required.' }),
  state: z.string().min(2, { message: 'State is required.' }),
  city: z.string().min(2, { message: 'City is required.' }),
  street: z.string().min(2, { message: 'Street is required.' }),
  number: z.string().min(1, { message: 'Number is required.' }),
});

// TypeScript type inference from Zod schema for type safety
type FormData = z.infer<typeof formSchema>;

/**
 * Register Component
 * 
 * Main registration form component that handles:
 * - User input collection and validation
 * - Form submission and API integration
 * - Loading states and error handling
 * - Navigation after successful registration
 * 
 * @returns JSX.Element - The complete registration form interface
 */
const Register = () => {
  // Authentication context hook for registration functionality
  const { register } = useAuth();
  
  // Navigation hook for redirecting after successful registration
  const navigate = useNavigate();
  
  // Component state management
  const [isLoading, setIsLoading] = useState(false); // Tracks form submission state
  const [showPassword, setShowPassword] = useState(false); // Controls password visibility
  
  /**
   * React Hook Form setup with Zod validation
   * 
   * Configures form handling with:
   * - Zod schema validation resolver
   * - Default empty values for all fields
   * - Type-safe form data structure
   */
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      phone: '',
      country: '',
      state: '',
      city: '',
      street: '',
      number: '',
    },
  });
  
  /**
   * Form submission handler
   * 
   * Processes the registration form data by:
   * 1. Setting loading state to prevent multiple submissions
   * 2. Extracting validated form data
   * 3. Calling the register function from AuthContext
   * 4. Navigating to login page on success
   * 5. Handling errors (delegated to AuthContext)
   * 6. Resetting loading state
   * 
   * @param data - Validated form data matching FormData type
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Destructure validated form data
      const { fullName, email, password, phone, country, state, city, street, number } = data;
      
      // Call registration function with user data and address object
      await register(
        fullName,
        email,
        password,
        phone,
        { country, state, city, street, number }
      );
      
      // Navigate to login page after successful registration
      navigate('/login');
    } catch (error) {
      // Error handling is managed by the AuthContext register function
      // This includes displaying toast notifications to the user
    } finally {
      // Always reset loading state regardless of success or failure
      setIsLoading(false);
    }
  };
    return (
    // Main container with full-screen layout and centered content
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      {/* Registration card with glass effect styling */}
      <Card className="w-full max-w-2xl glass-card">
        {/* Card header with title and description */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
          <CardDescription className="text-center">
            Enter your information to create your OrangeWave account
          </CardDescription>
        </CardHeader>
        
        {/* Main form content */}
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Personal Information Section - Two-column responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name Field */}
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Email Field with email input type */}
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
              </div>
              
              {/* Password and Phone Section - Two-column responsive grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password Field with visibility toggle */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="********" 
                            {...field} 
                          />
                        </FormControl>
                        {/* Password visibility toggle button */}
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
                
                {/* Phone Field */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Address Information Section */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Address</h3>
                
                {/* Country and State - Two-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input placeholder="United States" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="California" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                {/* City, Street, and Number - Three-column grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <FormControl>
                          <Input placeholder="Los Angeles" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="street"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street</FormLabel>
                        <FormControl>
                          <Input placeholder="Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Number</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              
              {/* Submit Button with loading state */}
              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        
        {/* Card footer with login link */}
        <CardFooter className="flex justify-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
