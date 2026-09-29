import React, { useState } from 'react';

export type BackgroundVariant =
  | 'clean-library'
  | 'data-network'
  | 'campus-quad'
  | 'learning-hub'
  | 'library-hall'
  | 'cyber-academic'
  | 'campus-hero'
  | 'student-portal'
  | 'lecture-hall'
  | 'subtle-mesh';

export type OverlayStyle =
  | 'bg-slate-900/70'
  | 'academic-contrast'
  | 'dark-immersive'
  | 'light-subtle'
  | 'indigo-glass'
  | 'slate-minimal';

interface AttractiveBackgroundProps {
  variant?: BackgroundVariant;
  className?: string;
  customImageUrl?: string;
  overlayStyle?: OverlayStyle;
  imageOpacity?: number; // 0 to 1, default 0.80 behind bg-slate-900/70
  opacity?: number;
}

export const PHOTO_PRESETS: Record<BackgroundVariant, { url: string; title: string; category: string }> = {
  'clean-library': {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80',
    title: 'Clean Modern Academic Library',
    category: 'Library'
  },
  'library-hall': {
    url: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?auto=format&fit=crop&w=2000&q=80',
    title: 'University Library Reading Atrium',
    category: 'Library'
  },
  'data-network': {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    title: 'Digital Data & Neural Learning Network',
    category: 'Digital Network'
  },
  'cyber-academic': {
    url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=2000&q=80',
    title: 'AI & Data Science Laboratory Network',
    category: 'Digital Network'
  },
  'campus-quad': {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80',
    title: 'University Campus & Historic Quad',
    category: 'Campus'
  },
  'campus-hero': {
    url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=2000&q=80',
    title: 'University Campus & Historic Quad',
    category: 'Campus'
  },
  'learning-hub': {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80',
    title: 'Collaborative Learning & Innovation Hub',
    category: 'Students'
  },
  'student-portal': {
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=2000&q=80',
    title: 'Collaborative Learning & Innovation Hub',
    category: 'Students'
  },
  'lecture-hall': {
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&w=2000&q=80',
    title: 'Modern Academic Lecture Amphitheater',
    category: 'Auditorium'
  },
  'subtle-mesh': {
    url: '',
    title: 'Clean Minimalist Gradient Mesh',
    category: 'Abstract'
  }
};

export const AttractiveBackground: React.FC<AttractiveBackgroundProps> = ({
  variant = 'clean-library',
  className = '',
  customImageUrl,
  overlayStyle = 'bg-slate-900/70',
  imageOpacity = 0.85,
  opacity
}) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = customImageUrl || PHOTO_PRESETS[variant]?.url;
  const effectiveOpacity = opacity !== undefined ? opacity : imageOpacity;

  if (variant === 'subtle-mesh' || !imageUrl) {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-100/60 rounded-full blur-3xl -z-10" />
      </div>
    );
  }

  // Determine overlay class based on style
  const getOverlayClass = () => {
    switch (overlayStyle) {
      case 'bg-slate-900/70':
        // Specifically requested CSS overlay: bg-slate-900/70 with backdrop blur for perfect readability
        return 'bg-slate-900/70 backdrop-blur-[1.5px]';
      case 'light-subtle':
        return 'bg-gradient-to-b from-white/94 via-white/88 to-slate-50/96';
      case 'indigo-glass':
        return 'bg-gradient-to-r from-indigo-950/92 via-slate-900/85 to-indigo-900/90';
      case 'slate-minimal':
        return 'bg-gradient-to-br from-slate-900/92 via-slate-950/88 to-slate-900/92';
      case 'dark-immersive':
        return 'bg-gradient-to-r from-slate-950/96 via-slate-950/88 to-indigo-950/92';
      case 'academic-contrast':
      default:
        return 'bg-slate-900/70 backdrop-blur-[1.5px]';
    }
  };

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {/* 1. Underlying Solid Dark Foundation */}
      <div className="absolute inset-0 bg-slate-950" />

      {/* 2. Real High-Resolution Academic Themed Background Picture */}
      {!imageError && (
        <img
          src={imageUrl}
          alt="Academic Learning Environment"
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          style={{ opacity: effectiveOpacity }}
          className="absolute inset-0 w-full h-full object-cover object-center scale-105 transform motion-safe:animate-in motion-safe:fade-in duration-700"
        />
      )}

      {/* 3. Effective CSS Overlay (e.g. bg-slate-900/70) ensuring text is perfectly readable */}
      <div className={`absolute inset-0 ${getOverlayClass()}`} />

      {/* 4. Fine Academic Holographic Grid Matrix */}
      <svg
        className={`absolute inset-0 w-full h-full ${
          overlayStyle === 'light-subtle' ? 'opacity-10' : 'opacity-15'
        }`}
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 800"
      >
        <defs>
          <pattern id="academic-grid-pattern" width="48" height="48" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.2" fill={overlayStyle === 'light-subtle' ? '#4f46e5' : '#38bdf8'} fillOpacity="0.4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#academic-grid-pattern)" />
      </svg>
    </div>
  );
};
