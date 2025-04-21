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

export type Doctor = User & {
  role: "DOCTOR";
  specialty: string;
  licenseNumber: string;
};

export type Patient = User & {
  role: "PATIENT";
  bloodType?: string;
  allergies?: string[];
  medicalHistory?: string;
  emergencyContact?: EmergencyContact;
};

export interface Appointment {
  id: string;
  date: Date | string;
  time?: string; // <--- Agrega esta línea
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "COMPLETED"
    | "RESCHEDULED"
    | "CANCELLED"
    | "MISSED";
  reason: string;
  patientId?: string;
  patientName?: string;
  doctorId?: string;
  doctorName?: string;
  // ...otras propiedades...
}

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
