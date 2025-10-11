
"use client";

import { useEffect } from 'react';
import { useIsMobile } from './use-mobile';

const SPOTLIGHT_RADIUS = 400; // Radius of the spotlight effect
const FADE_DISTANCE = SPOTLIGHT_RADIUS * 0.75; // Distance at which the glow starts to fade
const PROXIMITY = SPOTLIGHT_RADIUS * 0.5; // Distance at which glow is at max

/**
 * Custom hook to apply a spotlight glow effect to elements with the 'card-spotlight' class.
 * The glow follows the mouse cursor and intensifies when the cursor is near an element.
 * The effect is disabled on mobile devices.
 */
export function useSpotlightEffect() {
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) {
      return; // Do not apply effect on mobile devices
    }

    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.card-spotlight');

      cards.forEach(card => {
        const cardElement = card as HTMLElement;
        const rect = cardElement.getBoundingClientRect();
        
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const distance = Math.hypot(e.clientX - centerX, e.clientY - centerY);
        const effectiveDistance = Math.max(0, distance - (Math.max(rect.width, rect.height) / 2));

        let glowIntensity = 0;
        if (effectiveDistance <= PROXIMITY) {
          glowIntensity = 1;
        } else if (effectiveDistance <= FADE_DISTANCE) {
          glowIntensity = (FADE_DISTANCE - effectiveDistance) / (FADE_DISTANCE - PROXIMITY);
        }

        const relativeX = ((e.clientX - rect.left) / rect.width) * 100;
        const relativeY = ((e.clientY - rect.top) / rect.height) * 100;

        cardElement.style.setProperty('--glow-x', `${relativeX}%`);
        cardElement.style.setProperty('--glow-y', `${relativeY}%`);
        cardElement.style.setProperty('--glow-intensity', glowIntensity.toString());
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Clean up styles when the component unmounts or effect is disabled
      document.querySelectorAll('.card-spotlight').forEach(card => {
        const cardElement = card as HTMLElement;
        cardElement.style.removeProperty('--glow-x');
        cardElement.style.removeProperty('--glow-y');
        cardElement.style.removeProperty('--glow-intensity');
      });
    };
  }, [isMobile]);
}

    