import { Icon3D } from "./3DIcon";
import { 
  Wifi, Shield, Activity, Zap, Globe, Download, Upload, 
  Users, Clock, HardDrive, Laptop, Smartphone, Tv, 
  Gamepad, Router, Tablet, Speaker, Camera 
} from "lucide-react";

interface IconProps {
  size?: number;
  className?: string;
  color?: string;
}

// Network Status Icons
export const Wifi3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Wifi size={size * 0.6} />
  </Icon3D>
);

export const Shield3D = ({ size = 24, className, color = "hsl(var(--success))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Shield size={size * 0.6} />
  </Icon3D>
);

export const Activity3D = ({ size = 24, className, color = "hsl(var(--accent))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Activity size={size * 0.6} />
  </Icon3D>
);

export const Zap3D = ({ size = 24, className, color = "hsl(var(--warning))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Zap size={size * 0.6} />
  </Icon3D>
);

export const Globe3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Globe size={size * 0.6} />
  </Icon3D>
);

// Statistics Icons
export const Download3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Download size={size * 0.6} />
  </Icon3D>
);

export const Upload3D = ({ size = 24, className, color = "hsl(var(--accent))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Upload size={size * 0.6} />
  </Icon3D>
);

export const Users3D = ({ size = 24, className, color = "hsl(var(--success))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Users size={size * 0.6} />
  </Icon3D>
);

export const Clock3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Clock size={size * 0.6} />
  </Icon3D>
);

export const HardDrive3D = ({ size = 24, className, color = "hsl(var(--muted-foreground))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <HardDrive size={size * 0.6} />
  </Icon3D>
);

// Device Icons
export const Laptop3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Laptop size={size * 0.6} />
  </Icon3D>
);

export const Smartphone3D = ({ size = 24, className, color = "hsl(var(--accent))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Smartphone size={size * 0.6} />
  </Icon3D>
);

export const Tv3D = ({ size = 24, className, color = "hsl(var(--success))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Tv size={size * 0.6} />
  </Icon3D>
);

export const Gamepad3D = ({ size = 24, className, color = "hsl(var(--warning))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Gamepad size={size * 0.6} />
  </Icon3D>
);

export const Router3D = ({ size = 24, className, color = "hsl(var(--primary))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Router size={size * 0.6} />
  </Icon3D>
);

export const Tablet3D = ({ size = 24, className, color = "hsl(var(--accent))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Tablet size={size * 0.6} />
  </Icon3D>
);

export const Speaker3D = ({ size = 24, className, color = "hsl(var(--success))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Speaker size={size * 0.6} />
  </Icon3D>
);

export const Camera3D = ({ size = 24, className, color = "hsl(var(--warning))" }: IconProps) => (
  <Icon3D size={size} className={className} color={color}>
    <Camera size={size * 0.6} />
  </Icon3D>
);