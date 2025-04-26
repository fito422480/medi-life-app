// src/lib/types.ts

import { Timestamp } from "firebase/firestore";

// ─────────────────────────────────────────────────────────────
// ENUMS Y TYPES ───────────────────────────────────────────────

export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";
export type Gender = "MALE" | "FEMALE" | "OTHER";

// Especialidades médicas comunes (puedes extenderlo)
export enum Specialty {
  GENERAL = "General Medicine",
  CARDIOLOGY = "Cardiology",
  DERMATOLOGY = "Dermatology",
  PEDIATRICS = "Pediatrics",
  NEUROLOGY = "Neurology",
  PSYCHIATRY = "Psychiatry",
  PSYCHOLOGY = "Psychology",
  GYNECOLOGY = "Gynecology",
  ORTHOPEDICS = "Orthopedics",
}

// Tipo utilitario para fechas (puedes cambiar si lo necesitás más flexible)
export type FirestoreDate = Timestamp;

// ─────────────────────────────────────────────────────────────
// USUARIOS ─────────────────────────────────────────────────────

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: UserRole;
  phone?: string;
  address?: string;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

// DOCTOR
export interface Doctor extends User {
  role: "DOCTOR";
  specialty: Specialty;
  licenseNumber: string;
  bio?: string;
  availability?: {
    [day: string]: { start: string; end: string }[];
  };
  rating?: number;
  reviewCount?: number;
}

// PACIENTE
export interface Patient extends User {
  role: "PATIENT";
  gender?: Gender;
  dateOfBirth?: string | Date | FirebaseFirestore.Timestamp | null;
  bloodType?: string;
  allergies?: string[];
}

// ─────────────────────────────────────────────────────────────
// CITAS MÉDICAS ────────────────────────────────────────────────

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "MISSED";

  export const appointmentStatusNames: Record<AppointmentStatus, string> = {
    SCHEDULED: "Pendiente",
    CONFIRMED: "Confirmada",
    COMPLETED: "Completada",
    CANCELLED: "Cancelada",
    MISSED: "No asistió",
    RESCHEDULED: "Reprogramada"
  };

export const appointmentStatusColors: Record<AppointmentStatus, string> = {
  SCHEDULED: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
  MISSED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
  RESCHEDULED: "bg-orange-100 text-orange-800 hover:bg-orange-200"
};

export interface Appointment {
  id?: string;
  doctorId: string;
  patientId: string;
  date: FirestoreDate | Date;
  duration: number; // minutos
  reason: string;
  status: AppointmentStatus;
  notes?: string;
  diagnosis?: string;
  treatment?: string;
  followUp?: FirestoreDate | Date;
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;

  // Para UI
  doctorName?: string;
  doctorSpecialty?: string;
  patientName?: string;
  startTime?: string;
  endTime?: string;
}

// ─────────────────────────────────────────────────────────────
// MEDICACIONES ────────────────────────────────────────────────

export interface Medication {
  id?: string;
  patientId: string;
  appointmentId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: FirestoreDate | Date;
  endDate?: FirestoreDate | Date;
  instructions?: string;
  sideEffects?: string[];
  createdAt?: FirestoreDate;
  updatedAt?: FirestoreDate;
}

// ─────────────────────────────────────────────────────────────
// DISPONIBILIDAD DE HORARIOS ─────────────────────────────────

export interface TimeSlot {
  start: string; // HH:MM
  end: string; // HH:MM
  available: boolean;
}

export interface DaySchedule {
  date: string; // YYYY-MM-DD
  slots: TimeSlot[];
}

// ─────────────────────────────────────────────────────────────
// RESEÑAS ─────────────────────────────────────────────────────

export interface Review {
  id?: string;
  doctorId: string;
  patientId: string;
  appointmentId: string;
  rating: number; // 1-5
  comment?: string;
  createdAt?: FirestoreDate;
}

// ─────────────────────────────────────────────────────────────
// NOTIFICACIONES ──────────────────────────────────────────────

export type NotificationType = "APPOINTMENT" | "REMINDER" | "SYSTEM";

export interface Notification {
  id?: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  relatedId?: string;
  createdAt: FirestoreDate;
}
