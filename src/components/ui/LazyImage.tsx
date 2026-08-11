import { ImgHTMLAttributes, useState } from "react";

interface LazyImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  wrapperClassName?: string;
  fallbackLabel?: string;
}

export const LazyImage = ({
  src,
  alt,
  className = "",
  wrapperClassName = "",
  fallbackLabel = "Yenni Crochet",
  onLoad,
  onError,
  ...props
}: LazyImageProps) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden bg-background-main ${wrapperClassName}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-primary/45 via-white/70 to-background-main" />
      )}

      {src && !hasError ? (
        <img
          {...props}
          src={src}
          alt={alt}
          loading={props.loading ?? "lazy"}
          decoding={props.decoding ?? "async"}
          onLoad={(event) => {
            setIsLoaded(true);
            onLoad?.(event);
          }}
          onError={(event) => {
            setHasError(true);
            onError?.(event);
          }}
          className={`${className} transition-opacity duration-300 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-4 text-center text-xs font-semibold text-text-muted">
          {fallbackLabel}
        </div>
      )}
    </div>
  );
};
