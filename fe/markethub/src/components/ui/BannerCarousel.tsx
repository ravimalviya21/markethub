import { Carousel, CarouselProps } from "antd";

export interface Banner {
  id?: string | number;
  image?: string;
  alt?: string;
  title?: string;
  subtitle?: string;
  cta?: string;
  href?: string;
  background?: string;
}

interface SlideProps {
  banner: Banner;
  height: number;
  onClick?: (banner: Banner) => void;
}

const Slide = ({ banner, height, onClick }: SlideProps) => {
  const { image, alt, title, subtitle, cta, href, background } = banner;

  const content = (
    <div
      style={{
        position: "relative",
        height,
        width: "100%",
        background: background || "#f0f2f5",
        overflow: "hidden",
        borderRadius: 8,
      }}
    >
      {image && (
        <img
          src={image}
          alt={alt || title || "banner"}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      )}

      {(title || subtitle || cta) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 48px",
            color: "#fff",
            background: image
              ? "linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 60%)"
              : "transparent",
          }}
        >
          {title && (
            <h2 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>
              {title}
            </h2>
          )}
          {subtitle && (
            <p style={{ margin: "8px 0 0", fontSize: 16, opacity: 0.9 }}>
              {subtitle}
            </p>
          )}
          {cta && (
            <span
              style={{
                marginTop: 16,
                display: "inline-block",
                width: "fit-content",
                padding: "8px 20px",
                background: "#1677ff",
                borderRadius: 6,
                fontWeight: 600,
              }}
            >
              {cta}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href || onClick) {
    return (
      <a
        href={href}
        onClick={(e) => {
          if (onClick) {
            e.preventDefault();
            onClick(banner);
          }
        }}
        style={{ display: "block", cursor: "pointer" }}
      >
        {content}
      </a>
    );
  }

  return content;
};

interface BannerCarouselProps extends Omit<CarouselProps, "effect"> {
  banners?: Banner[];
  height?: number;
  autoplay?: boolean;
  autoplaySpeed?: number;
  controls?: "dots" | "arrows" | "both" | "none";
  effect?: "fade" | "scrollx";
  onSlideClick?: (banner: Banner) => void;
}

/**
 * Reusable banner carousel built on antd Carousel.
 *
 * @param banners - [{ image, alt, title, subtitle, cta, href, background }]
 * @param height - slide height in px (default 280)
 * @param autoplay - default true
 * @param autoplaySpeed - ms between slides (default 4000)
 * @param controls - default "dots"
 * @param effect - default "scrollx"
 * @param onSlideClick - optional click handler per slide
 */
const BannerCarousel = ({
  banners = [],
  height = 280,
  autoplay = true,
  autoplaySpeed = 4000,
  controls = "dots",
  effect = "scrollx",
  onSlideClick,
  ...rest
}: BannerCarouselProps) => {
  if (!banners.length) return null;

  const showArrows = controls === "arrows" || controls === "both";
  const showDots = controls === "dots" || controls === "both";

  return (
    <Carousel
      autoplay={autoplay}
      autoplaySpeed={autoplaySpeed}
      arrows={showArrows}
      dots={showDots}
      effect={effect}
      {...rest}
    >
      {banners.map((banner, idx) => (
        <Slide
          key={banner.id ?? idx}
          banner={banner}
          height={height}
          onClick={onSlideClick}
        />
      ))}
    </Carousel>
  );
};

export default BannerCarousel;
