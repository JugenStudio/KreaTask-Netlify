"use client";

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

interface SplitTextProps {
  text: string;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function SplitText({ text, delay = 100, duration = 0.6, className = "" }: SplitTextProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chars = containerRef.current?.children;
    if (chars) {
      gsap.fromTo(chars,
        {
          opacity: 0,
          y: 20,
        },
        {
          opacity: 1,
          y: 0,
          duration: duration,
          stagger: {
            each: delay / 1000,
            from: "start"
          },
          ease: "power2.out"
        }
      );
    }
  }, [text, delay, duration]);

  return (
    <div ref={containerRef} className={`split-text-container ${className}`} aria-label={text}>
      {text.split("").map((char, index) => (
        <span
          key={index}
          style={{ display: 'inline-block', opacity: 0 }}
          aria-hidden="true"
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </div>
  );
}
