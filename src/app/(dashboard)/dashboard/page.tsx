// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import { getUserProfile, getDoctorProfile, getPatientProfile, getDoctorAppointments, getPatientAppointments } from "@/lib/firebase/db";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Activity, Clock, ChevronRight, PlusCircle } from "lucide-react";
import Link from "next/link";
import { AppointmentStatus } from "@/lib/types";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export default function DashboardPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState<{
    upcoming: number;
    completed: number;
    cancelled: number;
    total: number;
  }>({
    upcoming: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        // Fetch user profile based on role
        if (user.role === "DOCTOR") {
          const doctorProfile = await getDoctorProfile(user.uid);
          setProfile(doctorProfile);
          
          // Fetch appointments for doctor
          const doctorAppointments = await getDoctorAppointments(user.uid);
          setAppointments(doctorAppointments);
          
          // Calculate stats
          calculateStats(doctorAppointments);
        } else if (user.role === "PATIENT") {
          const patientProfile = await getPatientProfile(user.uid);
          setProfile(patientProfile);
          
          // Fetch appointments for patient
          const patientAppointments = await getPatientAppointments(user.uid);
          setAppointments(patientAppointments);
          
          // Calculate stats
          calculateStats(patientAppointments);
        } else {
          // Admin profile
          const adminProfile = await getUserProfile(user.uid);
          setProfile(adminProfile);
          
          // For admin, we would fetch different stats
          // This would be implemented based on requirements
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const calculateStats = (appointmentsData: any[]) => {
    const upcoming = appointmentsData.filter(
      apt => apt.status === "PENDING" || apt.status === "CONFIRMED"
    ).length;
    
    const completed = appointmentsData.filter(
      apt => apt.status === "COMPLETED"
    ).length;
    
    const cancelled = appointmentsData.filter(
      apt => apt.status === "CANCELLED" || apt.status === "NO_SHOW"
    ).length;
    
    setStats({
      upcoming,
      completed,
      cancelled,
      total: appointmentsData.length,
    });
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-200">Pendiente</Badge>;
      case "CONFIRMED":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-200">Confirmada</Badge>;
      case "COMPLETED":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Completada</Badge>;
      case "CANCELLED":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Cancelada</Badge>;
      case "NO_SHOW":
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">No asistió</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Bienvenido, {profile?.displayName}</h1>
          <p className="text-muted-foreground">{format(new Date(), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}</p>
        </div>
        
        <Button asChild>
          <Link href="/dashboard/calendar">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nueva Cita
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total de Citas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Citas registradas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Próximas Citas</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.upcoming}</div>
            <p className="text-xs text-muted-foreground">Pendientes y confirmadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Completadas</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Consultas realizadas</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Citas Canceladas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.cancelled}</div>
            <p className="text-xs text-muted-foreground">Canceladas o no asistidas</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Citas Recientes</CardTitle>
          <CardDescription>
            Tus últimas {Math.min(5, appointments.length)} citas médicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {appointments.length > 0 ? (
            <div className="space-y-4">
              {appointments.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {user?.role === "DOCTOR" 
                          ? `Paciente: ${appointment.patientName}` 
                          : `Dr. ${appointment.doctorName} - ${appointment.doctorSpecialty}`}
                      </h3>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(appointment.date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })} • {appointment.startTime} - {appointment.endTime}
                    </p>
                    <p className="text-sm">{appointment.reason.substring(0, 100)}{appointment.reason.length > 100 ? '...' : ''}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 sm:mt-0" asChild>
                    <Link href={`/dashboard/calendar?appointmentId=${appointment.id}`}>
                      Ver Detalles
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No hay citas registradas</h3>
              <p className="text-muted-foreground mt-1">
                Programa tu primera cita médica para comenzar
              </p>
              <Button className="mt-4" asChild>
                <Link href="/dashboard/calendar">
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