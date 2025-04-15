// src/lib/appointment-status.ts
// Este archivo define constantes y utilidades para los estados de citas
// sin depender del tipo AppointmentStatus para evitar problemas de tipo

// Constantes para los estados posibles
export const APPOINTMENT_STATUS = {
  SCHEDULED: "SCHEDULED",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
  MISSED: "MISSED",
} as const;

// Mapeo de estados a nombres legibles para el usuario
export const appointmentStatusNames = {
  [APPOINTMENT_STATUS.SCHEDULED]: "Pendiente",
  [APPOINTMENT_STATUS.CONFIRMED]: "Confirmada",
  [APPOINTMENT_STATUS.COMPLETED]: "Completada",
  [APPOINTMENT_STATUS.CANCELLED]: "Cancelada",
  [APPOINTMENT_STATUS.MISSED]: "No asistió",
};

// Mapeo de estados a colores de interfaz
export const appointmentStatusColors = {
  [APPOINTMENT_STATUS.SCHEDULED]:
    "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  [APPOINTMENT_STATUS.CONFIRMED]:
    "bg-green-100 text-green-800 hover:bg-green-200",
  [APPOINTMENT_STATUS.COMPLETED]: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  [APPOINTMENT_STATUS.CANCELLED]: "bg-red-100 text-red-800 hover:bg-red-200",
  [APPOINTMENT_STATUS.MISSED]: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

// Función auxiliar para obtener un Badge según el estado
export const getStatusStyle = (status: string): string => {
  return (
    appointmentStatusColors[status as keyof typeof appointmentStatusColors] ||
    "bg-gray-100 text-gray-800 hover:bg-gray-200"
  );
};

// Función auxiliar para obtener una etiqueta legible según el estado
export const getStatusLabel = (status: string): string => {
  return (
    appointmentStatusNames[status as keyof typeof appointmentStatusNames] ||
    status
  );
};

// Función para verificar si un estado está pendiente o confirmado
export const isUpcomingAppointment = (status: string): boolean => {
  return (
    status === APPOINTMENT_STATUS.SCHEDULED ||
    status === APPOINTMENT_STATUS.CONFIRMED
  );
};

// Función para verificar si un estado está completado
export const isCompletedAppointment = (status: string): boolean => {
  return status === APPOINTMENT_STATUS.COMPLETED;
};

// Función para verificar si un estado está cancelado o no asistido
export const isCancelledAppointment = (status: string): boolean => {
  return (
    status === APPOINTMENT_STATUS.CANCELLED ||
    status === APPOINTMENT_STATUS.MISSED
  );
};
