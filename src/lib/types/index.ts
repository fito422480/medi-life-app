// src/lib/types/index.ts
export type UserRole = "ADMIN" | "DOCTOR" | "PATIENT";

export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export interface Doctor extends User {
  specialty: string;
  licenseNumber: string;
  bio?: string;
  workingHours?: WorkingHours[];
  phone?: string;
  address?: string;
}

export interface Patient extends User {
  dateOfBirth: Date;
  gender: string;
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  phone?: string;
  address?: string;
}

export interface WorkingHours {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
}

export type AppointmentStatus = 
  | "PENDING" 
  | "CONFIRMED" 
  | "COMPLETED" 
  | "CANCELLED" 
  | "NO_SHOW";

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  doctorSpecialty: string;
  date: Date;
  startTime: string; // Format: HH:MM
  endTime: string; // Format: HH:MM
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  diagnosis?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Medication {
  id: string;
  appointmentId: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}