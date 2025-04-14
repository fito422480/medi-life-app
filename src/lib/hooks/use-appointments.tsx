// src/lib/hooks/use-appointments.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "./use-auth";
import {
  getDoctorAppointments,
  getPatientAppointments,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from "@/lib/firebase/db";
import { Appointment, AppointmentStatus } from "@/lib/types";

interface UseAppointmentsProps {
  doctorId?: string;
  patientId?: string;
  startDate?: Date;
  endDate?: Date;
}

export function useAppointments(props?: UseAppointmentsProps) {
  const { doctorId, patientId, startDate, endDate } = props || {};
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let fetchedAppointments: Appointment[] = [];

        // If specific doctorId is provided, fetch appointments for that doctor
        if (doctorId) {
          fetchedAppointments = await getDoctorAppointments(
            doctorId,
            startDate,
            endDate
          );
        }
        // If specific patientId is provided, fetch appointments for that patient
        else if (patientId) {
          fetchedAppointments = await getPatientAppointments(patientId);
        }
        // Otherwise, fetch based on the logged-in user's role
        else if (user.role === "DOCTOR") {
          fetchedAppointments = await getDoctorAppointments(
            user.uid,
            startDate,
            endDate
          );
        } else if (user.role === "PATIENT") {
          fetchedAppointments = await getPatientAppointments(user.uid);
        }

        // Sort appointments by date (most recent first)
        fetchedAppointments.sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setAppointments(fetchedAppointments);
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Error al cargar las citas. Por favor, intente nuevamente.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user, doctorId, patientId, startDate, endDate]);

  const addAppointment = async (appointmentData: Partial<Appointment>) => {
    setIsLoading(true);
    setError(null);

    try {
      const appointmentId = await createAppointment(appointmentData);

      // Refetch appointments to update the list
      if (user?.role === "DOCTOR") {
        const updatedAppointments = await getDoctorAppointments(
          user.uid,
          startDate,
          endDate
        );
        setAppointments(updatedAppointments);
      } else if (user?.role === "PATIENT") {
        const updatedAppointments = await getPatientAppointments(user.uid);
        setAppointments(updatedAppointments);
      }

      return appointmentId;
    } catch (err) {
      console.error("Error creating appointment:", err);
      setError("Error al crear la cita. Por favor, intente nuevamente.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: AppointmentStatus
  ) => {
    setIsLoading(true);
    setError(null);

    try {
      await updateAppointment(appointmentId, { status });

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointmentId ? { ...apt, status } : apt
        )
      );

      return true;
    } catch (err) {
      console.error("Error updating appointment status:", err);
      setError(
        "Error al actualizar el estado de la cita. Por favor, intente nuevamente."
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelUserAppointment = async (appointmentId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await cancelAppointment(appointmentId);

      // Update local state
      setAppointments((prevAppointments) =>
        prevAppointments.map((apt) =>
          apt.id === appointmentId
            ? { ...apt, status: "CANCELLED" as AppointmentStatus }
            : apt
        )
      );

      return true;
    } catch (err) {
      console.error("Error cancelling appointment:", err);
      setError("Error al cancelar la cita. Por favor, intente nuevamente.");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    appointments,
    isLoading,
    error,
    addAppointment,
    updateAppointmentStatus,
    cancelAppointment: cancelUserAppointment,
  };
}
