'use client';

import { useEffect, useState } from "react";

interface Particle {
    x: number;
    y: number;
    size: number;
    duration: number;
}

export default function ParticleBackground() {
    const [particles, setParticles] = useState<Particle[]>([]);

    useEffect(() => {
        // generate particles client-side to avoid SSR hydration mismatch
        setParticles(
            Array.from({ length: 16 }).map(() => ({
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: 6 + Math.random() * 6,
                duration: 8 + Math.random() * 6,
            }))
        );
    }, []);

    return (
        <>
            <div className="bg-grid" />
            <div className="bg-glow glow-1" />
            <div className="bg-glow glow-2" />
            <div className="particle-field">
                {particles.map((p, i) => (
                    <span
                        key={i}
                        className="particle"
                        style={{
                            left: `${p.x}%`,
                            top: `${p.y}%`,
                            width: p.size,
                            height: p.size,
                            animationDuration: `${p.duration}s`,
                        }}
                    />
                ))}
            </div>
        </>
    );
}
