import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
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

const API_URL = 'http://localhost:3001/api';

// Validação: email + senha (min 6) + confirmação
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

type FormData = z.infer<typeof formSchema>;

const PasswordRecovery = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${API_URL}/users/change-password`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: data.email,
            newPassword: data.newPassword,
          }),
        }
      );

      if (response.ok) {
        toast({
          title: 'Senha alterada',
          description: `A nova senha foi registrada para ${data.email}.`,
        });
        setIsSubmitted(true);
      } else {
        const err = await response.json();
        throw new Error(err.message || 'Não foi possível trocar a senha.');
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md glass-card">
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
