interface MavisIconProps {
  className?: string;
  size?: number;
}

export default function MavisShuttleIcon({ className = '', size = 52 }: MavisIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none transition-transform duration-300 drop-shadow-md ${className}`}
    >
      <defs>
        {/* Mavis 350 Neon Yellow Shuttle Skirt Gradient */}
        <linearGradient id="mavisSkirt" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFF33" />
          <stop offset="45%" stopColor="#E2F500" />
          <stop offset="100%" stopColor="#9ABF00" />
        </linearGradient>

        {/* Natural Cork Base Gradient */}
        <linearGradient id="corkBase" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F5ECE1" />
          <stop offset="100%" stopColor="#D2BF9F" />
        </linearGradient>

        {/* Mavis 350 Yonex Speed Indicator Green Ring */}
        <linearGradient id="yonexGreenRing" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#00A859" />
          <stop offset="100%" stopColor="#007F43" />
        </linearGradient>

        {/* Sport Sunglasses Gradient */}
        <linearGradient id="shadesGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00F0FF" />
          <stop offset="50%" stopColor="#0066FF" />
          <stop offset="100%" stopColor="#7000FF" />
        </linearGradient>
      </defs>

      {/* 1. MAVIS 350 NYLON SKIRT (Flared cone with lattice mesh) */}
      <path
        d="M26 46 L10 16 C35 10, 65 10, 90 16 L74 46 Z"
        fill="url(#mavisSkirt)"
        stroke="#84A300"
        strokeWidth="1.5"
      />

      {/* Nylon Ribs & Mesh Pattern */}
      <path d="M22 28 Q 50 33 78 28" stroke="#FFFFFF" strokeWidth="1.2" strokeOpacity="0.85" fill="none" />
      <path d="M16 21 Q 50 26 84 21" stroke="#A8C700" strokeWidth="1" strokeDasharray="2,2" fill="none" />
      <path d="M34 14 L38 46" stroke="#8CAE00" strokeWidth="1" />
      <path d="M50 13 L50 46" stroke="#8CAE00" strokeWidth="1.2" />
      <path d="M66 14 L62 46" stroke="#8CAE00" strokeWidth="1" />

      {/* 2. MAVIS 350 TAPE RING (Yonex Speed Band around neck) */}
      <rect x="29" y="46" width="42" height="6" rx="2" fill="url(#yonexGreenRing)" />

      {/* 3. CORK BASE (Dome-shaped head) */}
      <path
        d="M30 52 C30 76, 70 76, 70 52 Z"
        fill="url(#corkBase)"
        stroke="#BFA98F"
        strokeWidth="1.5"
      />

      {/* 4. FUNNY AI FACE */}
      {/* Sporty Cool Sunglasses */}
      <rect x="33" y="55" width="15" height="10" rx="3" fill="url(#shadesGradient)" stroke="#111" strokeWidth="1.2" />
      <rect x="52" y="55" width="15" height="10" rx="3" fill="url(#shadesGradient)" stroke="#111" strokeWidth="1.2" />
      <path d="M48 58 L52 58" stroke="#111" strokeWidth="1.5" />
      
      {/* Glare on Sunglasses */}
      <path d="M35 57 L41 57" stroke="#FFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.85" />
      <path d="M54 57 L60 57" stroke="#FFF" strokeWidth="1" strokeLinecap="round" strokeOpacity="0.85" />

      {/* Cheeky Big Grin */}
      <path d="M42 67 Q 50 73 58 67" stroke="#C0392B" strokeWidth="1.8" fill="#E74C3C" strokeLinecap="round" />
      
      {/* Cute Rosy Blushing Cheeks */}
      <circle cx="34" cy="66" r="2.5" fill="#FF8A80" opacity="0.6" />
      <circle cx="66" cy="66" r="2.5" fill="#FF8A80" opacity="0.6" />

      {/* 5. GAMER / COACH HEADSET WITH MICROPHONE */}
      <path d="M27 57 C27 46, 73 46, 73 57" stroke="#1F2937" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <rect x="25" y="54" width="4" height="9" rx="2" fill="#E11D48" />
      <rect x="71" y="54" width="4" height="9" rx="2" fill="#E11D48" />
      <path d="M72 61 Q 72 70 63 71" stroke="#1F2937" strokeWidth="1.5" fill="none" />
      <circle cx="62" cy="71" r="2.2" fill="#10B981" />

      {/* 6. AI ANTENNA SPARKLES */}
      <circle cx="50" cy="7" r="2.5" fill="#FFD700" />
      <path d="M50 10 L50 12" stroke="#FFD700" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
