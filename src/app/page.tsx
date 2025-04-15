import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  UserRound,
  CheckCircle,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b bg-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">MediAgenda</div>
          <nav className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary">
              Funcionalidades
            </a>
            <a href="#benefits" className="text-gray-600 hover:text-primary">
              Beneficios
            </a>
            <a href="#faq" className="text-gray-600 hover:text-primary">
              FAQ
            </a>
          </nav>
          <div className="flex space-x-4">
            <Button asChild variant="outline">
              <Link href="/login">Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Registrarse</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Agendar tus citas médicas nunca fue tan sencillo
            </h1>
            <p className="text-lg text-gray-600">
              MediAgenda es la plataforma que conecta pacientes y médicos para
              una gestión eficiente de citas médicas. Agenda, gestiona y recibe
              recordatorios, todo en un solo lugar.
            </p>
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
              <Button asChild size="lg" className="text-base">
                <Link href="/register">Crear una cuenta</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link href="/login">
                  Ya tengo una cuenta
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
          <div className="rounded-xl bg-white p-6 shadow-xl border md:ml-auto md:w-5/6">
            <Image
              src="https://images.unsplash.com/photo-1505751172876-fa1923c5c528?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxzZWFyY2h8NXx8ZG9jdG9yfGVufDB8fDB8fA%3D%3D&auto=format&fit=crop&w=500&q=60"
              alt="Doctor con paciente"
              width={500}
              height={300}
              className="rounded-lg"
            />
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">
              Funcionalidades Principales
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Diseñado tanto para pacientes como para médicos, MediAgenda ofrece
              todas las herramientas necesarias para una gestión eficiente de
              citas médicas.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <CalendarDays className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Agenda Inteligente</h3>
              <p className="text-gray-600">
                Programa y gestiona tus citas médicas con un calendario
                intuitivo que muestra la disponibilidad en tiempo real.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                Recordatorios Automáticos
              </h3>
              <p className="text-gray-600">
                Recibe notificaciones y recordatorios de tus próximas citas para
                no olvidar ninguna visita importante.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl">
              <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                <UserRound className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Historial Médico</h3>
              <p className="text-gray-600">
                Accede a tu historial médico completo y comparte información
                relevante con tus médicos de forma segura.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits" className="py-20 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Beneficios</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              MediAgenda mejora la experiencia tanto para pacientes como para
              profesionales de la salud.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-xl font-semibold mb-6">Para Pacientes</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Encuentra al especialista adecuado y programa citas
                    fácilmente, sin llamadas telefónicas.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Recibe recordatorios automáticos para no olvidar tus citas
                    programadas.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Accede a tu historial médico, resultados y recetas en un
                    solo lugar.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Evita tiempos de espera innecesarios con horarios precisos.
                  </p>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-6">Para Profesionales</h3>
              <ul className="space-y-4">
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Gestiona tu agenda de manera eficiente y reduce
                    cancelaciones de última hora.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Accede al historial médico completo de tus pacientes para
                    ofrecer un mejor servicio.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Automatiza recordatorios y comunicación con pacientes para
                    mejorar la asistencia.
                  </p>
                </li>
                <li className="flex">
                  <CheckCircle className="h-6 w-6 text-green-500 mr-3 flex-shrink-0" />
                  <p>
                    Incrementa tu visibilidad y alcanza nuevos pacientes a
                    través de la plataforma.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="py-20 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Preguntas Frecuentes</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Respuestas a las dudas más comunes sobre nuestra plataforma.
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-6">
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                ¿Cómo funciona MediAgenda?
              </h3>
              <p className="text-gray-600">
                MediAgenda conecta pacientes con médicos a través de una
                plataforma digital. Los pacientes pueden buscar especialistas,
                ver su disponibilidad y programar citas. Los médicos pueden
                gestionar su agenda y acceder a la información médica relevante
                de sus pacientes.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                ¿Tiene algún costo usar la plataforma?
              </h3>
              <p className="text-gray-600">
                Para pacientes, el uso de la plataforma es completamente
                gratuito. Los profesionales médicos tienen un período de prueba
                gratuito, después del cual pueden elegir entre diferentes planes
                de suscripción según sus necesidades.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                ¿Es segura mi información médica?
              </h3>
              <p className="text-gray-600">
                Absolutamente. La privacidad y seguridad de los datos son
                nuestra prioridad. Utilizamos encriptación de extremo a extremo
                y cumplimos con todas las regulaciones de protección de datos
                médicos aplicables.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-2">
                ¿Puedo cancelar o reprogramar mis citas?
              </h3>
              <p className="text-gray-600">
                Sí, puedes cancelar o reprogramar tus citas directamente desde
                la plataforma, respetando la política de cancelación de cada
                médico (generalmente 24-48 horas antes de la cita programada).
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Comienza a usar MediAgenda hoy mismo
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Únete a miles de pacientes y profesionales que ya han mejorado su
            experiencia en servicios de salud.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button
              asChild
              size="lg"
              variant="secondary"
              className="text-primary"
            >
              <Link href="/register">Crear cuenta gratuita</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white/10"
            >
              <Link href="/login">Iniciar sesión</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">MediAgenda</h3>
              <p className="text-gray-400">
                La plataforma líder en gestión de citas médicas que conecta
                pacientes con profesionales de la salud.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="#features"
                    className="text-gray-400 hover:text-white"
                  >
                    Funcionalidades
                  </a>
                </li>
                <li>
                  <a
                    href="#benefits"
                    className="text-gray-400 hover:text-white"
                  >
                    Beneficios
                  </a>
                </li>
                <li>
                  <a href="#faq" className="text-gray-400 hover:text-white">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Soporte
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Términos de Servicio
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Política de Privacidad
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-400 hover:text-white">
                    Centro de Ayuda
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="mailto:info@mediagenda.com"
                    className="text-gray-400 hover:text-white"
                  >
                    info@mediagenda.com
                  </a>
                </li>
                <li>
                  <span className="text-gray-400">+1 (555) 123-4567</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>
              &copy; {new Date().getFullYear()} MediAgenda. Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
