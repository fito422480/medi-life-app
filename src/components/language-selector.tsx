"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
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
import { supportedLocales, defaultLocale } from "@/i18n/config";

export function LanguageSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams<{ locale?: string }>();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Get current locale from URL params or use default
const currentLocale = params.locale && (supportedLocales as readonly string[]).includes(params.locale) 
? params.locale 
: defaultLocale;

  // Avoid flickering during hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const changeLanguage = (locale: string) => {
    // Replace the locale in the current path
    let newPath = pathname;

    // If the path already has a locale configured
    if (supportedLocales.some((loc) => pathname.startsWith(`/${loc}`))) {
      newPath = pathname.replace(/^\/[^\/]+/, `/${locale}`);
    } else {
      newPath = `/${locale}${pathname}`;
    }

    // Navigate to the new path
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