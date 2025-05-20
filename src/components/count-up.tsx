"use client";

import { useEffect, useRef, useState } from "react";

interface CountUpProps {
  end: number;
  duration?: number;
  className?: string;
  formatter?: (value: number) => string;
}

export function CountUp({
  end,
  duration = 1000,
  className = "",
  formatter = (value: number) => value.toLocaleString(),
}: CountUpProps) {
  const [count, setCount] = useState(0);
  const prevEndRef = useRef(0);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If end is not a valid number, just display it directly
    if (isNaN(end) || end === null || end === undefined) {
      return;
    }

    // Store the previous end value to animate from
    const startValue = prevEndRef.current;
    prevEndRef.current = end;

    // Reset animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    // Animation function
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      const currentCount = Math.floor(startValue + (end - startValue) * easedProgress);
      setCount(currentCount);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we end exactly at the target value
        setCount(end);
        startTimeRef.current = null;
        animationRef.current = null;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [end, duration]);

  return <span className={className}>{formatter(count)}</span>;
}
