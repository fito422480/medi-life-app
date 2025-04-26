// src/components/calendar/appointment-form.tsx
"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Loader2 } from "lucide-react";
import { createAppointment } from "@/lib/firebase/db";
import { useAuth } from "@/lib/hooks/use-auth";
import { Doctor, Patient, AppointmentStatus } from "@/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Timestamp } from "firebase/firestore";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialHour?: number;
  initialMinute?: number;
  doctorId?: string;
  patientId?: string;
}

const formSchema = z.object({
  date: z.date(),
  time: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/, "Hora inválida"),
  reason: z.string().min(1, "Por favor, ingresa un motivo"),
  notes: z.string().optional(),
  doctorId: z.string().optional(),
  patientId: z.string().optional(),
});

export function AppointmentForm({
  isOpen,
  onClose,
  initialDate,
  initialHour,
  initialMinute,
  doctorId: initialDoctorId,
  patientId: initialPatientId,
}: AppointmentFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    initialDate || new Date()
  );
  const [selectedTime, setSelectedTime] = useState<string>(
    `${initialHour || 9}:${initialMinute || 0}`
  );
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(
    initialDoctorId || ""
  );
  const [selectedPatient, setSelectedPatient] = useState<string>(
    initialPatientId || ""
  );
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<
    { hour: number; minute: number }[]
  >([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: selectedDate,
      time: selectedTime,
      reason: "",
      notes: "",
      doctorId: selectedDoctor,
      patientId: selectedPatient,
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setError(null);
      setIsLoading(true);

      if (!selectedDate || !selectedTime) {
        throw new Error("Por favor, seleccione una fecha y hora");
      }

      const appointmentData = {
        date: selectedDate,
        time: selectedTime,
        reason: data.reason,
        notes: data.notes,
        doctorId: selectedDoctor || user?.uid,
        patientId: selectedPatient || user?.uid,
        status: "SCHEDULED" as AppointmentStatus,
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      };

      await createAppointment(appointmentData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la cita");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Load doctors
        // In a real app, this would come from Firebase
        // setDoctors([...]);

        // Load patients if user is a doctor
        if (user?.role === "DOCTOR") {
          // setPatients([...]);
        }

        // Auto-set current user if they're a doctor or patient
        if (user?.role === "DOCTOR" && !initialDoctorId) {
          setSelectedDoctor(user.uid);
        } else if (user?.role === "PATIENT" && !initialPatientId) {
          setSelectedPatient(user.uid);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen, user, initialDoctorId, initialPatientId]);

  // Filter doctors by specialty
  const filteredDoctors =
    selectedSpecialty && selectedSpecialty !== "Todas"
      ? doctors.filter((doc) => doc.specialty === selectedSpecialty)
      : doctors;

  // Fetch available time slots when doctor or date changes
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedDoctor || !selectedDate) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        // In a real app, this would check against doctor's schedule and existing appointments
        // For now, just set all slots available
        const slots = [];
        for (const hour of Array.from({ length: 13 }, (_, i) => i + 8)) {
          for (const minute of Array.from({ length: 60 }, (_, i) => i)) {
            slots.push({ hour, minute });
          }
        }
        setAvailableTimeSlots(slots);
      } catch (error) {
        console.error("Error fetching available time slots:", error);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedDoctor, selectedDate]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Cita</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) =>
                          date < new Date() ||
                          date > new Date(new Date().setFullYear(new Date().getFullYear() + 1))
                        }
                        initialFocus
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora</FormLabel>
                  <FormControl>
                    <Input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Motivo</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Ingrese el motivo de la consulta"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Notas adicionales (opcional)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Cita
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
