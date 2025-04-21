"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const changeLanguage = (locale: string) => {
    let newPath = pathname;

    // Si la ruta ya tiene un locale configurado
    if (/^\/[^/]+/.test(pathname)) {
      newPath = pathname.replace(/^\/[^/]+/, `/${locale}`);
    } else {
      newPath = `/${locale}${pathname}`;
    }

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
        {Object.entries(languageNames).map(([locale, name]) => (
          <DropdownMenuItem
            key={locale}
            onClick={() => changeLanguage(locale)}
          >
            {name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );