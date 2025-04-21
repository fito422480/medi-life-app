"use client";

import { useState, useEffect } from "react";

/**
 * Hook para animar un contador numérico
 *
 * @param target - El valor objetivo final
 * @param durationMs - Duración de la animación en milisegundos
 * @param startDelay - Retraso antes de comenzar la animación en milisegundos
 * @returns El valor actual del contador
 */
export function useCounter(
  target: number,
  durationMs = 1000,
  startDelay = 0
): number {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Si el target es 0, establecer directamente
    if (target === 0) {
      setCount(0);
      return;
    }

    // Calcular el incremento por frame para lograr una animación suave
    const steps = Math.max(1, durationMs / 16); // 16ms es aproximadamente 60fps
    const increment = target / steps;

    let currentCount = 0;
    let animationFrameId: number;

    const animate = () => {
      // Incrementar el contador
      currentCount += increment;

      // Si hemos llegado al objetivo o lo superamos, establecer el valor final
      if (currentCount >= target) {
        setCount(target);
        return;
      }

      // Establecer el valor actual redondeado
      setCount(Math.floor(currentCount));

      // Solicitar el siguiente frame de animación
      animationFrameId = requestAnimationFrame(animate);
    };

    // Iniciar la animación después del retraso especificado
    const timeoutId = setTimeout(() => {
      animate();
    }, startDelay);

    // Limpieza al desmontar o cuando cambia el valor objetivo
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [target, durationMs, startDelay]);

  return count;
}
