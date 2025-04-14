"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { getDoctorProfile, getPatientProfile } from "@/lib/firebase/db";
import { AppointmentCalendar } from "@/components/calendar/appointment-calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarPlus, CalendarDays, CheckCircle } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [doctorId, setDoctorId] = useState<string | undefined>(
    searchParams.get("doctorId") || undefined
  );
  const [patientId, setPatientId] = useState<string | undefined>(
    searchParams.get("appointmentId") || undefined
  );
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // If we have a doctorId but we are a doctor, we don't need to fetch the doctor profile
        if (doctorId && user?.role !== "DOCTOR") {
          const doctor = await getDoctorProfile(doctorId);
          setSelectedDoctor(doctor);
        } else if (user?.role === "DOCTOR") {
          // If we are a doctor, we are the selected doctor
          setDoctorId(user.uid);
          setSelectedDoctor(user);
        }

        // If we have a patientId but we are a patient, we don't need to fetch the patient profile
        if (patientId && user?.role !== "PATIENT") {
          const patient = await getPatientProfile(patientId);
          setSelectedPatient(patient);
        } else if (user?.role === "PATIENT") {
          // If we are a patient, we are the selected patient
          setPatientId(user.uid);
          setSelectedPatient(user);
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [doctorId, patientId, user]);

  return (
    <ProtectedRoute>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Calendario de Citas
            </h1>
            <p className="text-muted-foreground">
              {user?.role === "DOCTOR"
                ? "Gestiona tu agenda y citas con pacientes"
                : "Programa y gestiona tus citas médicas"}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <>
              {/* Selected Doctor/Patient Information */}
              {user?.role === "PATIENT" && selectedDoctor && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Médico Seleccionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {selectedDoctor.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedDoctor.specialty}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDoctorId(undefined)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {user?.role === "DOCTOR" && selectedPatient && (
                <Card className="bg-blue-50 border-blue-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center">
                      <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                      Paciente Seleccionado
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {selectedPatient.displayName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selectedPatient.email}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPatientId(undefined)}
                      >
                        Cambiar
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Calendar Component */}
              <AppointmentCalendar doctorId={doctorId} patientId={patientId} />
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
