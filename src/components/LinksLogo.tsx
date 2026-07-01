import logoAsset from "@/assets/links-logo.png.asset.json";

type LinksLogoProps = {
  className?: string;
  /**
   * Tailwind text color class (e.g. "text-primary", "text-foreground").
   * The logo is rendered as a CSS mask so its fill color follows `currentColor`,
   * which lets it adapt to whatever theme the app uses.
   */
  colorClassName?: string;
  alt?: string;
};

export function LinksLogo({
  className = "h-8 w-auto",
  colorClassName = "text-foreground",
  alt = "Links",
}: LinksLogoProps) {
  return (
    <span
      role="img"
      aria-label={alt}
      className={`relative inline-block align-middle ${colorClassName} ${className}`}
      style={{
        backgroundColor: "currentColor",
        WebkitMaskImage: `url(${logoAsset.url})`,
        maskImage: `url(${logoAsset.url})`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    >
      {/* Invisible image preserves intrinsic aspect ratio so `w-auto` works. */}
      <img
        src={logoAsset.url}
        alt=""
        aria-hidden="true"
        className="h-full w-auto opacity-0 pointer-events-none block"
        draggable={false}
      />
    </span>
  );
}

export default LinksLogo;