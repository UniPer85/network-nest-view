import { ReactNode } from "react";

interface Icon3DProps {
  children: ReactNode;
  size?: number;
  className?: string;
  color?: string;
}

export const Icon3D = ({ children, size = 24, className = "", color = "hsl(var(--primary))" }: Icon3DProps) => {
  return (
    <div 
      className={`relative inline-block ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {/* Base platform */}
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: `linear-gradient(145deg, 
            hsl(var(--muted)) 0%, 
            hsl(var(--muted-foreground) / 0.1) 50%, 
            hsl(var(--muted)) 100%)`,
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.1),
            inset -2px -2px 4px rgba(0,0,0,0.1),
            2px 2px 8px rgba(0,0,0,0.2)
          `,
          transform: 'perspective(100px) rotateX(20deg) rotateY(-10deg)',
          transformStyle: 'preserve-3d',
        }}
      />
      
      {/* Icon content */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          color: color,
          filter: `
            drop-shadow(0 2px 4px rgba(0,0,0,0.3))
            drop-shadow(0 0 8px ${color}40)
          `,
          transform: 'translateZ(4px)',
        }}
      >
        <div
          style={{
            background: `linear-gradient(145deg, 
              ${color} 0%, 
              ${color}CC 30%,
              ${color}FF 70%,
              ${color}AA 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            fontSize: size * 0.6,
            fontWeight: 'bold',
          }}
        >
          {children}
        </div>
      </div>
      
      {/* Highlight overlay */}
      <div 
        className="absolute inset-0 rounded-lg opacity-30"
        style={{
          background: `linear-gradient(135deg, 
            rgba(255,255,255,0.3) 0%, 
            transparent 50%, 
            rgba(255,255,255,0.1) 100%)`,
          transform: 'perspective(100px) rotateX(20deg) rotateY(-10deg) translateZ(1px)',
        }}
      />
    </div>
  );
};