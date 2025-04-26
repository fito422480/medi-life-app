"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { useRouter } from "next/navigation";
import {
  getDoctorProfile,
  getPatientProfile,
  getDoctorAppointments,
  getPatientAppointments,
} from "@/lib/firebase/db";
import { Timestamp } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Users,
  Activity,
  Clock,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Appointment } from "@/lib/types";

interface Profile {
  displayName: string;
  role?: string;
}

interface Stats {
  upcoming: number;
  completed: number;
  cancelled: number;
  total: number;
}

const statusBadgeStyles: Record<string, string> = {
  SCHEDULED: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200",
  CONFIRMED: "bg-green-100 text-green-800 hover:bg-green-200",
  COMPLETED: "bg-blue-100 text-blue-800 hover:bg-blue-200",
  CANCELLED: "bg-red-100 text-red-800 hover:bg-red-200",
  MISSED: "bg-gray-100 text-gray-800 hover:bg-gray-200",
};

const statusBadgeLabels: Record<string, string> = {
  SCHEDULED: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  MISSED: "No asistió",
};

interface UserWithRole {
  uid: string;
  email: string | null;
  emailVerified: boolean;
  displayName: string | null;
  role?: string;
}

export default function DashboardPage() {
  const { user } = useAuth() as { user: UserWithRole | null };
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<Stats>({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setLoading(true);

        if (user.role === "DOCTOR") {
          const [doctorProfile, doctorAppointments] = await Promise.all([
            getDoctorProfile(user.uid),
            getDoctorAppointments(user.uid),
          ]);

          if (!abortController.signal.aborted) {
            setProfile({
              displayName: doctorProfile?.displayName || "Nombre no disponible",
              role: "DOCTOR",
            });
            setAppointments(doctorAppointments);
            calculateStats(doctorAppointments);
          }
        } else if (user.role === "PATIENT") {
          const [patientProfile, patientAppointments] = await Promise.all([
            getPatientProfile(user.uid),
            getPatientAppointments(user.uid),
          ]);

          if (!abortController.signal.aborted) {
            setProfile({
              displayName:
                patientProfile?.displayName || "Nombre no disponible",
              role: "PATIENT",
            });
            setAppointments(patientAppointments);
            calculateStats(patientAppointments);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        if (!abortController.signal.aborted) {
          setAppointments([]);
          setStats({ upcoming: 0, completed: 0, cancelled: 0, total: 0 });
        }
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => abortController.abort();
  }, [user, router]);

  const calculateStats = (appointmentsData: Appointment[]) => {
    const upcoming = appointmentsData.filter(
      (apt) => apt.status === "SCHEDULED" || apt.status === "CONFIRMED"
    ).length;

    const completed = appointmentsData.filter(
      (apt) => apt.status === "COMPLETED"
    ).length;

    const cancelled = appointmentsData.filter(
      (apt) => apt.status === "CANCELLED" || apt.status === "MISSED"
    ).length;

    setStats({
      upcoming,
      completed,
      cancelled,
      total: appointmentsData.length,
    });
  };

  const getStatusBadge = (status: string) => {
    const style = statusBadgeStyles[status] || "bg-gray-100 text-gray-800";
    const label = statusBadgeLabels[status] || status;
    return <Badge className={`${style} transition-colors`}>{label}</Badge>;
  };

  if (!user || loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Bienvenido, {profile?.displayName || "Usuario"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
          </p>
        </div>

        {user.role !== "ADMIN" && (
          <Button asChild className="shrink-0">
            <Link href="/dashboard/calendar">
              <PlusCircle className="mr-2 h-4 w-4" />
              Nueva Cita
            </Link>
          </Button>
        )}
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Citas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Citas registradas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">
              Pendientes/Confirmadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              Consultas realizadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Canceladas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">
              Canceladas/No asistidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Listado de Citas */}
      <Card>
        <CardHeader>
          <CardTitle>Citas Recientes</CardTitle>
          <CardDescription>
            {appointments.length > 0
              ? `Tus últimas ${Math.min(5, appointments.length)} citas`
              : "No hay citas programadas"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {user.role === "DOCTOR"
                          ? `Paciente: ${
                              appointment.patientName || "Sin nombre"
                            }`
                          : `Dr. ${appointment.doctorName || "Sin nombre"}`}
                      </h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(
                        appointment.date instanceof Timestamp
                          ? appointment.date.toDate()
                          : appointment.date,
                        "EEEE d 'de' MMMM 'de' yyyy",
                        { locale: es }
                      )}
                      {appointment.startTime && ` • ${appointment.startTime}`}
                    </p>
                    {appointment.reason && (
                      <p className="text-sm line-clamp-2">
                        {appointment.reason}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 sm:mt-0 sm:ml-4"
                    asChild
                  >
                    <Link
                      href={`/dashboard/appointments/${appointment.id}`}
                      className="whitespace-nowrap"
                    >
                      Detalles
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <CalendarDays className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  No hay citas registradas
                </h3>
                <p className="text-muted-foreground text-sm mt-1">
                  Programa tu primera cita para comenzar
                </p>
              </div>
              <Button asChild>
                <Link href="/dashboard/calendar" className="mt-4">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Agendar Cita
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
