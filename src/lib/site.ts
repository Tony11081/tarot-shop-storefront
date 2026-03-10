export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Rube Club",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "shop.rube.club",
  title: process.env.NEXT_PUBLIC_SITE_TITLE || "Rube Club — Custom Hoodie Shop",
  description:
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION ||
    "Streetwear-inspired custom hoodie storefront for personalized prints, graphics, and creator drops.",
  heroBadge:
    process.env.NEXT_PUBLIC_HERO_BADGE || "Custom hoodie storefront MVP",
  heroTitle:
    process.env.NEXT_PUBLIC_HERO_TITLE || "Design your drop. Wear your art.",
  heroDescription:
    process.env.NEXT_PUBLIC_HERO_DESCRIPTION ||
    "Rube Club is a dark, streetwear-inspired storefront for custom hoodies, graphic sweatshirts, and limited creator pieces. Start with bold product storytelling, then layer on live customization later.",
};
