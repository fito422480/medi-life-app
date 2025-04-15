// src/lib/types.ts
import { Timestamp } from "firebase/firestore";

// Tipos de roles para usuarios
export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

// Interfaz básica de usuario
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  phone?: string;
  address?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Interfaz para doctores
export interface Doctor extends User {
  role: "DOCTOR";
  specialty: string;
  licenseNumber: string;
  bio?: string;
  availability?: {
    [day: string]: { start: string; end: string }[];
  };
  rating?: number;
  reviewCount?: number;
}

// Interfaz para pacientes
export interface Patient {
  uid: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role: string;
  gender?: "MALE" | "FEMALE" | "OTHER";
  dateOfBirth?: string | Date | Timestamp | null; // Añadir Timestamp si usas Firestore
  bloodType?: string;
  allergies?: string[]; // Allow additional properties
}

// Estados posibles de una cita
export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "MISSED";

// Mapeo de estados a nombres legibles para el usuario
export const appointmentStatusNames: Record<AppointmentStatus, string> = {
  SCHEDULED: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  MISSED: "No asistió",
};

// Mapeo de estados a colores de interfaz
export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
  MISSED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

// Interfaz para citas médicas
export interface Appointment {
  id?: string;
  doctorId: string;
  patientId: string;
  date: Timestamp | Date;
  duration: number; // duración en minutos
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  followUp?: Timestamp | Date;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;

  // Campos adicionales para UI
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
  startTime?: string;
  endTime?: string;
}

// Interfaz para medicaciones
export interface Medication {
  id?: string;
  patientId: string;
  appointmentId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date;
  instructions?: string;
  sideEffects?: string[];
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Interfaz para disponibilidad de horarios
export interface TimeSlot {
  start: string; // formato HH:MM
  end: string; // formato HH:MM
  available: boolean;
}

export interface DaySchedule {
  date: string; // formato YYYY-MM-DD
  slots: TimeSlot[];
}

// Interfaz para revisiones/valoraciones
export interface Review {
  id?: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt?: Timestamp;
}

// Interfaz para notificaciones
export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: "APPOINTMENT" | "REMINDER" | "SYSTEM";
  read: boolean;
  relatedId?: string; // ID relacionado (por ejemplo, ID de cita)
  createdAt: Timestamp;
}
