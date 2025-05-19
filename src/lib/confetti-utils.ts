
import confetti from "canvas-confetti";

// Random confetti effect - basic burst
export const fireRandomConfetti = (options?: confetti.Options | React.MouseEvent<HTMLButtonElement>) => {
  // If event is provided, use it to determine origin
  let origin;
  
  if (options && 'currentTarget' in options) {
    const event = options;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    origin = {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    };
    options = { origin };
  }
  
  const defaultOptions = {
    particleCount: 100,
    spread: 70,
    colors: ["#9b87f5", "#7E69AB", "#D946EF", "#0EA5E9", "#F97316"],
  };
  
  // Randomly choose between different confetti effects
  const effectType = Math.floor(Math.random() * 4); // 0-3
  
  switch (effectType) {
    case 0: // Basic burst
      confetti({
        ...defaultOptions,
        ...options as confetti.Options
      });
      // Add a second burst for longer effect
      setTimeout(() => {
        confetti({
          ...defaultOptions,
          ...options as confetti.Options
        });
      }, 700);
      break;
      
    case 1: // Fireworks
      const duration = 2.5 * 1000; // Increased from 1 to 2.5 seconds
      const animationEnd = Date.now() + duration;
      const defaults = { 
        startVelocity: 30, 
        spread: 360, 
        ticks: 60, 
        zIndex: 0,
        ...(options as confetti.Options)
      };
      
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();
        
        if (timeLeft <= 0) {
          return clearInterval(interval);
        }
        
        const particleCount = 50 * (timeLeft / duration);
        confetti({
          ...defaults,
          particleCount,
          origin: (options as confetti.Options)?.origin || { x: 0.5, y: 0.5 },
          colors: defaultOptions.colors,
        });
      }, 250);
      break;
      
    case 2: // Side cannons
      const end = Date.now() + 2.5 * 1000; // Increased from 1 to 2.5 seconds
      
      const frame = () => {
        if (Date.now() > end) return;
        
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.5 },
          colors: defaultOptions.colors,
          ...(options as confetti.Options)
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.5 },
          colors: defaultOptions.colors,
          ...(options as confetti.Options)
        });
        
        requestAnimationFrame(frame);
      };
      
      frame();
      break;
      
    case 3: // Stars
      const starDefaults = {
        spread: 360,
        ticks: 75, // Increased from 50 to 75 for longer-lasting stars
        gravity: 0,
        decay: 0.94,
        startVelocity: 30,
        colors: defaultOptions.colors,
        origin: (options as confetti.Options)?.origin || { x: 0.5, y: 0.5 },
        ...(options as confetti.Options)
      };
      
      confetti({
        ...starDefaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });
      
      confetti({
        ...starDefaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
      
      // Add a second wave of stars for longer effect
      setTimeout(() => {
        confetti({
          ...starDefaults,
          particleCount: 20,
          scalar: 0.9,
          shapes: ["star"],
        });
        
        confetti({
          ...starDefaults,
          particleCount: 5,
          scalar: 0.6,
          shapes: ["circle"],
        });
      }, 600);
      break;
  }
};
