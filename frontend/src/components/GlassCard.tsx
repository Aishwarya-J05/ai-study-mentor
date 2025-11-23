// src/components/GlassCard.tsx

import React, { type ReactNode } from 'react'; // <-- FIX IS HERE

// Define the component's props
interface GlassCardProps {
    children: ReactNode; // Explicitly type 'children'
    className?: string;  // Define 'className' as optional string
}

export default function GlassCard({ children, className = '' }: GlassCardProps) {
    return (
        <div className={`
            p-8 md:p-10 lg:p-12 
            bg-white/5 backdrop-blur-xl 
            rounded-3xl 
            shadow-2xl shadow-indigo-500/10 
            border border-white/10 
            text-center
            ${className}
        `}>
            {children}
        </div>
    );
}