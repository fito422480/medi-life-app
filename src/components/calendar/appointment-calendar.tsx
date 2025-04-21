// src/components/calendar/appointment-calendar.tsx
"use client";

import { useState, useEffect } from "react";
import {
  addDays,
  startOfWeek,
  format,
  isToday,
  isSameDay,
  // parse, - Eliminado
  eachDayOfInterval,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Appointment } from "@/lib/types"; // Doctor eliminado
import { AppointmentDetails } from "./appointment-details";
import { AppointmentForm } from "./appointment-form";
import { useAuth } from "@/lib/hooks/use-auth";
import { useAppointments } from "@/lib/hooks/use-appointments";

interface AppointmentCalendarProps {
  doctorId?: string;
  patientId?: string;
}

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8am to 8pm

export function AppointmentCalendar({
  doctorId,
  patientId,
}: AppointmentCalendarProps) {
  const { user } = useAuth();
  const { appointments, isLoading, error } = useAppointments(
    doctorId,
    patientId
  );

  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date[]>([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{
    date: Date;
    hour: number;
    minute: number;
  } | null>(null);

  // Initialize current week
  useEffect(() => {
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({
      start,
      end: addDays(start, 6),
    });
    setCurrentWeek(days.slice(0, 5)); // Only weekdays
  }, [currentDate]);

  // Handle navigation
  const previousWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const nextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const today = () => {
    setCurrentDate(new Date());
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour: number, minute: number) => {
    const appointmentsInSlot = appointments.filter((apt) => {
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
      return (
        isSameDay(aptDate, date) &&
        parseInt(apt.startTime.split(":")[0]) === hour &&
        parseInt(apt.startTime.split(":")[1]) === minute
      );
    });

    if (appointmentsInSlot.length > 0) {
      // Show appointment details
      setSelectedAppointment(appointmentsInSlot[0]);
      setShowAppointmentDetails(true);
    } else {
      // Create new appointment
      setSelectedTimeSlot({ date, hour, minute });
      setShowAppointmentForm(true);
    }
  };

  // Render appointment in time slot
  const renderAppointment = (date: Date, hour: number, minute: number) => {
    const appointmentsInSlot = appointments.filter((apt) => {
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
      return (
        isSameDay(aptDate, date) &&
        parseInt(apt.startTime.split(":")[0]) === hour &&
        parseInt(apt.startTime.split(":")[1]) === minute
      );
    });

    if (appointmentsInSlot.length === 0) return null;

    const appointment = appointmentsInSlot[0];
    const statusColors = {
      PENDING: "bg-yellow-100 border-yellow-300",
      CONFIRMED: "bg-green-100 border-green-300",
      COMPLETED: "bg-blue-100 border-blue-300",
      CANCELLED: "bg-red-100 border-red-300",
      NO_SHOW: "bg-gray-100 border-gray-300",
    };

    return (
      <div
        className={`p-1 rounded border ${
          statusColors[appointment.status]
        } hover:opacity-80 cursor-pointer`}
        onClick={() => {
          setSelectedAppointment(appointment);
          setShowAppointmentDetails(true);
        }}
      >
        <p className="font-medium text-xs truncate">
          {user?.role === "DOCTOR"
            ? appointment.patientName
            : appointment.doctorName}
        </p>
        <p className="text-xs truncate">
          {appointment.reason.substring(0, 20)}
        </p>
      </div>
    );
  };

  // Check if time slot is available (for creating new appointments)
  const isTimeSlotAvailable = (date: Date, hour: number, minute: number) => {
    const slotTime = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;

    // Check if there's already an appointment in this slot
    const hasAppointment = appointments.some((apt) => {
      const aptDate = apt.date instanceof Date ? apt.date : new Date(apt.date);
      return isSameDay(aptDate, date) && apt.startTime === slotTime;
    });

    if (hasAppointment) return false;

    // If user is a doctor, check their working hours
    if (user?.role === "DOCTOR") {
      // Implementation depends on how you store working hours
      // This is a simple example
      return true; // For simplification
    }

    // For patients, simply check if there's no appointment and it's within working hours
    return true;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-10">Cargando calendario...</div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-10">
        Error al cargar el calendario: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Card className="shadow-lg border-0">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-2xl font-bold">
              Calendario de Citas
            </CardTitle>
            <CardDescription>
              {format(currentWeek[0], "'Semana del' d 'de' MMMM", {
                locale: es,
              })}{" "}
              -{format(currentWeek[4], " d 'de' MMMM yyyy", { locale: es })}
            </CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={previousWeek}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button size="sm" variant="outline" onClick={today}>
              <CalendarIcon className="h-4 w-4 mr-1" />
              Hoy
            </Button>
            <Button size="sm" variant="outline" onClick={nextWeek}>
              Siguiente
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedTimeSlot(null);
                setShowAppointmentForm(true);
              }}
            >
              <PlusCircle className="h-4 w-4 mr-1" />
              Nueva Cita
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-auto">
            <div className="min-w-[800px]">
              {/* Calendar Header - Days of the week */}
              <div className="grid grid-cols-6 gap-1">
                <div className="h-12 bg-muted rounded-md flex items-center justify-center font-medium">
                  Hora
                </div>
                {currentWeek.map((day, index) => (
                  <div
                    key={index}
                    className={`h-12 bg-muted rounded-md flex flex-col items-center justify-center font-medium p-1
                      ${
                        isToday(day)
                          ? "bg-primary/20 border border-primary/50"
                          : ""
                      }
                    `}
                  >
                    <span>{format(day, "EEEE", { locale: es })}</span>
                    <span>{format(day, "d MMM", { locale: es })}</span>
                  </div>
                ))}
              </div>

              {/* Calendar Body - Time slots */}
              <ScrollArea className="h-[calc(100vh-250px)] mt-1">
                <div className="space-y-1">
                  {HOURS.flatMap((hour) => {
                    return [0, 30].map((minute) => (
                      <div
                        key={`${hour}-${minute}`}
                        className="grid grid-cols-6 gap-1 min-h-[60px]"
                      >
                        <div className="bg-muted/40 rounded-md flex items-center justify-center font-mono text-sm">
                          {`${hour.toString().padStart(2, "0")}:${minute
                            .toString()
                            .padStart(2, "0")}`}
                        </div>

                        {currentWeek.map((day, dayIndex) => {
                          const hasAppointment = appointments.some((apt) => {
                            const aptDate =
                              apt.date instanceof Date
                                ? apt.date
                                : new Date(apt.date);
                            return (
                              isSameDay(aptDate, day) &&
                              parseInt(apt.startTime.split(":")[0]) === hour &&
                              parseInt(apt.startTime.split(":")[1]) === minute
                            );
                          });

                          const isAvailable = isTimeSlotAvailable(
                            day,
                            hour,
                            minute
                          );

                          return (
                            <div
                              key={dayIndex}
                              className={`rounded-md p-1 border ${
                                hasAppointment
                                  ? ""
                                  : isAvailable
                                  ? "border-dashed border-gray-200 hover:bg-green-50 hover:border-green-300 cursor-pointer"
                                  : "bg-gray-50 border-gray-100"
                              } ${isToday(day) ? "bg-primary/5" : ""}`}
                              onClick={() => {
                                if (!hasAppointment && isAvailable) {
                                  handleTimeSlotClick(day, hour, minute);
                                }
                              }}
                            >
                              {renderAppointment(day, hour, minute)}
                            </div>
                          );
                        })}
                      </div>
                    ));
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-2">
            <span className="text-sm font-medium">Estado de citas:</span>
            <Badge
              variant="outline"
              className="bg-yellow-100 border-yellow-300"
            >
              Pendiente
            </Badge>
            <Badge variant="outline" className="bg-green-100 border-green-300">
              Confirmada
            </Badge>
            <Badge variant="outline" className="bg-blue-100 border-blue-300">
              Completada
            </Badge>
            <Badge variant="outline" className="bg-red-100 border-red-300">
              Cancelada
            </Badge>
            <Badge variant="outline" className="bg-gray-100 border-gray-300">
              No asistió
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Dialog */}
      <AppointmentDetails
        appointment={selectedAppointment}
        isOpen={showAppointmentDetails}
        onClose={() => setShowAppointmentDetails(false)}
      />

      {/* Appointment Form Dialog */}
      <AppointmentForm
        isOpen={showAppointmentForm}
        onClose={() => setShowAppointmentForm(false)}
        initialDate={selectedTimeSlot?.date}
        initialHour={selectedTimeSlot?.hour}
        initialMinute={selectedTimeSlot?.minute}
        doctorId={doctorId}
        patientId={patientId}
      />
    </div>
  );
}
