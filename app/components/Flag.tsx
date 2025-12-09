type FlagProps = {
  src: string;        
  alt?: string;
  className?: string; 
};

export default function Flag({ src, alt = "", className = "" }: FlagProps) {
  const isVideo = src.endsWith(".mp4") || src.endsWith(".webm");

  return (
    <div className={`overflow-hidden ${className}`}>
      {isVideo ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <img 
          src={src} 
          alt={alt} 
          className="w-full h-full object-cover" 
        />
      )}
    </div>
  );
}
