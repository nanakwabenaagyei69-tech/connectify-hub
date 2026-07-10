type LinksLogoProps = {
  className?: string;
  /**
   * Tailwind text color class (e.g. "text-primary", "text-foreground").
   * Both the emblem and wordmark are rendered with `currentColor`
   * so they inherit whatever theme color is applied.
   */
  colorClassName?: string;
  alt?: string;
  /**
   * `lockup` (default) shows the squircle emblem next to the "Links" wordmark.
   * `mark` shows only the emblem, sized square — useful for favicons or tight nav slots.
   */
  variant?: "lockup" | "mark";
};

/**
 * Squircle emblem: iOS/Instagram-style rounded tile with two interlocking
 * links carved out as negative space. Single-color silhouette — the fill
 * follows `currentColor`, so it re-tints with the theme.
 */
function LinksMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      className={`fill-current ${className ?? ""}`}
      aria-hidden="true"
      focusable="false"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M30 0C10 0 0 10 0 30V70C0 90 10 100 30 100H70C90 100 100 90 100 70V30C100 10 90 0 70 0H30ZM54 26C49 26 45 30 45 35V39H53V35C53 34.5 53.5 34 54 34H66C66.5 34 67 34.5 67 35V45C67 45.5 66.5 46 66 46H62V54H66C71 54 75 50 75 45V35C75 30 71 26 66 26H54ZM43 46C38 46 34 50 34 55V65C34 70 38 74 43 74H55C60 74 64 70 64 65V61H56V65C56 65.5 55.5 66 55 66H43C42.5 66 42 65.5 42 65V55C42 54.5 42.5 54 43 54H55V46H43Z"
      />
    </svg>
  );
}

export function LinksLogo({
  className = "h-8 w-auto",
  colorClassName = "text-foreground",
  alt = "Links",
  variant = "lockup",
}: LinksLogoProps) {
  if (variant === "mark") {
    return (
      <span
        role="img"
        aria-label={alt}
        className={`inline-flex items-center justify-center align-middle aspect-square transition-colors duration-500 ease-out ${colorClassName} ${className}`}
      >
        <LinksMark className="h-full w-full" />
      </span>
    );
  }

  return (
    <span
      role="img"
      aria-label={alt}
      className={`inline-flex items-center align-middle gap-[0.35em] leading-none ${colorClassName} ${className}`}
      style={{ fontFamily: "'Outfit', ui-sans-serif, system-ui, sans-serif" }}
    >
      <LinksMark className="h-full w-auto aspect-square shrink-0" />
      <span
        aria-hidden="true"
        className="font-extrabold tracking-tight"
        style={{ fontSize: "0.92em", letterSpacing: "-0.03em" }}
      >
        Links
      </span>
    </span>
  );
}

export default LinksLogo;