'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Link from 'next/link';
import { useAppStore } from '@/stores/useAppStore';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { loginUser as apiLoginUser } from '@/lib/api';

const loginSchema = z.object({
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { toast } = useToast();
  const loginUser = useAppStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  console.log('Componente LoginForm renderizado');

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    console.log('Submit ejecutado. Email:', data.email, 'Password:', data.password);
    try {
      const res = await apiLoginUser(data);
      if (!res.ok) {
        toast({
          title: 'Error de inicio de sesión',
          description: (res.body && res.body.detail) || 'Correo electrónico o contraseña incorrectos.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      const result = res.body;
      console.log('Login exitoso, usuario:', result);
      loginUser({ id: result.user.email, name: result.user.name, email: result.user.email, avatarUrl: 'https://placehold.co/100x100.png' });
      toast({
        title: 'Inicio de sesión exitoso',
        description: 'Bienvenido de nuevo!',
      });
      router.push('/home');
    } catch (err) {
      console.log('Error en login:', err);
      toast({
        title: 'Error de red',
        description: 'No se pudo conectar con el servidor.',
        variant: 'destructive',
      });
    }
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl">Bienvenido de nuevo</CardTitle>
        <CardDescription>Ingresa tus credenciales para acceder a tu cuenta.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={(e) => {
              console.log('Evento onSubmit del formulario disparado');
              form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-6"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correo electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="tu@correo.com" {...field} />
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
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Iniciar sesión
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Link href="#" className="text-sm text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
        <Link href="/auth/register" className="text-sm text-primary hover:underline">
          Crear nueva cuenta
        </Link>
      </CardFooter>
    </Card>
  );
}
