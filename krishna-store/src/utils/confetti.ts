import confetti from 'canvas-confetti';

export function fireConfetti() {
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = ['#7C6FE9', '#34D399', '#F59E0B', '#EC4899', '#60A5FA'];

  const frame = () => {
    confetti({
      particleCount: 5,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 5,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  // Big burst in the middle
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors,
    });
  }, 300);
}
