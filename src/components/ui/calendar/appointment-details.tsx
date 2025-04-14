// src/components/calendar/appointment-details.tsx
"use client";

import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { 
  Appointment, 
  AppointmentStatus, 
  Medication 
} from "@/lib/types";
import { useAuth } from "@/lib/hooks/use-auth";
import { updateAppointment, cancelAppointment } from "@/lib/firebase/db";
import { Loader2 } from "lucide-react";

interface AppointmentDetailsProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AppointmentDetails({ 
  appointment, 
  isOpen, 
  onClose 
}: AppointmentDetailsProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [appointmentData, setAppointmentData] = useState<Partial<Appointment>>({});
  const [medications, setMedications] = useState<Medication[]>([]);
  const [newMedication, setNewMedication] = useState<Partial<Medication>>({
    name: "",
    dosage: "",
    frequency: "",
    instructions: ""
  });
  
  // Status badge colors
  const getStatusBadge = (status: AppointmentStatus) => {
    const statusConfig = {
      PENDING: { label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      CONFIRMED: { label: "Confirmada", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      COMPLETED: { label: "Completada", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      CANCELLED: { label: "Cancelada", className: "bg-red-100 text-red-800 hover:bg-red-200" },
      NO_SHOW: { label: "No Asistió", className: "bg-gray-100 text-gray-800 hover:bg-gray-200" }
    };
    
    const config = statusConfig[status];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };
  
  // Format date for display
  const formatAppointmentDate = (date: Date) => {
    return format(date, "EEEE d 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es });
  };
  
  // Handle status change
  const handleStatusChange = async (status: AppointmentStatus) => {
    if (!appointment) return;
    
    setIsLoading(true);
    try {
      await updateAppointment(appointment.id, { status });
      setAppointmentData({ ...appointmentData, status });
      // Close dialog on success or provide feedback
    } catch (error) {
      console.error("Error updating appointment status:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment update
  const handleUpdateAppointment = async () => {
    if (!appointment) return;
    
    setIsLoading(true);
    try {
      await updateAppointment(appointment.id, appointmentData);
      // Close dialog on success or provide feedback
      onClose();
    } catch (error) {
      console.error("Error updating appointment:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle appointment cancellation
  const handleCancelAppointment = async () => {
    if (!appointment) return;
    
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
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle adding a new medication
  const handleAddMedication = async () => {
    // Implementation for adding a medication
  };
  
  // Reset form state when dialog opens/closes
  React.useEffect(() => {
    if (isOpen && appointment) {
      setAppointmentData({
        status: appointment.status,
        notes: appointment.notes || "",
        diagnosis: appointment.diagnosis || ""
      });
      // Fetch medications for this appointment
      // setMedications(...);
    }
  }, [isOpen, appointment]);
  
  if (!appointment) return null;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">Detalles de la Cita</DialogTitle>
          <DialogDescription>
            {formatAppointmentDate(appointment.date instanceof Date ? 
              appointment.date : new Date(appointment.date))}
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="details">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="medical">Información Médica</TabsTrigger>
            <TabsTrigger value="medications">Medicamentos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Paciente</Label>
                <p className="font-medium">{appointment.patientName}</p>
              </div>
              <div>
                <Label>Doctor</Label>
                <p className="font-medium">{appointment.doctorName}</p>
              </div>
              <div>
                <Label>Especialidad</Label>
                <p>{appointment.doctorSpecialty}</p>
              </div>
              <div>
                <Label>Estado</Label>
                <div className="flex items-center mt-1">
                  {user?.role === "DOCTOR" ? (
                    <Select 
                      defaultValue={appointment.status}
                      onValueChange={(value) => 
                        setAppointmentData({...appointmentData, status: value as AppointmentStatus})
                      }
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendiente</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                        <SelectItem value="COMPLETED">Completada</SelectItem>
                        <SelectItem value="CANCELLED">Cancelada</SelectItem>
                        <SelectItem value="NO_SHOW">No Asistió</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    getStatusBadge(appointment.status)
                  )}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Motivo de la consulta</Label>
              <p className="mt-1">{appointment.reason}</p>
            </div>
          </TabsContent>
          
          <TabsContent value="medical" className="space-y-4">
            <div>
              <Label htmlFor="notes">Notas de la consulta</Label>
              {user?.role === "DOCTOR" ? (
                <Textarea
                  id="notes"
                  placeholder="Añadir notas de la consulta..."
                  className="mt-1"
                  value={appointmentData.notes || ""}
                  onChange={(e) => 
                    setAppointmentData({...appointmentData, notes: e.target.value})
                  }
                  disabled={isLoading}
                />
              ) : (
                <p className="mt-1">{appointment.notes || "No hay notas disponibles."}</p>
              )}
            </div>
            
            <div>
              <Label htmlFor="diagnosis">Diagnóstico</Label>
              {user?.role === "DOCTOR" ? (
                <Textarea
                  id="diagnosis"
                  placeholder="Añadir diagnóstico..."
                  className="mt-1"
                  value={appointmentData.diagnosis || ""}
                  onChange={(e) => 
                    setAppointmentData({...appointmentData, diagnosis: e.target.value})
                  }
                  disabled={isLoading}
                />
              ) : (
                <p className="mt-1">{appointment.diagnosis || "No hay diagnóstico disponible."}</p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="medications" className="space-y-4">
            {user?.role === "DOCTOR" && (
              <div className="border rounded-md p-4 space-y-4">
                <h3 className="font-medium">Añadir Medicamento</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="med-name">Nombre del medicamento</Label>
                    <Input 
                      id="med-name" 
                      placeholder="Ej: Paracetamol" 
                      value={newMedication.name} 
                      onChange={(e) => 
                        setNewMedication({...newMedication, name: e.target.value})
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="med-dosage">Dosis</Label>
                    <Input 
                      id="med-dosage" 
                      placeholder="Ej: 500mg" 
                      value={newMedication.dosage} 
                      onChange={(e) => 
                        setNewMedication({...newMedication, dosage: e.target.value})
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="med-frequency">Frecuencia</Label>
                    <Input 
                      id="med-frequency" 
                      placeholder="Ej: Cada 8 horas" 
                      value={newMedication.frequency} 
                      onChange={(e) => 
                        setNewMedication({...newMedication, frequency: e.target.value})
                      }
                    />
                  </div>
                  <div>
                  <Label htmlFor="med-instructions">Instrucciones</Label>
                    <Input 
                      id="med-instructions" 
                      placeholder="Ej: Tomar después de las comidas" 
                      value={newMedication.instructions} 
                      onChange={(e) => 
                        setNewMedication({...newMedication, instructions: e.target.value})
                      }
                    />
                  </div>
                </div>
                <Button 
                  onClick={handleAddMedication}
                  disabled={
                    isLoading || 
                    !newMedication.name || 
                    !newMedication.dosage || 
                    !newMedication.frequency
                  }
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Añadiendo...
                    </>
                  ) : "Añadir Medicamento"}
                </Button>
              </div>
            )}
            
            {medications.length > 0 ? (
              <div className="space-y-2">
                <h3 className="font-medium">Medicamentos Recetados</h3>
                {medications.map((med) => (
                  <div key={med.id} className="border rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{med.name} - {med.dosage}</p>
                        <p className="text-sm text-muted-foreground">{med.frequency}</p>
                        {med.instructions && (
                          <p className="text-sm mt-1">{med.instructions}</p>
                        )}
                      </div>
                      {user?.role === "DOCTOR" && (
                        <Button variant="ghost" size="sm">
                          Eliminar
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No hay medicamentos recetados para esta cita.
              </div>
            )}
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
              ) : "Cancelar Cita"}
            </Button>
          )}
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Cerrar
            </Button>
            
            {user?.role === "DOCTOR" && (
              <Button 
                onClick={handleUpdateAppointment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}