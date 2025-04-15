"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/use-auth";
import { getDoctorPatients } from "@/lib/firebase/db";
import { Patient } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search,
  CalendarPlus,
  FileText,
  MoreVertical,
  Mail,
  Phone,
  Activity,
  Filter,
  Users,
  CalendarDays,
  UserPlus,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || user.role !== "DOCTOR") return;

      setLoading(true);
      try {
        const fetchedPatients = await getDoctorPatients(user.uid);
        setPatients(fetchedPatients);
        setFilteredPatients(fetchedPatients);
      } catch (error) {
        console.error("Error fetching patients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  // Filter patients based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPatients(patients);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = patients.filter(
        (patient) =>
          patient.displayName?.toLowerCase().includes(query) ||
          false ||
          (patient.email && patient.email.toLowerCase().includes(query))
      );
      setFilteredPatients(filtered);
    }
  }, [searchQuery, patients]);

  const handleScheduleAppointment = (patientId: string) => {
    router.push(`/dashboard/calendar?patientId=${patientId}`);
  };

  const handleViewMedicalRecord = (patientId: string) => {
    // This would navigate to the patient's medical record page
    // For now, let's just navigate to the calendar with the patient selected
    router.push(`/dashboard/calendar?patientId=${patientId}`);
  };

  const calculateAge = (dateOfBirth?: Date | string) => {
    if (!dateOfBirth) return "N/A";

    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();

    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  return (
    <ProtectedRoute allowedRoles={["DOCTOR", "ADMIN"]}>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Mis Pacientes
              </h1>
              <p className="text-muted-foreground">
                Administra tu lista de pacientes y sus registros médicos
              </p>
            </div>
            <Button onClick={() => router.push("/dashboard/calendar")}>
              <CalendarPlus className="h-4 w-4 mr-2" />
              Nueva Cita
            </Button>
          </div>

          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o email..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" className="w-full sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Pacientes
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Citas Recientes
                </CardTitle>
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Pacientes Nuevos
                </CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
              </CardContent>
            </Card>
          </div>

          {/* Patients Table */}
          <Card>
            <CardHeader>
              <CardTitle>Lista de Pacientes</CardTitle>
              <CardDescription>
                {filteredPatients.length} pacientes en total
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">
                    No se encontraron pacientes
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery
                      ? "No hay pacientes que coincidan con tu búsqueda. Intenta con diferentes criterios."
                      : "Aún no tienes pacientes registrados. Programa una cita con un nuevo paciente para comenzar."}
                  </p>
                  {searchQuery && (
                    <Button
                      variant="outline"
                      onClick={() => setSearchQuery("")}
                    >
                      Mostrar todos los pacientes
                    </Button>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Contacto</TableHead>
                        <TableHead>Edad</TableHead>
                        <TableHead>Info Médica</TableHead>
                        <TableHead>Última Visita</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPatients.map((patient) => (
                        <TableRow key={patient.uid}>
                          <TableCell className="font-medium">
                            {patient.displayName}
                            <br />
                            <Badge className="mt-1">
                              {patient.gender === "MALE"
                                ? "Masculino"
                                : patient.gender === "FEMALE"
                                ? "Femenino"
                                : "Otro"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="flex items-center text-xs">
                                <Mail className="h-3 w-3 mr-1" />
                                {patient.email}
                              </span>
                              {patient.phone && (
                                <span className="flex items-center text-xs mt-1">
                                  <Phone className="h-3 w-3 mr-1" />
                                  {patient.phone}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {patient.dateOfBirth ? (
                              <div>
                                <span className="font-medium">
                                  {calculateAge(patient.dateOfBirth)}
                                </span>
                                <span className="text-xs text-muted-foreground block">
                                  {format(
                                    typeof patient.dateOfBirth === "object" &&
                                      "toDate" in patient.dateOfBirth
                                      ? patient.dateOfBirth.toDate()
                                      : new Date(patient.dateOfBirth),
                                    "dd MMM yyyy",
                                    { locale: es }
                                  )}
                                </span>
                              </div>
                            ) : (
                              "N/A"
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col gap-1 text-xs">
                              {patient.bloodType && (
                                <span className="flex items-center">
                                  <Activity className="h-3 w-3 mr-1 text-red-500" />
                                  Tipo {patient.bloodType}
                                </span>
                              )}
                              {patient.allergies &&
                                patient.allergies.length > 0 && (
                                  <span>
                                    Alergias:{" "}
                                    {patient.allergies.slice(0, 2).join(", ")}
                                    {patient.allergies.length > 2 && "..."}
                                  </span>
                                )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-muted-foreground text-xs">
                              Sin visitas recientes
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Menú</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleScheduleAppointment(patient.uid)
                                  }
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Agendar Cita
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleViewMedicalRecord(patient.uid)
                                  }
                                >
                                  <FileText className="h-4 w-4 mr-2" />
                                  Ver Historial
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  );
}
