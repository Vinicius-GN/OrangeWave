/**
 * Password Recovery Page Component
 *
 * This component provides password reset functionality for the OrangeWave trading platform.
 * It allows users to reset their passwords by providing their email and new password,
 * with proper validation and confirmation steps.
 *
 * Features:
 * - Email-based password reset process
 * - New password validation with confirmation matching
 * - Form validation using Zod schema
 * - Loading states during password reset process
 * - Success confirmation with user feedback
 * - Back to login navigation
 * - Integration with authentication API
 * - Responsive design with glass card effect
 */

// React hooks for state management
import { useState } from 'react';
import { Link } from 'react-router-dom';

// Form handling with validation
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI icons from Lucide React
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// API configuration
const API_URL = 'http://localhost:3001/api';

/**
 * Password recovery form validation schema using Zod
 *
 * Defines validation rules for password reset form:
 * - Email: Must be valid email format
 * - New Password: Minimum 6 characters required
 * - Confirm Password: Must match new password
 * - Custom refinement to ensure password confirmation matches
 */
const formSchema = z
  .object({
    email: z.string().email({ message: 'Insira um e-mail válido.' }),
    newPassword: z.string().min(6, {
      message: 'A senha deve ter ao menos 6 caracteres.',
    }),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'As senhas não coincidem.',
  });

// TypeScript type inference from Zod schema for type safety
type FormData = z.infer<typeof formSchema>;

/**
 * PasswordRecovery Component
 *
 * Main password recovery component that handles:
 * - Password reset form validation and submission
 * - API integration for password update
 * - Loading states and user feedback
 * - Success confirmation and navigation
 * - Error handling with toast notifications
 *
 * @returns JSX.Element - The complete password recovery interface
 */
const PasswordRecovery = () => {
  // Toast notifications for user feedback
  const { toast } = useToast();

  // Component state management
  const [isLoading, setIsLoading] = useState(false); // Tracks form submission state
  const [isSubmitted, setIsSubmitted] = useState(false); // Tracks successful submission

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
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  /**
   * Password reset form submission handler
   *
   * Processes the password reset request by:
   * 1. Setting loading state to prevent multiple submissions
   * 2. Extracting validated form data
   * 3. Making API call to reset password endpoint
   * 4. Handling success/error responses with appropriate user feedback
   * 5. Updating submission state for UI changes
   *
   * @param data - Validated form data containing email and new password
   */
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);

    try {
      // API call to password reset endpoint
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: data.email,
          newPassword: data.newPassword,
        }),
      });

      if (response.ok) {
        // Success: Update UI state and show success message
        setIsSubmitted(true);
        toast({
          title: 'Senha alterada',
          description: `A nova senha foi registrada para ${data.email}.`,
        });
      } else {
        // API error: Parse error message and display to user
        const errorData = await response.json();
        toast({
          title: 'Falha ao Alterar Senha',
          description:
            errorData.message || 'Não foi possível trocar a senha. Tente novamente.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      // Network or other errors
      console.error('Error changing password:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  return (
    // Main password reset form container
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
        {/* Form header with title and description */}
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            {isSubmitted ? 'Tudo Pronto!' : 'Trocar Senha'}
          </CardTitle>
          <CardDescription className="text-center">
            {isSubmitted
              ? 'Sua senha foi alterada com sucesso. Faça login abaixo.'
              : 'Informe seu e-mail e a nova senha'}
          </CardDescription>
        </CardHeader>

        {/* Main form content */}
        <CardContent>
          {isSubmitted ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="h-16 w-16 text-primary mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Senha Atualizada
              </h3>
              <p className="text-muted-foreground mb-6">
                Você já pode fazer login com sua nova senha.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Login
              </Link>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-mail</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="seu@email.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nova Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
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
                      Alterando...
                    </>
                  ) : (
                    'Trocar Senha'
                  )}
                </Button>
              </form>
            </Form>
          )}
        </CardContent>

        {!isSubmitted && (
          <CardFooter className="flex justify-center">
            <Link
              to="/login"
              className="text-sm text-primary hover:underline flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar ao Login
            </Link>
          </CardFooter>
        )}
      </Card>
    </div>
  );
};

export default PasswordRecovery;
