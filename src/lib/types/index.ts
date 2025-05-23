// src/lib/types/index.ts
export type EmergencyContact = {
  name?: string;
  phone?: string;
  relation?: string;
};

export type User = {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  role?: "PATIENT" | "DOCTOR" | "ADMIN";

  // Common fields
  phone?: string;
  address?: string;

  // Doctor-specific fields
  specialty?: string;
  licenseNumber?: string;
  bio?: string;

  // Patient-specific fields
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: EmergencyContact;
  gender?: "MALE" | "FEMALE" | "OTHER";
  birthDate?: string;

  // Optional metadata
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type Patient = User & {
  role: "PATIENT";
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: EmergencyContact;
  dateOfBirth?: Date | string;
};

export type AppointmentStatus =
  | "SCHEDULED"
  | "CONFIRMED"
  | "COMPLETED"
  | "RESCHEDULED"
  | "CANCELLED"
  | "MISSED";

export type Medication = {
  id?: string;
  patientId: string;
  appointmentId?: string;
  name: string;
  dosage: string;
  frequency: string;
  startDate: Date;
  endDate?: Date;
  instructions?: string;
};

export * from './types';
