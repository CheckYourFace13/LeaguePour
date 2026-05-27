import Image from "next/image";

type MarketingImageProps = {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
};

export function MarketingImage({ src, alt, width, height, priority, className = "" }: MarketingImageProps) {
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      priority={priority}
      className={`h-auto w-full rounded-2xl border border-lp-border shadow-lg shadow-black/20 ${className}`}
    />
  );
}
