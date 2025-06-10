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
import { registerUser as apiRegisterUser } from '@/lib/api';

const registerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.'),
  email: z.string().email('Correo electrónico inválido.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const router = useRouter();
  const { toast } = useToast();
  const loginUser = useAppStore((state) => state.login);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      console.log('Enviando registro:', data);
      const res = await apiRegisterUser(data);
      if (!res.ok) {
        toast({
          title: 'Error al registrar',
          description: (res.body && res.body.detail) || 'No se pudo crear la cuenta.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }
      // Registro exitoso, loguear automáticamente
      loginUser({ id: data.email, name: data.name, email: data.email, avatarUrl: 'https://placehold.co/100x100.png' });
      toast({
        title: 'Cuenta creada exitosamente',
        description: 'Bienvenido a myzend!',
      });
      router.push('/home');
    } catch (err) {
      console.log('Error en fetch registro:', err);
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
        {/* Logo myzend arriba del título */}
        <div className="flex flex-col items-center mb-2">
          <img src="/logo.jpg" alt="myzend logo" width={80} height={80} className="rounded-full mb-2 shadow-md" />
        </div>
        <CardTitle className="text-2xl">Crea tu cuenta en myzend</CardTitle>
        <CardDescription>Únete para mejorar tu bienestar emocional.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input placeholder="Tu nombre completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear cuenta
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter>
        <Link href="/auth/login" className="text-sm text-primary hover:underline w-full text-center">
          ¿Ya tienes cuenta? Inicia sesión
        </Link>
      </CardFooter>
    </Card>
  );
}
