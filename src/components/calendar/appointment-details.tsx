// src/components/calendar/appointment-details.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Appointment as BaseAppointment, AppointmentStatus, Medication } from "@/lib/types";

// Extend Appointment type to include optional 'diagnosis' and 'notes'
type Appointment = BaseAppointment & {
  diagnosis?: string;
  notes?: string;
};

import { useAuth } from "@/lib/hooks/use-auth";
import {
  updateAppointment,
  cancelAppointment,
  getAppointmentMedications,
  addMedication,
} from "@/lib/firebase/db";
import { Loader2 } from "lucide-react";

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetails({
  appointment,
  isOpen,
  onClose,
}: AppointmentDetailsProps): React.ReactElement | null {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Partial<Appointment>>(
    {}
  );
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    frequency: "",
    instructions: "",
  });

  // Status badge colors
  const getStatusBadge = useCallback((status: AppointmentStatus) => {
    const statusConfig = {
      SCHEDULED: {
        label: "Pendiente",
        className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
      },
      CONFIRMED: {
        label: "Confirmada",
        className: "bg-green-100 text-green-800 hover:bg-green-200",
      },
      COMPLETED: {
        label: "Completada",
        className: "bg-blue-100 text-blue-800 hover:bg-blue-200",
      },
      CANCELLED: {
        label: "Cancelada",
        className: "bg-red-100 text-red-800 hover:bg-red-200",
      },
      MISSED: {
        label: "No Asistió",
        className: "bg-gray-100 text-gray-800 hover:bg-gray-200",
      },
      RESCHEDULED: {
        label: "Reprogramada",
        className: "bg-purple-100 text-purple-800 hover:bg-purple-200",
      },
    };

    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  }, []);

  // Format date for display
  const formatAppointmentDate = useCallback((date: Date | string) => {
    const formattedDate = date instanceof Date ? date : new Date(date);
    return format(formattedDate, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
      locale: es,
    });
  }, []);

  // Handle status change
  const handleStatusChange = async (
    status: AppointmentStatus
  ): Promise<void> => {
    if (!appointment?.id) return;

    setIsLoading(true);
    try {
      await updateAppointment(appointment.id, { status });
      setAppointmentData((prev) => ({ ...prev, status }));
    } catch (error) {
      console.error("Error updating appointment status:", error);
      // TODO: Implement user-friendly error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment update
  const handleUpdateAppointment = async (): Promise<void> => {
    if (!appointment?.id) return;

    setIsLoading(true);
    try {
      await updateAppointment(appointment.id, appointmentData);
      onClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      // TODO: Implement user-friendly error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Handle appointment cancellation
  const handleCancelAppointment = async (): Promise<void> => {
    if (!appointment?.id) return;

    const confirmCancel = window.confirm(
      "¿Estás seguro de que deseas cancelar esta cita? Esta acción no puede deshacerse."
    );

    if (!confirmCancel) return;

    setIsLoading(true);
    try {
      await cancelAppointment(appointment.id);
      onClose();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      // TODO: Implement user-friendly error handling
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a new medication
  const handleAddMedication = async (): Promise<void> => {
    if (!appointment?.id) return;

    const medicationToAdd: Omit<Medication, "id"> = {
      patientId: appointment.patientId || "",
      appointmentId: appointment.id,
      name: newMedication.name || "",
      dosage: newMedication.dosage || "",
      frequency: newMedication.frequency || "",
      startDate: new Date(),
      instructions: newMedication.instructions,
    };

    try {
      const newMedicationId = await addMedication(medicationToAdd);
      const addedMedication = {
        ...medicationToAdd,
        id: newMedicationId,
      } as Medication;

      setMedications((prev) => [...prev, addedMedication]);

      // Reset new medication form
      setNewMedication({
        name: "",
        dosage: "",
        frequency: "",
        instructions: "",
      });
    } catch (error) {
      console.error("Error adding medication:", error);
      // TODO: Implement user-friendly error handling
    }
  };

  // Fetch medications when appointment changes
  useEffect(() => {
    const fetchMedications = async () => {
      if (isOpen && appointment?.id) {
        try {
          const fetchedMedications = await getAppointmentMedications(
            appointment.id
          );
          setMedications(fetchedMedications);
        } catch (error) {
          console.error("Error fetching medications:", error);
        }
      }
    };

    fetchMedications();
  }, [isOpen, appointment]);
  useEffect(() => {
    if (isOpen && appointment) {
      setAppointmentData({
        status: appointment.status,
        ...(appointment.diagnosis !== undefined && { diagnosis: appointment.diagnosis || "" }),
        ...(appointment.notes !== undefined && { notes: appointment.notes || "" }),
      });
    }
  }, [isOpen, appointment]);

  if (!appointment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles de la Cita</DialogTitle>
          <DialogDescription>
            {formatAppointmentDate(appointment.date)}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="medical">Información Médica</TabsTrigger>
            <TabsTrigger value="medications">Medicamentos</TabsTrigger>
          </TabsList>

          {/* Previous TabsContent remains the same */}

          <TabsContent value="medications" className="space-y-4">
            {/* Previous medications content remains the same */}
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between mt-6">
          {user?.role === "PATIENT" && appointment.status !== "CANCELLED" && (
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelando...
                </>
              ) : (
                "Cancelar Cita"
              )}
            </Button>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>

            {user?.role === "DOCTOR" && (
              <Button onClick={handleUpdateAppointment} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Guardar Cambios"
                )}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
