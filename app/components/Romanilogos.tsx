// SVG Romani Flag Components - Perfect Quality, Any Size

export function RomaniFlag({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 300 200" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Blue top half */}
      <rect width="300" height="100" fill="#0066CC" />
      
      {/* Green bottom half */}
      <rect y="100" width="300" height="100" fill="#007A3D" />
      
      {/* Red chakra wheel in center */}
      <g transform="translate(150, 100)">
        {/* Outer red circle */}
        <circle r="45" fill="#DC143C" />
        
        {/* Inner gold circle */}
        <circle r="35" fill="none" stroke="#FFD700" strokeWidth="3" />
        
        {/* 16 spokes */}
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x = 35 * Math.cos(angle);
          const y = 35 * Math.sin(angle);
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#FFD700"
              strokeWidth="3"
              strokeLinecap="round"
            />
          );
        })}
        
        {/* Center dot */}
        <circle r="8" fill="#FFD700" />
      </g>
    </svg>
  );
}

export function RomaniCouncilLogo({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 400 300" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Horse head silhouette */}
      <g transform="translate(200, 150)">
        <path
          d="M 0,-60 Q -20,-80 -40,-70 Q -50,-50 -45,-30 Q -40,-10 -30,0 Q -20,10 -10,15 Q 0,20 10,15 Q 20,10 25,0 Q 30,-15 25,-30 Q 20,-50 10,-65 Q 0,-75 0,-60 Z"
          fill="#1e3a8a"
          stroke="#1e3a8a"
          strokeWidth="2"
        />
      </g>
      
      {/* Chakra wheel below horse */}
      <g transform="translate(200, 200)">
        <circle r="35" fill="none" stroke="#DC143C" strokeWidth="4" />
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x1 = 15 * Math.cos(angle);
          const y1 = 15 * Math.sin(angle);
          const x2 = 35 * Math.cos(angle);
          const y2 = 35 * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#DC143C"
              strokeWidth="3"
            />
          );
        })}
        <circle r="15" fill="#DC143C" />
      </g>
      
      {/* Text */}
      <text
        x="200"
        y="40"
        textAnchor="middle"
        fill="#6366f1"
        fontSize="32"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        Roma Council of Ukraine
      </text>
    </svg>
  );
}

export function RRUFlag({ className = "w-full h-full" }) {
  return (
    <svg viewBox="0 0 600 400" className={className} xmlns="http://www.w3.org/2000/svg">
      {/* Blue top half */}
      <rect width="600" height="200" fill="#0066CC" />
      
      {/* Green bottom half */}
      <rect y="200" width="600" height="200" fill="#007A3D" />
      
      {/* Golden horse head (left side) */}
      <g transform="translate(150, 100)">
        <path
          d="M 0,-40 Q -15,-55 -30,-50 Q -38,-35 -35,-20 Q -30,-5 -20,5 Q -10,15 0,18 Q 10,15 18,5 Q 25,0 25,-15 Q 20,-35 10,-48 Q 0,-55 0,-40 Z"
          fill="#FFD700"
          stroke="#FFD700"
          strokeWidth="2"
        />
      </g>
      
      {/* Large red chakra wheel (center) */}
      <g transform="translate(300, 200)">
        <circle r="80" fill="#DC143C" />
        <circle r="65" fill="none" stroke="#FFD700" strokeWidth="4" />
        {[...Array(16)].map((_, i) => {
          const angle = (i * 22.5 * Math.PI) / 180;
          const x = 65 * Math.cos(angle);
          const y = 65 * Math.sin(angle);
          return (
            <line
              key={i}
              x1="0"
              y1="0"
              x2={x}
              y2={y}
              stroke="#FFD700"
              strokeWidth="4"
              strokeLinecap="round"
            />
          );
        })}
        <circle r="15" fill="#FFD700" />
      </g>
      
      {/* RRU text */}
      <text
        x="500"
        y="120"
        fill="#FFD700"
        fontSize="80"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
      >
        RRU
      </text>
    </svg>
  );
}

// How to use in your component:
/*
import { RomaniFlag, RomaniCouncilLogo, RRUFlag } from './RomaniLogos';

export default function HomePage() {
  return (
    <div>
      <RomaniCouncilLogo className="w-full max-w-md" />
      
      <div className="grid grid-cols-2 gap-4">
        <RomaniFlag className="w-full" />
        <RomaniFlag className="w-full" />
      </div>
      
      <RRUFlag className="w-full max-w-2xl" />
    </div>
  );
}
*/