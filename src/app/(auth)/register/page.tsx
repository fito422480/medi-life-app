"use client";

import { useState } from "react";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Mail, Lock } from "lucide-react";

const baseRegisterSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido"),
  email: z.string().email("Ingrese un correo electrónico válido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe contener al menos una mayúscula")
    .regex(/[a-z]/, "Debe contener al menos una minúscula")
    .regex(/[0-9]/, "Debe contener al menos un número")
    .regex(/[!@#$%^&*()]/, "Debe contener al menos un símbolo"),
  confirmPassword: z.string(),
  role: z.enum(["PATIENT", "DOCTOR"]),
});

const doctorRegisterSchema = baseRegisterSchema.extend({
  specialty: z.string().min(2, "La especialidad es requerida"),
  license: z.string().min(2, "El número de licencia es requerido"),
});

const registerSchema = z
  .discriminatedUnion("role", [
    baseRegisterSchema.extend({ role: z.literal("PATIENT") }),
    doctorRegisterSchema.extend({ role: z.literal("DOCTOR") }),
  ])
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [activeTab, setActiveTab] = useState<"PATIENT" | "DOCTOR">("PATIENT");

  const form = useForm<RegisterFormValues & { specialty?: string; license?: string }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: "PATIENT",
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      specialty: "",
      license: "",
    },
  });

  const onSubmit = (data: RegisterFormValues) => {
    console.log("Registro:", data);
    // Aquí va tu lógica de registro...
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-400 to-indigo-100">
      <div className="w-full max-w-md px-6 py-8 bg-white shadow-lg rounded-3xl">
        <Card className="border-none rounded-3xl">
          <CardHeader className="text-center space-y-4">
            <CardTitle className="text-4xl font-semibold text-gray-900">
              Crear una cuenta
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              Completa tus datos para unirte a MediAgenda
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val as "PATIENT" | "DOCTOR");
                form.setValue("role", val as "PATIENT" | "DOCTOR");
              }}
              className="mb-6"
            >
              <TabsList className="grid w-full grid-cols-2 rounded-lg bg-gray-100 p-1">
                <TabsTrigger value="PATIENT" className="rounded-lg">
                  Paciente
                </TabsTrigger>
                <TabsTrigger value="DOCTOR" className="rounded-lg">
                  Médico
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User
                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                            aria-hidden
                          />
                          <Input
                            placeholder="Juan Pérez"
                            className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                            {...field}
                          />
                        </div>
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
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail
                            className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                            aria-hidden
                          />
                          <Input
                            placeholder="tu@correo.com"
                            className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock
                              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                              aria-hidden
                            />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                              {...field}
                            />
                          </div>
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
                        <FormLabel>Confirmar Contraseña</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock
                              className="absolute left-3 top-3 h-5 w-5 text-gray-400"
                              aria-hidden
                            />
                            <Input
                              type="password"
                              placeholder="••••••••"
                              className="pl-10 focus:ring-2 focus:ring-primary focus:outline-none"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {activeTab === "DOCTOR" && (
                  <>
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Ej. Cardiología"
                              {...field}
                              className="focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="license"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Licencia</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Licencia médica"
                              {...field}
                              className="focus:ring-2 focus:ring-primary focus:outline-none"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition"
                >
                  Siguiente
                </Button>
              </form>
            </Form>
          </CardContent>

          <div className="text-center text-sm text-gray-600 pb-6">
            ¿Ya tienes una cuenta?{" "}
            <Link
              href="/login"
              className="text-primary font-medium hover:underline"
            >
              Iniciar sesión
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
