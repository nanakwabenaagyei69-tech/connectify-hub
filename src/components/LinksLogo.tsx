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
      className={`inline-block ${colorClassName} ${className}`}
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
        aspectRatio: "auto",
      }}
    />
  );
}

export default LinksLogo;