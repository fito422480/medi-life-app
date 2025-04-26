"use client";

import { useState, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthEnhanced } from "@/lib/hooks/use-auth-enhanced";
import { useI18n } from "@/i18n/config";
import { ProtectedRoute } from '@/components/auth/protected-route';
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  UserRound,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { UserRole } from "@/lib/types";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ locale: string }>();
  const pathname = usePathname();
  const { user, loading, signOut } = useAuthEnhanced();
  const t = useI18n();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Determinar la ruta activa
  const isActive = (path: string) => {
    return pathname.startsWith(`/${params.locale}/dashboard${path}`);
  };

  // Items de navegación
  const navigationItems = [
    {
      name: t("dashboard.dashboard", { count: 1 }),
      href: "",
      icon: LayoutDashboard,
      roles: ["PATIENT", "DOCTOR", "ADMIN"] as UserRole[],
    },
    {
      name: t("appointments.calendar", { count: 1 }),
      href: "/calendar",
      icon: CalendarDays,
      roles: ["PATIENT", "DOCTOR", "ADMIN"] as UserRole[],
    },
    {
      name: t("patients.patients", { count: 1 }),
      href: "/patients",
      icon: Users,
      roles: ["DOCTOR", "ADMIN"] as UserRole[],
    },
    {
      name: t("doctors.doctors", { count: 1 }),
      href: "/doctors",
      icon: UserRound,
      roles: ["PATIENT", "ADMIN"] as UserRole[],
    },
    {
      name: t("profile.profile", { count: 1 }),
      href: "/profile",
      icon: Settings,
      roles: ["PATIENT", "DOCTOR", "ADMIN"] as UserRole[],
    },
  ];

  // Filtrar elementos de navegación según el rol del usuario
  const filteredNavItems = user
    ? navigationItems.filter((item) => item.roles.includes(user.role as UserRole))
    : [];

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="flex items-center justify-center">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="ml-2">{t("common.loading", { count: 1 })}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['ADMIN', 'DOCTOR']}>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar para desktop */}
        <aside
          className={`fixed inset-y-0 z-20 hidden flex-col border-r bg-background transition-all duration-300 ease-in-out md:flex ${
            isSidebarCollapsed ? "w-[70px]" : "w-64"
          }`}
        >
          <div className="flex h-14 items-center border-b px-4">
            {!isSidebarCollapsed ? (
              <Link
                href={`/${params.locale}/dashboard`}
                className="flex items-center gap-2 font-semibold"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white">
                  M
                </div>
                <span className="text-lg">{t("common.appName", { count: 1 })}</span>
              </Link>
            ) : (
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-white">
                M
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              <ChevronDown
                className={`h-4 w-4 transform transition-transform duration-200 ${
                  isSidebarCollapsed ? "-rotate-90" : "rotate-90"
                }`}
              />
            </Button>
          </div>

          <div className="no-scrollbar flex-1 overflow-auto py-2">
            <nav className="grid gap-1 px-2">
              {filteredNavItems.map((item) => (
                <TooltipProvider key={item.href} delayDuration={0}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/${params.locale}/dashboard${item.href}`}
                        className={`group flex h-9 items-center rounded-md px-3 text-sm font-medium transition-colors ${
                          isActive(item.href)
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-accent/50"
                        } ${isSidebarCollapsed ? "justify-center" : ""}`}
                      >
                        <item.icon
                          className={`h-5 w-5 ${
                            isSidebarCollapsed ? "" : "mr-2"
                          }`}
                        />
                        {!isSidebarCollapsed && <span>{item.name}</span>}
                      </Link>
                    </TooltipTrigger>
                    {isSidebarCollapsed && (
                      <TooltipContent
                        side="right"
                        align="center"
                        className="z-50"
                      >
                        {item.name}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </TooltipProvider>
              ))}
            </nav>
          </div>

          <div className="mt-auto border-t p-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`w-full justify-start ${
                    isSidebarCollapsed ? "px-2" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback className="text-xs">
                        {user?.displayName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    {!isSidebarCollapsed && (
                      <div className="flex flex-1 items-center justify-between">
                        <span className="truncate">{user?.displayName}</span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </div>
                    )}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user?.displayName}</span>
                    <span className="text-xs font-normal text-muted-foreground">
                      {user?.email}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Link
                      href={`/${params.locale}/dashboard/profile`}
                      className="flex w-full items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("profile.profile", { count: 1 })}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("auth.logout", { count: 1 })}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </aside>

        {/* Contenido principal */}
        <div
          className={`flex-1 ${isSidebarCollapsed ? "md:ml-[70px]" : "md:ml-64"}`}
        >
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-14 items-center border-b bg-background px-4">
            {/* Botón de menú móvil */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("common.appName", { count: 1 })}</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs">
                <SheetHeader className="border-b pb-4">
                  <SheetTitle className="text-left">
                    <Link
                      href={`/${params.locale}/dashboard`}
                      className="flex items-center gap-2 font-semibold"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                        M
                      </div>
                      <span>{t("common.appName", { count: 1 })}</span>
                    </Link>
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 grid gap-2">
                  {filteredNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={`/${params.locale}/dashboard${item.href}`}
                      className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                        isActive(item.href)
                          ? "bg-accent text-accent-foreground"
                          : "text-muted-foreground hover:bg-accent/50"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <Separator className="my-4" />
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("auth.logout", { count: 1 })}</span>
                </Button>
              </SheetContent>
            </Sheet>

            {/* Búsqueda */}
            <div className="hidden w-full max-w-md md:flex">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground" />
                <Input
                  placeholder={t("common.search", { count: 1 })}
                  className="w-full pl-9"
                />
              </div>
            </div>

            {/* Acciones a la derecha */}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  3
                </span>
                <span className="sr-only">{t("notifications.notifications", { count: 1 })}</span>
              </Button>

              <LanguageSelector />
              <ThemeToggle />

              {/* Avatar para móviles */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.photoURL || ""} />
                      <AvatarFallback>
                        {user?.displayName
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span>{user?.displayName}</span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {user?.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Link
                      href={`/${params.locale}/dashboard/profile`}
                      className="flex w-full items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>{t("profile.profile", { count: 1 })}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t("auth.logout", { count: 1 })}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Contenido */}
          <main>{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
