// public/service-worker.js
// Este archivo debe ubicarse en /public para que esté disponible en la raíz del sitio

const CACHE_NAME = "mediagenda-cache-v1";

// Recursos a cachear inmediatamente en la instalación
const PRECACHE_RESOURCES = [
  "/",
  "/login",
  "/offline.html", // Página para mostrar cuando no hay conexión
  "/manifest.json",
  "/favicon.ico",
  "/icons/icon-512x512.png",
];

// Recursos de la API a cachear a medida que se solicitan
const API_CACHE_REGEX = /\/api\/((?!auth).*)$/;

// Evento de instalación: precachea recursos estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Pre-caching essential resources");
        return cache.addAll(PRECACHE_RESOURCES);
      })
      .then(() => {
        // Fuerza la activación inmediata, sin esperar a que se cierren las pestañas
        return self.skipWaiting();
      })
  );
});

// Evento de activación: limpia cachés antiguos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return name !== CACHE_NAME;
            })
            .map((name) => {
              console.log("Service Worker: Deleting old cache:", name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Toma el control de clientes no controlados (pestañas/páginas abiertas)
        return self.clients.claim();
      })
  );
});

// Estrategia de caché: Cache primero, luego red para recursos estáticos
// Red primero, luego caché para API
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Ignorar solicitudes a Firebase (las manejará Firebase SDK)
  if (
    url.hostname.includes("firebaseio.com") ||
    url.hostname.includes("googleapis.com") ||
    url.hostname.includes("firebase")
  ) {
    return;
  }

  // Para requests de autenticación, siempre ir a la red
  if (url.pathname.startsWith("/api/auth/")) {
    return;
  }

  // Para otros puntos de la API, intentar red primero, con fallback a caché
  if (API_CACHE_REGEX.test(url.pathname)) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Si la respuesta es válida, guardarla en caché
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // Si falla la red, intentar desde caché
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }

            // Si no está en caché tampoco, mostrar página offline
            return caches.match("/offline.html");
          });
        })
    );
    return;
  }

  // Para recursos estáticos y navegación, intentar caché primero, luego red
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Devolver de caché si existe
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, ir a la red
      return fetch(event.request)
        .then((response) => {
          // No cachear si la respuesta no es correcta
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clonar la respuesta para guardarla en caché
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // Si el recurso solicitado es una página, mostrar offline.html
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }

          // Para otros recursos, devolver una respuesta vacía
          return new Response("", {
            status: 408,
            headers: { "Content-Type": "text/plain" },
          });
        });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

// Sincronización en segundo plano
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-operations") {
    event.waitUntil(syncPendingOperations());
  }
});

// Función para sincronizar operaciones pendientes
async function syncPendingOperations() {
  // La implementación detallada se manejaría en el cliente
  // Aquí solo registramos que ocurrió la sincronización
  console.log("Background sync: Attempting to sync pending operations");

  // Avisar a los clientes que la sincronización fue ejecutada
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: "SYNC_EXECUTED",
      tag: "sync-pending-operations",
    });
  });
}
