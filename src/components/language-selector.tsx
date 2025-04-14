"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getCurrentLocale, supportedLocales } from "@/i18n/config";

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const currentLocale = getCurrentLocale();
  const [mounted, setMounted] = useState(false);

  // Evitar parpadeo durante la hidratación
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const changeLanguage = (locale: string) => {
    // Reemplazar el locale en la ruta actual
    let newPath = pathname;

    // Si la ruta ya tiene un locale configurado
    if (supportedLocales.some((loc) => pathname.startsWith(`/${loc}`))) {
      newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    } else {
      newPath = `/${locale}${pathname}`;
    }

    // Navegar a la nueva ruta
    router.push(newPath);
  };

  const languageNames = {
    en: "English",
    es: "Español",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full w-8 h-8"
          aria-label="Select language"
        >
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {supportedLocales.map((locale) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
            className={locale === currentLocale ? "font-bold" : ""}
          >
            {languageNames[locale as keyof typeof languageNames]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
