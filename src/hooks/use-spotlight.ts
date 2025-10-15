
import { useEffect } from 'react';

// A custom hook to manage the spotlight effect on cards
export const useSpotlightEffect = () => {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('.card-spotlight');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Calculate distance from center to determine intensity
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const maxDistance = Math.sqrt(centerX ** 2 + centerY ** 2);
        
        // Intensity is higher when the cursor is closer to the card
        const intensity = Math.max(0, 1 - (distance / (maxDistance * 1.5)));

        const htmlCard = card as HTMLElement;
        htmlCard.style.setProperty('--glow-x', `${x}px`);
        htmlCard.style.setProperty('--glow-y', `${y}px`);
        htmlCard.style.setProperty('--glow-intensity', `${intensity * 0.10}`); // Adjust multiplier for brightness
        htmlCard.style.setProperty('--glow-hue', `213`); // KreaTask Blue
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      // Clean up styles when component unmounts
      document.querySelectorAll('.card-spotlight').forEach(card => {
        const htmlCard = card as HTMLElement;
        htmlCard.style.removeProperty('--glow-x');
        htmlCard.style.removeProperty('--glow-y');
        htmlCard.style.removeProperty('--glow-intensity');
        htmlCard.style.removeProperty('--glow-hue');
      });
    };
  }, []);
};
