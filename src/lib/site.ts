import { supportedShippingCountriesText } from "@/lib/shipping";

export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "TarotDeck.online",
  domain: process.env.NEXT_PUBLIC_SITE_DOMAIN || "tarotdeck.online",
  supportEmail: process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@tarotdeck.online",
  title: "TarotDeck.online | Beginner-safe tarot decks, collector picks, and giftable bundles",
  description:
    "Shop beginner-safe tarot decks, collector editions, ritual bundles, and reading tools chosen to make tarot easier to buy and more beautiful to gift.",
  heroBadge: "Beginner-safe decks, collector picks, and gift-ready bundles",
  heroTitle: "Find the tarot deck that already feels like yours.",
  heroDescription:
    "TarotDeck.online is a modern tarot boutique with first-deck favorites, elevated collector editions, and ritual add-ons that make choosing feel calm and gifting feel thoughtful.",
};

export const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
];

export const homeBenefits = [
  {
    title: "Guided like a boutique, not a marketplace",
    text: "Each deck is framed by mood, reading style, and gifting intent so shoppers can choose faster and second-guess less.",
  },
  {
    title: "Beginner-safe without losing the magic",
    text: "The copy explains who each deck suits and why, so first-time readers feel supported rather than intimidated.",
  },
  {
    title: "Gift-ready from the first click",
    text: "Bundles, collector editions, and ritual add-ons make it easy to turn a deck into a more complete present or personal ritual.",
  },
];

export const homeTrustHighlights = [
  "Ships to the United States and select European countries.",
  "14-day return window on unused decks and accessories.",
  `Support from a real person at ${siteConfig.supportEmail}.`,
];

export const productTrustHighlights = [
  "Secure checkout and clear shipping coverage before payment.",
  "14-day return requests on unused decks and accessories.",
  "Fast help if you are choosing between first-deck, gift, or collector options.",
];

export const ritualSteps = [
  {
    title: "Start with your intent",
    text: "Browse by first deck, giftable set, or collector atmosphere instead of getting buried in a generic catalog.",
  },
  {
    title: "Pick the right edition",
    text: "Choose the format that fits your moment, from a simple starter deck to a collector box or gift-ready bundle.",
  },
  {
    title: "Add the finishing pieces",
    text: "Pair the deck with a reading cloth or starter bundle so the order feels complete the moment it arrives.",
  },
];

export const faqItems = [
  {
    question: "Which tarot deck should I buy first?",
    answer:
      "Start with a deck that feels visually welcoming and easy to read. The beginner collection is the best place to begin because it is merchandised for first-time readers, gift buyers, and anyone who wants clearer guidance.",
  },
  {
    question: "Do I need tarot experience before ordering?",
    answer:
      "No. The store is designed for first-time buyers as much as experienced readers, with edition notes and bundles that make it easier to start right away.",
  },
  {
    question: "Are these good as gifts?",
    answer:
      "Yes. Collector editions, guided bundles, and supportive add-ons are merchandised to feel giftable for birthdays, holidays, and thoughtful self-care occasions.",
  },
  {
    question: "How do I choose between a simple deck and a bundle?",
    answer:
      "Choose a simple deck if you already know what style you want. Choose a bundle if you are buying your first deck, shopping for a gift, or want a more complete ritual setup without piecing everything together yourself.",
  },
  {
    question: "Can I buy only accessories?",
    answer:
      "Yes. Reading cloths and supporting ritual pieces can be purchased on their own or added to a deck order to make the setup feel more complete.",
  },
  {
    question: "Where do you currently ship?",
    answer: `We currently ship to ${supportedShippingCountriesText}. If coverage expands, this page and checkout will update to reflect the new destinations.`,
  },
  {
    question: "What if I need help choosing or something arrives damaged?",
    answer:
      `Email ${siteConfig.supportEmail} if you are deciding between decks, buying for a gift, or need help after delivery. Damaged or incorrect orders should be reported within 7 days of arrival.`,
  },
];

export const footerGroups = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All decks" },
      { href: "/shop#beginner-tarot-decks", label: "Beginner decks" },
      { href: "/shop#collector-decks", label: "Collector editions" },
      { href: "/shop#ritual-bundles", label: "Bundles" },
      { href: "/#deck-finder", label: "Deck finder" },
    ],
  },
  {
    title: "Brand",
    links: [
      { href: "/about", label: "About TarotDeck.online" },
      { href: "/faq", label: "FAQ" },
      { href: "/shipping", label: "Shipping & Returns" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export const aboutPrinciples = [
  {
    title: "Clarity over gatekeeping",
    text: "Tarot should feel inviting. The collection structure and product notes are designed to help buyers choose without feeling embarrassed, lost, or overly corrected.",
  },
  {
    title: "Atmosphere matters",
    text: "A deck is not just a product. It is a visual object, a personal ritual tool, and often a gift. The store treats it with the same care shoppers hope to feel when it arrives.",
  },
  {
    title: "Premium, not theatrical",
    text: "The brand stays warm, grounded, and modern. It keeps the magic of tarot without tipping into cliche or making the shopping experience feel vague.",
  },
];

export const categoryNotes: Record<string, { eyebrow: string; text: string }> = {
  "Beginner Tarot Decks": {
    eyebrow: "Easy first picks",
    text: "Welcoming decks with approachable symbolism, softer visual language, and edition options that support first-time readers.",
  },
  "Collector Decks": {
    eyebrow: "Display-worthy editions",
    text: "Richer finishes, dramatic moods, and more ceremonial presentation for readers who want their deck to feel like an object of devotion.",
  },
  "Ritual Bundles": {
    eyebrow: "Built to start now",
    text: "Bundled formats that reduce decision fatigue by pairing decks with useful ritual pieces from day one.",
  },
  "Reading Tools": {
    eyebrow: "Quiet supporting pieces",
    text: "Accessories that frame the reading table, protect your cards, and make the overall experience feel complete.",
  },
};

export type ProductStory = {
  eyebrow: string;
  gradient: string;
  note: string;
  ritual: string;
  includes: string[];
  idealFor: string[];
};

const productStories: Record<string, ProductStory> = {
  "moonwake-tarot": {
    eyebrow: "Moonlit calm",
    gradient: "from-[#dccdb0] via-[#4b6d64] to-[#142d27]",
    note: "A reflective deck for quiet evenings, journal pages, and softer first readings.",
    ritual:
      "Light a candle, shuffle slowly, and pull one card before bed to turn the reading into a nightly reset.",
    includes: ["78-card tarot deck", "Soft-touch storage box", "Quick-start meaning guide"],
    idealFor: ["First-time readers", "Calmer rituals", "Thoughtful gifting"],
  },
  "sunlit-seeker-tarot": {
    eyebrow: "Bright symbolic clarity",
    gradient: "from-[#ead59e] via-[#b76d48] to-[#21463e]",
    note: "Optimistic artwork and grounded symbolism for readers who want warmth without vagueness.",
    ritual:
      "Use this deck for weekly planning spreads when you want your reading practice to feel energizing and practical.",
    includes: ["78-card tarot deck", "Illustrated tuck box", "Optional expanded guidebook"],
    idealFor: ["Visual learners", "Beginner readers", "Daily card pulls"],
  },
  "velvet-arcana-tarot": {
    eyebrow: "Collector atmosphere",
    gradient: "from-[#d1a365] via-[#673b34] to-[#1a1f26]",
    note: "Shadow-rich art direction for readers who want a deck with gravity and presence on the table.",
    ritual:
      "Reserve this deck for slower spreads and special readings when you want the cards to set the mood before you begin.",
    includes: ["78-card tarot deck", "Collector sleeve", "Foil-edge option"],
    idealFor: ["Collectors", "Altar displays", "Gift-worthy upgrades"],
  },
  "midnight-veil-tarot": {
    eyebrow: "Indigo drama",
    gradient: "from-[#cfb06f] via-[#273c63] to-[#111821]",
    note: "A deeper, more ceremonial feeling deck for readers who love contrast, symbolism, and table presence.",
    ritual:
      "Use a dark reading cloth and a one-question spread to let the artwork carry the emotional tone of the session.",
    includes: ["78-card tarot deck", "Magnetic box", "Collector box option"],
    idealFor: ["Experienced readers", "Collector purchases", "Statement gifts"],
  },
  "first-spread-ritual-bundle": {
    eyebrow: "Everything to begin",
    gradient: "from-[#f0ddbc] via-[#8c5b45] to-[#24463f]",
    note: "A confidence-building bundle that removes the guesswork from starting tarot for the first time.",
    ritual:
      "Open the bundle, lay out the reading cloth, and begin with a simple past-present-future spread to make the first session feel guided.",
    includes: ["Starter deck", "Reading cloth", "Quick-start ritual guide"],
    idealFor: ["First purchases", "Gift orders", "Simple onboarding"],
  },
  "linen-reading-cloth-set": {
    eyebrow: "The quiet layer",
    gradient: "from-[#e9decd] via-[#557d69] to-[#172d28]",
    note: "Soft neutral cloths that frame spreads beautifully and add a sense of ceremony without excess.",
    ritual:
      "Keep one cloth at your desk and one near your altar so your deck always has a clean place to land.",
    includes: ["Two linen-blend cloths", "Protective wrap band"],
    idealFor: ["Deck care", "Layered rituals", "Accessory add-ons"],
  },
};

const defaultStory: ProductStory = {
  eyebrow: "Modern ritual object",
  gradient: "from-[#e2d0b4] via-[#6a5444] to-[#18312b]",
  note: "Designed to feel giftable, intentional, and easier to choose than a generic marketplace listing.",
  ritual:
    "Approach this product as a small ritual anchor: create space for it, let it set the tone, and build a repeatable reading habit around it.",
  includes: ["Thoughtful product presentation", "Editorial product storytelling"],
  idealFor: ["Curious shoppers", "Gift buyers", "Personal rituals"],
};

export function getProductStory(handle: string): ProductStory {
  return productStories[handle] ?? defaultStory;
}

export function getCategoryCopy(name: string) {
  return (
    categoryNotes[name] ?? {
      eyebrow: "Curated selection",
      text: "A focused collection designed to help shoppers choose by feel, not by guesswork.",
    }
  );
}
