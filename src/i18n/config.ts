import { createI18n } from "next-international";

export const {
  useI18n, // Cliente
  useScopedI18n, // Para utilizar secciones específicas de traducciones
  I18nProvider, // Proveedor para el cliente
  // getI18n, // Servidor
  // getScopedI18n, // Servidor
  //getCurrentLocale, // Obtener locale actual
  //getStaticParams, // Obtener parámetros estáticos para rutas i18n
} = createI18n({
  es: () => import("./locales/es"),
  en: () => import("./locales/en"),
});

// Locale predeterminado
export const defaultLocale = "es";

// Lista de locales soportados
export const supportedLocales = ["es", "en"];

// Devuelve true si el locale proporcionado es válido
export function isValidLocale(locale: string): boolean {
  return supportedLocales.includes(locale);
}
