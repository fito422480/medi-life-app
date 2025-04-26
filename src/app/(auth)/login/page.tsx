"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import { FirebaseError } from "firebase/app";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2, LockKeyhole, Mail } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  email: z
    .string()
    .min(1, "El correo electrónico es obligatorio")
    .email("Ingresa un correo electrónico válido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();
  const {
    signIn,
    signInWithGoogleRedirect,
    user,
    error: authError,
  } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      setIsLoading(true);
      await signIn(data.email, data.password);
      router.push("/dashboard");
    } catch (err) {
      const error = err as FirebaseError;
      setError(error.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      setGoogleLoading(true);
      await signInWithGoogleRedirect();
    } catch (err) {
      const error = err as FirebaseError;
      setError(error.message || "Error al iniciar sesión con Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-indigo-100">
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-lg rounded-3xl">
        <Card className="border-none rounded-3xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-4xl font-semibold text-gray-900">
              Bienvenido a MediAgenda
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Inicia sesión para continuar con tu agenda médica
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm font-medium text-gray-700">
                        Correo Electrónico
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            placeholder="tu@correo.com"
                            className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                            autoComplete="email"
                            spellCheck="false"
                            data-lpignore="true"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Contraseña
                        </FormLabel>
                        <Link
                          href="/forgot-password"
                          className="text-sm text-primary hover:underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <LockKeyhole className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                            autoComplete="current-password"
                            data-lpignore="true"
                            {...field}
                            disabled={isLoading}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Iniciando sesión...
                    </>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </Button>
              </form>
            </Form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase text-gray-500">
                <span className="bg-white px-2">o continúa con</span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 border-gray-300 text-gray-700 hover:text-gray-900 transition"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Redirigiendo a Google...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="text-[#4285F4]"
                  >
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path
                      d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.29-1.94-6.16-4.56H2.09v2.86C3.89 20.71 7.67 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 13.08A6.989 6.989 0 0 1 5.43 12c0-.38.07-.75.12-1.08V8.06H2.09A10.96 10.96 0 0 0 1 12c0 1.76.41 3.43 1.09 4.94l2.75-2.12z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 4.56c1.61 0 3.06.55 4.21 1.63l3.16-3.16C17.43 1.24 14.96 0 12 0 7.67 0 3.89 2.29 2.09 5.94l2.75 2.12C6.71 6.5 9.13 4.56 12 4.56z"
                      fill="#EA4335"
                    />
                  </svg>
                  Continuar con Google
                </>
              )}
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
