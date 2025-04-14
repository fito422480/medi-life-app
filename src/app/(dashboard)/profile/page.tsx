"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  updateUserProfile,
  updateDoctorProfile,
  updatePatientProfile,
} from "@/lib/firebase/db";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// Definición de esquemas de validación
const commonFormSchema = z.object({
  displayName: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  photoURL: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

const doctorFormSchema = commonFormSchema.extend({
  bio: z.string().optional(),
  specialty: z.string().min(3, "La especialidad es requerida"),
  licenseNumber: z.string().min(3, "El número de licencia es requerido"),
});

const patientFormSchema = commonFormSchema.extend({
  bloodType: z.string().optional(),
  allergies: z.string().optional(),
  medicalHistory: z.string().optional(),
  emergencyContactName: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
});

// Tipos para los formularios
type CommonFormData = z.infer<typeof commonFormSchema>;
type DoctorFormData = z.infer<typeof doctorFormSchema>;
type PatientFormData = z.infer<typeof patientFormSchema>;

export default function ProfilePage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Formularios con tipos genéricos
  const generalForm = useForm<CommonFormData>({
    resolver: zodResolver(commonFormSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
      phone: "",
      address: "",
    },
  });

  const doctorForm = useForm<DoctorFormData>({
    resolver: zodResolver(doctorFormSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
      phone: "",
      address: "",
      bio: "",
      specialty: "",
      licenseNumber: "",
    },
  });

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      displayName: "",
      photoURL: "",
      phone: "",
      address: "",
      bloodType: "",
      allergies: "",
      medicalHistory: "",
      emergencyContactName: "",
      emergencyContactPhone: "",
      emergencyContactRelation: "",
    },
  });

  // Efecto para inicializar formularios
  useEffect(() => {
    if (user) {
      if (user.role === "DOCTOR") {
        doctorForm.reset({
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          phone: user.phone || "",
          address: user.address || "",
          bio: user.bio || "",
          specialty: user.specialty || "",
          licenseNumber: user.licenseNumber || "",
        });
      } else if (user.role === "PATIENT") {
        patientForm.reset({
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          phone: user.phone || "",
          address: user.address || "",
          bloodType: user.bloodType || "",
          allergies: user.allergies?.join(", ") || "",
          medicalHistory: user.medicalHistory || "",
          emergencyContactName: user.emergencyContact?.name || "",
          emergencyContactPhone: user.emergencyContact?.phone || "",
          emergencyContactRelation: user.emergencyContact?.relation || "",
        });
      } else {
        generalForm.reset({
          displayName: user.displayName || "",
          photoURL: user.photoURL || "",
          phone: user.phone || "",
          address: user.address || "",
        });
      }
    }
  }, [user, generalForm, doctorForm, patientForm]);

  // Función de envío de formulario
  const onSubmit = async (
    data: CommonFormData | DoctorFormData | PatientFormData
  ) => {
    if (!user) return;
    setIsLoading(true);
    try {
      await updateUserProfile(user.uid, data);
      if (user.role === "DOCTOR") {
        await updateDoctorProfile(user.uid, data as DoctorFormData);
      } else if (user.role === "PATIENT") {
        const patientData = data as PatientFormData;
        await updatePatientProfile(user.uid, {
          ...patientData,
          allergies:
            patientData.allergies?.split(",").map((a: string) => a.trim()) ||
            [],
          emergencyContact: {
            name: patientData.emergencyContactName,
            phone: patientData.emergencyContactPhone,
            relation: patientData.emergencyContactRelation,
          },
        });
      }
      toast.success("Perfil actualizado con éxito");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error al actualizar el perfil");
    } finally {
      setIsLoading(false);
    }
  };

  // Selección del formulario actual
  const currentForm: UseFormReturn<
    CommonFormData | DoctorFormData | PatientFormData
  > =
    user?.role === "DOCTOR"
      ? doctorForm
      : user?.role === "PATIENT"
      ? patientForm
      : generalForm;

  return (
    <div className="container mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Mi Perfil</h1>
        <p className="text-muted-foreground">
          Administra tu información personal y configuración de la cuenta
        </p>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Información de Perfil</CardTitle>
            <CardDescription>
              Actualiza tu información personal y detalles de contacto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...currentForm}>
              <form
                onSubmit={currentForm.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  name="displayName"
                  control={currentForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre completo</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="phone"
                  control={currentForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Teléfono</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="address"
                  control={currentForm.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.role === "DOCTOR" && (
                  <>
                    <FormField
                      name="specialty"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especialidad</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="licenseNumber"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de licencia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="bio"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Biografía</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {user?.role === "PATIENT" && (
                  <>
                    <FormField
                      name="bloodType"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo de sangre</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="allergies"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alergias</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="medicalHistory"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Historial Médico</FormLabel>
                          <FormControl>
                            <Textarea {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="emergencyContactName"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre contacto de emergencia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="emergencyContactPhone"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de emergencia</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      name="emergencyContactRelation"
                      control={currentForm.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relación</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Guardar cambios
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
