// src/lib/types/user.ts
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

  // Optional metadata
  createdAt?: string;
  updatedAt?: string;
};

// Type guard to check user role
export function isDoctor(user: User): user is User & { role: "DOCTOR" } {
  return user.role === "DOCTOR";
}

export function isPatient(user: User): user is User & { role: "PATIENT" } {
  return user.role === "PATIENT";
}
