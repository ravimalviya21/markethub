import { Carousel } from "antd";

const Slide = ({ banner, height, onClick }) => {
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

/**
 * Reusable banner carousel built on antd Carousel.
 *
 * @param {Array} banners - [{ image, alt, title, subtitle, cta, href, background }]
 * @param {number} height - slide height in px (default 280)
 * @param {boolean} autoplay - default true
 * @param {number} autoplaySpeed - ms between slides (default 4000)
 * @param {"dots"|"arrows"|"both"|"none"} controls - default "dots"
 * @param {"fade"|"scrollx"} effect - default "scrollx"
 * @param {(banner) => void} onSlideClick - optional click handler per slide
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
}) => {
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
