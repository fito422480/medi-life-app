"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAllDoctors, getDoctorsBySpecialty } from "@/lib/firebase/db";
import { UserRole } from "@/lib/types/types";
import { Doctor as DoctorType } from "@/lib/types";
import { Specialty } from "@/lib/types";
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
import { Search, CalendarPlus, Star, Clock, MapPin } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/protected-route";
import { useI18n } from "@/i18n/config";

export default function DoctorsPage() {
  const router = useRouter();
  const t = useI18n();
  const [doctors, setDoctors] = useState<DoctorType[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<DoctorType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<Specialty | "all">("all");
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  // Type for specialty items
  type SpecialtyItem = {
    value: Specialty | "all";
    label: string;
  };

  // Lista de especialidades
  const specialties: SpecialtyItem[] = [
    { value: Specialty.GENERAL, label: t("doctors.specialties.list.general", { count: 0 }) },
    { value: Specialty.PSYCHIATRY, label: t("doctors.specialties.list.psychiatry", { count: 0 }) },
    { value: Specialty.PSYCHOLOGY, label: t("doctors.specialties.list.psychology", { count: 0 }) },
    { value: Specialty.NEUROLOGY, label: t("doctors.specialties.list.neurology", { count: 0 }) },
    { value: Specialty.CARDIOLOGY, label: t("doctors.specialties.list.cardiology", { count: 0 }) },
    { value: Specialty.DERMATOLOGY, label: t("doctors.specialties.list.dermatology", { count: 0 }) },
    { value: Specialty.PEDIATRICS, label: t("doctors.specialties.list.pediatrics", { count: 0 }) },
    { value: Specialty.GYNECOLOGY, label: t("doctors.specialties.list.gynecology", { count: 0 }) },
    { value: Specialty.ORTHOPEDICS, label: t("doctors.specialties.list.orthopedics", { count: 0 }) },
  ];

  const specialtiesWithAll = [{ value: "all", label: t("doctors.specialties.all", { count: specialties.length }) }, ...specialties];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);
        const doctorsData = await getAllDoctors();
        setDoctors(doctorsData);
        setFilteredDoctors(doctorsData);
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setError(t("doctors.error", { count: 0 }));
        if (retryCount < MAX_RETRIES) {
          setRetryCount(prev => prev + 1);
          setTimeout(() => fetchDoctors(), 2000);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [retryCount]);

  useEffect(() => {
    if (selectedSpecialty === "all") {
      setFilteredDoctors(doctors);
    } else {
      setFilteredDoctors(
        doctors.filter((doc) => doc.specialty === selectedSpecialty)
      );
    }
  }, [selectedSpecialty, doctors]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    
    const filtered = doctors.filter((doc) =>
      doc.displayName?.toLowerCase().includes(query) ||
      doc.specialty.toString().toLowerCase().includes(query)
    );

    setFilteredDoctors(filtered);
  };

  const formatRating = (rating: number | undefined): string => {
    if (!rating) return t("doctors.ratings.noRating", { count: 0 });
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return `${"★".repeat(fullStars)}${hasHalfStar ? "½" : ""}${"☆".repeat(5 - Math.ceil(rating))}`;
  };

  return (
    <ProtectedRoute allowedRoles={["PATIENT", "ADMIN"] as UserRole[]} >
      <div className="container mx-auto py-8">
        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 text-red-700">
            <p>{t("doctors.error", { count: 0 })}</p>
            <Button
              variant="outline"
              onClick={() => {
                setRetryCount(0);
                setError(null);
              }}
              className="mt-2"
            >
              {t("doctors.actions.tryAgain", { count: 0 })}
            </Button>
          </div>
        )}

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t("doctors.search.placeholder", { count: 0 })}
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10"
                aria-label={t("doctors.search.placeholder", { count: 0 })}
              />
            </div>
            <Select
              value={selectedSpecialty as string}
              onValueChange={(value) => setSelectedSpecialty(value as Specialty | "all")}
              aria-label={t("doctors.filterBySpecialty", { count: 0 })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("doctors.filterBySpecialty", { count: 0 })} />
              </SelectTrigger>
              <SelectContent>
                {specialtiesWithAll.map((specialty) => (
                  <SelectItem key={specialty.value} value={specialty.value}>
                    {specialty.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center">
                <p>{t("doctors.status.loading", { count: 0 })}</p>
              </div>
            ) : filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center">
                <p>{t("doctors.status.noDoctorsFound", { count: 0 })}</p>
              </div>
            ) : (
              filteredDoctors.map((doctor) => (
                <Card key={doctor.uid}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {doctor.displayName}
                      <Badge variant="secondary">
                        {t(`doctors.specialties.list.${doctor.specialty}`, { count: 0 })}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      {doctor.bio ? 
                        `${doctor.bio.slice(0, 100)}${doctor.bio.length > 100 ? "..." : ""}` : 
                        t("doctors.noBio", { count: 0 })}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span>
                          {formatRating(doctor.rating)} ({doctor.reviewCount || 0} {t("common.reviews", { count: 0 })})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span>{t("doctors.availableHours", { count: 0 })}</span>
                      </div>
                      {doctor.address ? (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span>{doctor.address}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span>{t("doctors.noAddress", { count: 0 })}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => router.push(`/doctors/${doctor.uid}`)}
                      aria-label={`${t("doctors.viewProfile", { count: 0 })} ${doctor.displayName}`}
                    >
                      {t("doctors.viewProfile", { count: 0 })}
                    </Button>
                    <Button
                      onClick={() => router.push(`/calendar?doctor=${doctor.uid}`)}
                      aria-label={`${t("doctors.scheduleAppointment", { count: 0 })} with ${doctor.displayName}`}
                    >
                      <CalendarPlus className="h-4 w-4 mr-2" />
                      {t("doctors.scheduleAppointment", { count: 0 })}
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
