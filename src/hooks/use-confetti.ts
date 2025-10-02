import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export const useConfetti = () => {
  const triggerConfetti = useCallback((type: 'success' | 'celebration' | 'fireworks' = 'success') => {
    const count = 200;
    const defaults = {
      origin: { y: 0.7 }
    };

    switch (type) {
      case 'success':
        confetti({
          ...defaults,
          particleCount: count,
          spread: 70,
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        });
        break;
      
      case 'celebration':
        confetti({
          ...defaults,
          particleCount: count,
          spread: 100,
          colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57']
        });
        break;
      
      case 'fireworks':
        // Multiple bursts for fireworks effect
        const duration = 3000;
        const animationEnd = Date.now() + duration;
        const defaults_fireworks = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: NodeJS.Timeout = setInterval(() => {
          const timeLeft = animationEnd - Date.now();

          if (timeLeft <= 0) {
            return clearInterval(interval);
          }

          const particleCount = 50 * (timeLeft / duration);
          
          confetti({
            ...defaults_fireworks,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
          });
          confetti({
            ...defaults_fireworks,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
          });
        }, 250);
        break;
    }
  }, []);

  return { triggerConfetti };
};
