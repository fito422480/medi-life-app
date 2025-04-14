"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import "moment/locale/es";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip } from "@/components/ui/tooltip";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
} from "lucide-react";
import { useTheme } from "next-themes";
import { AppointmentStatus } from "@/lib/types";
import { useI18n } from "@/i18n/config";
import { cn } from "@/lib/utils";

// Configurar localización de moment
moment.locale("es");

// Crear localizador para el calendario
const localizer = momentLocalizer(moment);

// Tipado para eventos del calendario
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: AppointmentStatus;
  color?: string;
  resourceId?: string;
  patientName?: string;
  doctorName?: string;
  reason?: string;
  allDay?: boolean;
}

interface EnhancedCalendarProps {
  events: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onSelectSlot?: (slotInfo: {
    start: Date;
    end: Date;
    resourceId?: string | number;
  }) => void;
  onNavigate?: (date: Date, view: string) => void;
  onView?: (view: string) => void;
  isLoading?: boolean;
  className?: string;
  resources?: Array<{ id: string; title: string }>;
  resourceIdAccessor?: string;
  resourceTitleAccessor?: string;
  showResources?: boolean;
  toolbar?: boolean;
}

export function EnhancedCalendar({
  events,
  onSelectEvent,
  onSelectSlot,
  onNavigate,
  onView,
  isLoading = false,
  className,
  resources,
  resourceIdAccessor = "id",
  resourceTitleAccessor = "title",
  showResources = false,
  toolbar = true,
}: EnhancedCalendarProps) {
  const [date, setDate] = useState(new Date());
  const [view, setView] = useState(Views.WEEK);
  const { theme } = useTheme();
  const t = useI18n();
  const [mounted, setMounted] = useState(false);

  // Evitar parpadeo durante la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  // Personalizar el renderizado de eventos
  const eventPropGetter = useCallback(
    (event: CalendarEvent) => {
      const statusColorMap: Record<
        AppointmentStatus,
        { background: string; border: string; text: string }
      > = {
        PENDING: {
          background:
            theme === "dark"
              ? "rgba(234, 179, 8, 0.2)"
              : "rgba(234, 179, 8, 0.1)",
          border: "rgb(234, 179, 8)",
          text: "rgb(161, 98, 7)",
        },
        CONFIRMED: {
          background:
            theme === "dark"
              ? "rgba(34, 197, 94, 0.2)"
              : "rgba(34, 197, 94, 0.1)",
          border: "rgb(34, 197, 94)",
          text: "rgb(22, 101, 52)",
        },
        COMPLETED: {
          background:
            theme === "dark"
              ? "rgba(59, 130, 246, 0.2)"
              : "rgba(59, 130, 246, 0.1)",
          border: "rgb(59, 130, 246)",
          text: "rgb(30, 64, 175)",
        },
        CANCELLED: {
          background:
            theme === "dark"
              ? "rgba(239, 68, 68, 0.2)"
              : "rgba(239, 68, 68, 0.1)",
          border: "rgb(239, 68, 68)",
          text: "rgb(127, 29, 29)",
        },
        NO_SHOW: {
          background:
            theme === "dark"
              ? "rgba(107, 114, 128, 0.2)"
              : "rgba(107, 114, 128, 0.1)",
          border: "rgb(107, 114, 128)",
          text: "rgb(55, 65, 81)",
        },
      };

      const color = statusColorMap[event.status] || {
        background:
          theme === "dark"
            ? "rgba(107, 114, 128, 0.2)"
            : "rgba(107, 114, 128, 0.1)",
        border: "rgb(107, 114, 128)",
        text: "rgb(55, 65, 81)",
      };

      return {
        style: {
          backgroundColor: color.background,
          borderLeft: `3px solid ${color.border}`,
          color: color.text,
          borderRadius: "3px",
          padding: "2px 4px",
          fontSize: "0.875rem",
        },
      };
    },
    [theme]
  );

  // Personalizar el toolbar del calendario
  const CustomToolbar = ({ label, onNavigate, onView }: any) => {
    return (
      <div className="flex flex-wrap items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate("TODAY")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            {t("common.today")}
          </Button>
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("PREV")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="text-lg font-medium px-2">{label}</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onNavigate("NEXT")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-2 sm:mt-0">
          <div className="flex bg-muted rounded-lg p-0.5">
            <Button
              variant={view === Views.MONTH ? "default" : "ghost"}
              size="sm"
              className="rounded-lg"
              onClick={() => onView(Views.MONTH)}
            >
              {t("appointments.month")}
            </Button>
            <Button
              variant={view === Views.WEEK ? "default" : "ghost"}
              size="sm"
              className="rounded-lg"
              onClick={() => onView(Views.WEEK)}
            >
              {t("appointments.week")}
            </Button>
            <Button
              variant={view === Views.DAY ? "default" : "ghost"}
              size="sm"
              className="rounded-lg"
              onClick={() => onView(Views.DAY)}
            >
              {t("appointments.day")}
            </Button>
            <Button
              variant={view === Views.AGENDA ? "default" : "ghost"}
              size="sm"
              className="rounded-lg"
              onClick={() => onView(Views.AGENDA)}
            >
              {t("appointments.agenda")}
            </Button>
          </div>
          <Button size="sm" className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-1" />
            {t("appointments.newAppointment")}
          </Button>
        </div>
      </div>
    );
  };

  // Formateo personalizado para los días y horas
  const formats = useMemo(
    () => ({
      dayFormat: (date: Date, culture: string, localizer: any) =>
        localizer.format(date, "dd D", culture),
      timeGutterFormat: (date: Date, culture: string, localizer: any) =>
        localizer.format(date, "HH:mm", culture),
      eventTimeRangeFormat: (
        { start, end }: any,
        culture: string,
        localizer: any
      ) =>
        `${localizer.format(start, "HH:mm", culture)} - ${localizer.format(
          end,
          "HH:mm",
          culture
        )}`,
    }),
    []
  );

  // Renderizar mensaje en el slot
  const dayPropGetter = useCallback(
    (date: Date) => {
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      return {
        style: {
          backgroundColor: isToday
            ? theme === "dark"
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(59, 130, 246, 0.05)"
            : undefined,
          borderTop: "1px solid var(--border)",
        },
      };
    },
    [theme]
  );

  const slotPropGetter = useCallback(
    (date: Date) => {
      const today = new Date();
      const isToday =
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();

      return {
        style: {
          backgroundColor: isToday
            ? theme === "dark"
              ? "rgba(59, 130, 246, 0.1)"
              : "rgba(59, 130, 246, 0.05)"
            : undefined,
        },
      };
    },
    [theme]
  );

  // Manejadores de eventos
  const handleSelectEvent = (event: CalendarEvent) => {
    if (onSelectEvent) {
      onSelectEvent(event);
    }
  };

  const handleSelectSlot = (slotInfo: {
    start: Date;
    end: Date;
    resourceId?: string | number;
  }) => {
    if (onSelectSlot) {
      onSelectSlot(slotInfo);
    }
  };

  const handleNavigate = (newDate: Date, viewArg: string) => {
    setDate(newDate);
    if (onNavigate) {
      onNavigate(newDate, viewArg);
    }
  };

  const handleView = (newView: string) => {
    setView(newView);
    if (onView) {
      onView(newView);
    }
  };

  if (!mounted) {
    return (
      <Card className={cn("w-full h-[600px]", className)}>
        <CardHeader>
          <CardTitle>{t("appointments.calendar")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] animate-pulse bg-muted rounded-md" />
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card className={cn("w-full h-[600px]", className)}>
        <CardHeader>
          <CardTitle>{t("appointments.calendar")}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[500px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-sm text-muted-foreground">
                {t("common.loading")}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full h-[600px]", className)}>
      <CardHeader className="pb-0">
        <CardTitle>{t("appointments.calendar")}</CardTitle>
      </CardHeader>
      <CardContent className="p-0 mt-2">
        <div className="h-[520px] px-4 pb-4">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            onSelectEvent={handleSelectEvent}
            selectable
            onSelectSlot={handleSelectSlot}
            tooltipAccessor={(event) => event.title}
            eventPropGetter={eventPropGetter}
            dayPropGetter={dayPropGetter}
            slotPropGetter={slotPropGetter}
            onNavigate={handleNavigate}
            onView={handleView}
            view={view}
            date={date}
            formats={formats}
            components={{
              toolbar: toolbar ? CustomToolbar : undefined,
              event: (props) => {
                const { event } = props;
                return (
                  <Tooltip>
                    <div className="truncate">
                      <strong>{event.title}</strong>
                      {event.patientName && (
                        <div className="text-xs truncate">
                          {event.patientName}
                        </div>
                      )}
                      {event.doctorName && (
                        <div className="text-xs truncate">
                          {event.doctorName}
                        </div>
                      )}
                    </div>
                  </Tooltip>
                );
              },
            }}
            resources={showResources ? resources : undefined}
            resourceIdAccessor={resourceIdAccessor}
            resourceTitleAccessor={resourceTitleAccessor}
            messages={{
              today: t("common.today"),
              previous: t("common.previous"),
              next: t("common.next"),
              month: t("appointments.month"),
              week: t("appointments.week"),
              day: t("appointments.day"),
              agenda: t("appointments.agenda"),
              date: t("appointments.date"),
              time: t("appointments.time"),
              event: t("appointments.appointment"),
              noEventsInRange: t("appointments.noAppointments"),
              showMore: (total) => `+ ${total} ${t("common.more")}`,
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
