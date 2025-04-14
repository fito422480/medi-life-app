// src/app/(auth)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase/config";
import { createUserProfile, createDoctorProfile, createPatientProfile } from "@/lib/firebase/db";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Calendar,
  UserRound,
  Stethoscope,
  BadgeCheck,
  ChevronRight,
} from "lucide-react";
import { UserRole } from "@/lib/types";

// Esquema base de validación
const baseUserSchema = z.object({
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  email: z.string().email("Correo electrónico inválido"),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      "La contraseña debe contener al menos una letra mayúscula, una minúscula, un número y un carácter especial"
    ),
  confirmPassword: z.string(),
});

// Esquema específico para pacientes
const patientSchema = baseUserSchema.extend({
  role: z.literal("PATIENT"),
  birthDate: z.string().min(1, "La fecha de nacimiento es requerida"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Por favor selecciona tu género",
  }),
});

// Esquema específico para médicos
const doctorSchema = baseUserSchema.extend({
  role: z.literal("DOCTOR"),
  specialty: z.string().min(1, "La especialidad es requerida"),
  license: z.string().min(3, "El número de licencia médica es requerido"),
});

// Esquema combinado con refinamiento para confirmar contraseña
const registerSchema = z.discriminatedUnion("role", [
  patientSchema,
  doctorSchema,
]).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registerStep, setRegisterStep] = useState(1);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "PATIENT",
      birthDate: "",
      gender: "OTHER",
      specialty: "",
      license: "",
    },
  });

  const watchRole = form.watch("role");

  const onSubmit = async (data: RegisterFormValues) => {
    // Si estamos en el primer paso, avanzar al segundo
    if (registerStep === 1) {
      setRegisterStep(2);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );
      
      const uid = userCredential.user.uid;
      
      // Crear perfil base del usuario
      await createUserProfile(uid, {
        uid,
        email: data.email,
        displayName: data.name,
        role: data.role as UserRole,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      
      // Crear perfil específico según el rol
      if (data.role === "PATIENT") {
        await createPatientProfile(uid, {
          uid,
          email: data.email,
          displayName: data.name,
          role: "PATIENT",
          dateOfBirth: new Date(data.birthDate),
          gender: data.gender,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      } else if (data.role === "DOCTOR") {
        await createDoctorProfile(uid, {
          uid,
          email: data.email,
          displayName: data.name,
          role: "DOCTOR",
          specialty: data.specialty,
          licenseNumber: data.license,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
      
      // Redirigir a login o dashboard
      router.push("/login?registered=true");
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Map Firebase error codes to user-friendly messages
      const errorMap: Record<string, string> = {
        "auth/email-already-in-use": "Este correo electrónico ya está registrado",
        "auth/invalid-email": "Correo electrónico no válido",
        "auth/weak-password": "La contraseña es demasiado débil",
      };
      
      setError(errorMap[error.code] || "Ha ocurrido un error durante el registro");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el cambio de rol
  const handleRoleChange = (role: "PATIENT" | "DOCTOR") => {
    form.setValue("role", role);
  };

  // Función para volver al paso anterior
  const handleBack = () => {
    setRegisterStep(1);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-blue-50 to-indigo-100">
      <div className="w-full max-w-2xl p-4">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-3xl font-bold">Crear una cuenta</CardTitle>
            <CardDescription className="text-md">
              Completa el formulario para registrarte en MediAgenda
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Paso 1: Información básica */}
                {registerStep === 1 && (
                  <>
                    <div className="flex justify-center mb-6">
                      <Tabs
                        defaultValue={watchRole}
                        onValueChange={(value) => handleRoleChange(value as "PATIENT" | "DOCTOR")}
                        className="w-full max-w-md"
                      >
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="PATIENT">Paciente</TabsTrigger>
                          <TabsTrigger value="DOCTOR">Médico</TabsTrigger>
                        </TabsList>
                      </Tabs>
                    </div>
                    
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input placeholder="Juan Pérez" className="pl-10" {...field} />
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
                                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                <Input
                                  placeholder="tu@correo.com"
                                  type="email"
                                  className="pl-10"
                                  {...field}
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contraseña</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input type="password" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Mínimo 8 caracteres con mayúsculas, minúsculas, números y símbolos
                              </FormDescription>
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
                                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input type="password" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </>
                )}
                
                {/* Paso 2: Información específica según el rol */}
                {registerStep === 2 && (
                  <>
                    <div className="flex items-start mb-6">
                      <div className="bg-primary/10 p-3 rounded-full mr-4">
                        {watchRole === "PATIENT" ? (
                          <UserRound className="h-6 w-6 text-primary" />
                        ) : (
                          <Stethoscope className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">
                          {watchRole === "PATIENT"
                            ? "Información del Paciente"
                            : "Información del Médico"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {watchRole === "PATIENT"
                            ? "Por favor completa tu información médica básica"
                            : "Por favor completa tu información profesional"}
                        </p>
                      </div>
                    </div>
                    
                    {watchRole === "PATIENT" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="birthDate"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Fecha de Nacimiento</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input type="date" className="pl-10" {...field} />
                                </div>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="gender"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Género</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-col space-y-1"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="MALE" id="male" />
                                    <Label htmlFor="male">Masculino</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="FEMALE" id="female" />
                                    <Label htmlFor="female">Femenino</Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="OTHER" id="other" />
                                    <Label htmlFor="other">Otro</Label>
                                  </div>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {watchRole === "DOCTOR" && (
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="specialty"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Especialidad Médica</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecciona tu especialidad" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="Medicina General">Medicina General</SelectItem>
                                  <SelectItem value="Psiquiatría">Psiquiatría</SelectItem>
                                  <SelectItem value="Psicología">Psicología</SelectItem>
                                  <SelectItem value="Neurología">Neurología</SelectItem>
                                  <SelectItem value="Cardiología">Cardiología</SelectItem>
                                  <SelectItem value="Dermatología">Dermatología</SelectItem>
                                  <SelectItem value="Pediatría">Pediatría</SelectItem>
                                  <SelectItem value="Ginecología">Ginecología</SelectItem>
                                  <SelectItem value="Traumatología">Traumatología</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="license"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Número de Licencia Médica</FormLabel>
                              <FormControl>
                                <div className="relative">
                                  <BadgeCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                  <Input
                                    placeholder="Ej: LIC-12345"
                                    className="pl-10"
                                    {...field}
                                  />
                                </div>
                              </FormControl>
                              <FormDescription className="text-xs">
                                Este número será verificado antes de activar tu cuenta
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </>
                )}
                
                <div className="flex justify-between mt-8">
                  {registerStep === 2 && (
                    <Button type="button" variant="outline" onClick={handleBack}>
                      Volver
                    </Button>
                  )}
                  
                  <Button
                    type="submit"
                    className={registerStep === 1 ? "w-full" : "w-32"}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Registrando...
                      </>
                    ) : registerStep === 1 ? (
                      <>
                        Siguiente
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Registrarme"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
          
          <CardFooter className="flex justify-center border-t pt-6">
            <p className="text-center text-sm text-muted-foreground">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Iniciar sesión
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}