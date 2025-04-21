import { z } from "zod";

// ─────────────────────────────────────────────────────────────
// ENUMS ───────────────────────────────────────────────────────

export const UserRoleEnum = z.enum(["ADMIN", "DOCTOR", "PATIENT"]);
export const GenderEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

export const SpecialtyEnum = z.enum([
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Neurology",
  // extendible
]);

export const AppointmentStatusEnum = z.enum([
  "SCHEDULED",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
  "MISSED",
]);

export const NotificationTypeEnum = z.enum([
  "APPOINTMENT",
  "REMINDER",
  "SYSTEM",
]);

// ─────────────────────────────────────────────────────────────
// USUARIO ─────────────────────────────────────────────────────

export const UserSchema = z.object({
  uid: z.string(),
  email: z.string().email().nullable(),
  displayName: z.string().nullable(),
  photoURL: z.string().url().nullable(),
  role: UserRoleEnum.optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ─────────────────────────────────────────────────────────────
// DOCTOR Y PACIENTE ───────────────────────────────────────────

export const DoctorSchema = UserSchema.extend({
  role: z.literal("DOCTOR"),
  specialty: SpecialtyEnum,
  licenseNumber: z.string(),
  bio: z.string().optional(),
  availability: z
    .record(
      z.string(),
      z.array(
        z.object({
          start: z.string(),
          end: z.string(),
        })
      )
    )
    .optional(),
  rating: z.number().optional(),
  reviewCount: z.number().optional(),
});

export const PatientSchema = UserSchema.extend({
  role: z.literal("PATIENT"),
  gender: GenderEnum.optional(),
  dateOfBirth: z
    .union([
      z.string(),
      z.date(),
      z.null(),
      z.any(), // Firestore Timestamp fallback
    ])
    .optional(),
  bloodType: z.string().optional(),
  allergies: z.array(z.string()).optional(),
});

// ─────────────────────────────────────────────────────────────
// CITA MÉDICA ─────────────────────────────────────────────────

export const AppointmentSchema = z.object({
  id: z.string().optional(),
  doctorId: z.string(),
  patientId: z.string(),
  date: z.union([z.date(), z.any()]),
  duration: z.number(),
  reason: z.string(),
  status: AppointmentStatusEnum,
  notes: z.string().optional(),
  diagnosis: z.string().optional(),
  treatment: z.string().optional(),
  followUp: z.union([z.date(), z.any()]).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),

  // Para UI
  doctorName: z.string().optional(),
  doctorSpecialty: z.string().optional(),
  patientName: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});

// ─────────────────────────────────────────────────────────────
// MEDICACIÓN ──────────────────────────────────────────────────

export const MedicationSchema = z.object({
  id: z.string().optional(),
  patientId: z.string(),
  appointmentId: z.string(),
  name: z.string(),
  dosage: z.string(),
  frequency: z.string(),
  startDate: z.union([z.date(), z.any()]),
  endDate: z.union([z.date(), z.any()]).optional(),
  instructions: z.string().optional(),
  sideEffects: z.array(z.string()).optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

// ─────────────────────────────────────────────────────────────
// DISPONIBILIDAD ──────────────────────────────────────────────

export const TimeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
  available: z.boolean(),
});

export const DayScheduleSchema = z.object({
  date: z.string(),
  slots: z.array(TimeSlotSchema),
});

// ─────────────────────────────────────────────────────────────
// RESEÑA ──────────────────────────────────────────────────────

export const ReviewSchema = z.object({
  id: z.string().optional(),
  doctorId: z.string(),
  patientId: z.string(),
  appointmentId: z.string(),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
  createdAt: z.any(),
});

// ─────────────────────────────────────────────────────────────
// NOTIFICACIÓN ────────────────────────────────────────────────

export const NotificationSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  title: z.string(),
  message: z.string(),
  type: NotificationTypeEnum,
  read: z.boolean(),
  relatedId: z.string().optional(),
  createdAt: z.any(),
});
