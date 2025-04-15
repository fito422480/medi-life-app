"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllDoctors, getDoctorsBySpecialty } from "@/lib/firebase/db";
import { Doctor } from "@/lib/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs } from "@/components/ui/tabs";
import {
  Search,
  CalendarPlus,
  Star,
  StarHalf,
  Clock,
  MapPin,
} from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function DoctorsPage() {
  const router = useRouter();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");

  // Specialties list
  const specialties = [
    { value: "all", label: "Todas las especialidades" },
    { value: "Medicina General", label: "Medicina General" },
    { value: "Psiquiatría", label: "Psiquiatría" },
    { value: "Psicología", label: "Psicología" },
    { value: "Neurología", label: "Neurología" },
    { value: "Cardiología", label: "Cardiología" },
    { value: "Dermatología", label: "Dermatología" },
    { value: "Pediatría", label: "Pediatría" },
    { value: "Ginecología", label: "Ginecología" },
    { value: "Traumatología", label: "Traumatología" },
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      setLoading(true);
      try {
        let fetchedDoctors;

        if (selectedSpecialty === "all") {
          fetchedDoctors = await getAllDoctors();
        } else {
          fetchedDoctors = await getDoctorsBySpecialty(selectedSpecialty);
        }

        setDoctors(fetchedDoctors);
        setFilteredDoctors(fetchedDoctors);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [selectedSpecialty]);

  // Filter doctors based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredDoctors(doctors);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = doctors.filter((doctor) => {
        const displayName = doctor.displayName || "";
        const specialty = doctor.specialty || "";

        return (
          displayName.toLowerCase().includes(query) ||
          specialty.toLowerCase().includes(query)
        );
      });
      setFilteredDoctors(filtered);
    }
  }, [searchQuery, doctors]);

  const handleScheduleAppointment = (doctorId: string) => {
    router.push(`/dashboard/calendar?doctorId=${doctorId}`);
  };

  return (
    <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"]}>
      <div className="container mx-auto py-6">
        <div className="flex flex-col space-y-6">
          <h1 className="text-2xl font-bold tracking-tight">
            Directorio de Médicos
          </h1>
          <p className="text-muted-foreground">
            Encuentra el especialista adecuado para tu consulta
          </p>

          {/* Search and filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre o especialidad..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select
              value={selectedSpecialty}
              onValueChange={setSelectedSpecialty}
            >
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue placeholder="Filtrar por especialidad" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Doctor cards */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 w-2/3 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-24 w-full bg-gray-200 rounded mb-4"></div>
                  </CardContent>
                  <CardFooter>
                    <div className="h-10 w-full bg-gray-200 rounded"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium mb-2">
                No se encontraron médicos
              </h3>
              <p className="text-muted-foreground mb-6">
                No hay médicos que coincidan con tu búsqueda. Intenta con
                diferentes criterios.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedSpecialty("all");
                }}
              >
                Mostrar todos los médicos
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDoctors.map((doctor) => (
                <Card key={doctor.uid} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">
                          {doctor.displayName || "Doctor"}
                        </CardTitle>
                        <CardDescription>
                          {doctor.specialty || "Especialidad no especificada"}
                        </CardDescription>
                      </div>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                        {doctor.specialty || "General"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2 flex items-center">
                        <Clock className="h-4 w-4 mr-2" />
                        Disponible Lun-Vie, 8:00 - 17:00
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center">
                        <MapPin className="h-4 w-4 mr-2" />
                        {doctor.address || "Dirección no disponible"}
                      </p>
                    </div>
                    <div className="flex items-center mb-4">
                      {Array(4)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 text-yellow-400 fill-yellow-400"
                          />
                        ))}
                      <StarHalf className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-sm text-muted-foreground ml-2">
                        4.5 (120 reseñas)
                      </span>
                    </div>
                    <p className="text-sm line-clamp-3">
                      {doctor.bio ||
                        "El Dr. es un profesional comprometido con brindar atención médica de calidad. Cuenta con amplia experiencia en su especialidad."}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      onClick={() => handleScheduleAppointment(doctor.uid)}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      Agendar Cita
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
