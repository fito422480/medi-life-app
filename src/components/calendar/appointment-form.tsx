// src/components/calendar/appointment-form.tsx
"use client";

import { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Loader2, Calendar as CalendarIcon } from "lucide-react";
import { createAppointment } from "@/lib/firebase/db";
import { useAuth } from "@/lib/hooks/use-auth";
import { Doctor, Patient } from "@/lib/types";

interface AppointmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
  initialHour?: number;
  initialMinute?: number;
  doctorId?: string;
  patientId?: string;
}

export function AppointmentForm({
  isOpen,
  onClose,
  initialDate,
  initialHour,
  initialMinute,
  doctorId: initialDoctorId,
  patientId: initialPatientId
}: AppointmentFormProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [selectedHour, setSelectedHour] = useState<number | undefined>(initialHour);
  const [selectedMinute, setSelectedMinute] = useState<number | undefined>(initialMinute);
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialDoctorId || "");
  const [selectedPatient, setSelectedPatient] = useState<string>(initialPatientId || "");
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>("");
  const [reason, setReason] = useState<string>("");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<{hour: number, minute: number}[]>([]);
  
  // Specialties list
  const specialties = [
    "Todas",
    "Medicina General",
    "Psiquiatría",
    "Psicología",
    "Neurología",
    "Cardiología",
    "Dermatología",
    "Pediatría",
    "Ginecología",
    "Traumatología"
  ];
  
  // Time slots for selection
  const hours = Array.from({ length: 13 }, (_, i) => i + 8);
  const minutes = [0, 30];
  
  // Fetch doctors and patients on load
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
  const filteredDoctors = selectedSpecialty && selectedSpecialty !== "Todas"
    ? doctors.filter(doc => doc.specialty === selectedSpecialty)
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
        for (const hour of hours) {
          for (const minute of minutes) {
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
  
  // Handle form submission
  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedPatient || !selectedDate || 
        selectedHour === undefined || selectedMinute === undefined || !reason) {
      // Show validation error
      alert("Por favor complete todos los campos requeridos");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format time
      const startTime = `${selectedHour.toString().padStart(2, "0")}:${selectedMinute.toString().padStart(2, "0")}`;
      const endTime = calculateEndTime(selectedHour, selectedMinute);
      
      // Get names
      const doctorName = doctors.find(d => d.uid === selectedDoctor)?.displayName || "";
      const doctorSpecialty = doctors.find(d => d.uid === selectedDoctor)?.specialty || "";
      const patientName = patients.find(p => p.uid === selectedPatient)?.displayName || "";
      
      // Create appointment
      await createAppointment({
        patientId: selectedPatient,
        doctorId: selectedDoctor,
        patientName,
        doctorName, 
        doctorSpecialty,
        date: selectedDate,
        startTime,
        endTime,
        status: "PENDING",
        reason,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      // Close form on success
      onClose();
      
      // Show success message or refresh calendar
    } catch (error) {
      console.error("Error creating appointment:", error);
      // Show error message
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate end time (30 minutes after start time)
  const calculateEndTime = (hour: number, minute: number): string => {
    if (minute === 30) {
      return `${(hour + 1).toString().padStart(2, "0")}:00`;
    } else {
      return `${hour.toString().padStart(2, "0")}:30`;
    }
  };
  
  // Reset form state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      if (!initialDate) setSelectedDate(undefined);
      if (initialHour === undefined) setSelectedHour(undefined);
      if (initialMinute === undefined) setSelectedMinute(undefined);
      if (!initialDoctorId && user?.role !== "DOCTOR") setSelectedDoctor("");
      if (!initialPatientId && user?.role !== "PATIENT") setSelectedPatient("");
      setSelectedSpecialty("");
      setReason("");
    }
  }, [isOpen, initialDate, initialHour, initialMinute, initialDoctorId, initialPatientId, user]);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Agendar Nueva Cita</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {user?.role !== "DOCTOR" && (
            <>
              <div>
                <Label htmlFor="specialty">Especialidad</Label>
                <Select
                  value={selectedSpecialty}
                  onValueChange={setSelectedSpecialty}
                >
                  <SelectTrigger id="specialty">
                    <SelectValue placeholder="Selecciona una especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="doctor">Médico</Label>
                <Select
                  value={selectedDoctor}
                  onValueChange={setSelectedDoctor}
                  disabled={user?.role === "DOCTOR"}
                >
                  <SelectTrigger id="doctor">
                    <SelectValue placeholder="Selecciona un médico" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.uid} value={doctor.uid}>
                        {doctor.displayName} - {doctor.specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
          
          {user?.role !== "PATIENT" && (
            <div>
              <Label htmlFor="patient">Paciente</Label>
              <Select
                value={selectedPatient}
                onValueChange={setSelectedPatient}
                disabled={user?.role === "PATIENT"}
              >
                <SelectTrigger id="patient">
                  <SelectValue placeholder="Selecciona un paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.uid} value={patient.uid}>
                      {patient.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          <div>
            <Label>Fecha</Label>
            <div className="border rounded-md p-3 mt-1">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  // Disable past dates and weekends
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const day = date.getDay();
                  return date < today || day === 0 || day === 6;
                }}
                initialFocus
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="time">Hora</Label>
            <div className="grid grid-cols-4 gap-2 mt-1">
              {availableTimeSlots.map(({ hour, minute }) => (
                <Button
                  key={`${hour}-${minute}`}
                  type="button"
                  variant={selectedHour === hour && selectedMinute === minute ? "default" : "outline"}
                  onClick={() => {
                    setSelectedHour(hour);
                    setSelectedMinute(minute);
                  }}
                  className="text-sm"
                >
                  {hour.toString().padStart(2, "0")}:{minute.toString().padStart(2, "0")}
                </Button>
              ))}
            </div>
          </div>
          
          <div>
            <Label htmlFor="reason">Motivo de la consulta</Label>
            <Textarea
              id="reason"
              placeholder="Describa brevemente el motivo de su consulta"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !selectedDoctor || 
              !selectedPatient || 
              !selectedDate || 
              selectedHour === undefined || 
              selectedMinute === undefined || 
              !reason
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : "Agendar Cita"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}