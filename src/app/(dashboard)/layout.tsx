// src/app/(dashboard)/layout.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { getUserProfile } from "@/lib/firebase/db";
import { User as UserType } from "@/lib/types";
import { 
  LayoutDashboard, 
  CalendarDays, 
  Users, 
  UserRound, 
  Settings, 
  LogOut, 
  Menu, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userProfile = await getUserProfile(firebaseUser.uid);
          setUser(userProfile);
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        setUser(null);
        router.push("/login");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Navigation items
  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
    },
    {
      name: "Calendario",
      href: "/dashboard/calendar",
      icon: <CalendarDays className="w-5 h-5" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
    },
    {
      name: "Pacientes",
      href: "/dashboard/patients",
      icon: <Users className="w-5 h-5" />,
      roles: ["DOCTOR", "ADMIN"],
    },
    {
      name: "Doctores",
      href: "/dashboard/doctors",
      icon: <UserRound className="w-5 h-5" />,
      roles: ["PATIENT", "ADMIN"],
    },
    {
      name: "Perfil",
      href: "/dashboard/profile",
      icon: <Settings className="w-5 h-5" />,
      roles: ["PATIENT", "DOCTOR", "ADMIN"],
    },
  ];

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return null; // Let the router handle the redirect to login
  }

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  );

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 z-50">
        <div className="flex flex-col flex-grow border-r border-gray-200 bg-white pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center justify-center flex-shrink-0 px-4">
            <h1 className="text-2xl font-bold text-primary">MediAgenda</h1>
          </div>
          <div className="mt-8 flex-grow flex flex-col px-2">
            <nav className="flex-1 space-y-1">
              {filteredNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-gray-600 hover:bg-gray-100"
                    } group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors`}
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="px-2 mt-6 mb-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleSignOut}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden border-b bg-white sticky top-0 z-30">
        <div className="flex justify-between items-center px-4 py-2">
          <h1 className="text-xl font-bold text-primary">MediAgenda</h1>
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="sm:max-w-xs">
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-bold text-primary">
                  MediAgenda
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-8 flex flex-col space-y-1">
                {filteredNavItems.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-gray-600 hover:bg-gray-100"
                      } flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.icon}
                      <span className="ml-3">{item.name}</span>
                    </Link>
                  );
                })}
                <Button
                  variant="outline"
                  className="w-full justify-start mt-6"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                >
                  <LogOut className="w-5 h-5 mr-2" />
                  Cerrar Sesión
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="md:ml-64 flex-1">
        <main className="py-6 px-4 sm:px-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}