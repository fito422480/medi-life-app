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
import { Button } from "@/components/ui/button";
import { CalendarDays, Users, Activity, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AppointmentStatus } from "@/lib/types";

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
          const adminProfile = await getUser