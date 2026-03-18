export interface Category {
  name: string;
  description: string;
  image: string;
}

export interface Product {
  id: bigint;
  name: string;
  description: string;
  price: bigint;
  category: string;
  image?: string;
}

export const testCategories: Category[] = [
  {
    name: "Rings",
    description:
      "Exquisite rings for engagements, weddings, and special occasions",
    image: "https://i.imgur.com/aF8gLem.jpeg",
  },
  {
    name: "Necklaces",
    description: "Elegant necklaces featuring precious metals and gemstones",
    image: "https://i.imgur.com/MxghTiS.jpeg",
  },
  {
    name: "Bracelets",
    description: "Sophisticated bracelets for any style and occasion",
    image: "https://i.imgur.com/5Jk2hdG.jpeg",
  },
  {
    name: "Earrings",
    description: "Beautiful earrings from studs to statement pieces",
    image: "https://i.imgur.com/9J58dcb.jpeg",
  },
  {
    name: "Watches",
    description: "Luxury timepieces combining elegance with precision",
    image: "https://i.imgur.com/sMFHQWm.jpeg",
  },
];

export const testProducts: Product[] = [
  {
    id: BigInt(1),
    name: "Diamond Solitaire Ring",
    description:
      "Timeless 1-carat diamond solitaire set in 18k white gold. The perfect symbol of eternal love.",
    price: BigInt(499999), // $4,999.99 in cents
    category: "Rings",
    image: "https://i.imgur.com/YAefJy2.jpeg",
  },
  {
    id: BigInt(2),
    name: "Pearl Strand Necklace",
    description:
      "Classic Akoya pearl necklace with 18k gold clasp. Cultured pearls with exceptional luster.",
    price: BigInt(299999), // $2,999.99 in cents
    category: "Necklaces",
    image: "https://i.imgur.com/Mq1r4Yc.jpeg",
  },
  {
    id: BigInt(3),
    name: "Gold Tennis Bracelet",
    description:
      "Stunning tennis bracelet featuring 5 carats of brilliant-cut diamonds set in 14k gold.",
    price: BigInt(799999), // $7,999.99 in cents
    category: "Bracelets",
    image: "https://i.imgur.com/qjyjM0g.jpeg",
  },
  {
    id: BigInt(4),
    name: "Diamond Stud Earrings",
    description:
      "Classic round diamond studs, 2 carats total weight. Set in platinum with secure backs.",
    price: BigInt(399999), // $3,999.99 in cents
    category: "Earrings",
    image: "https://i.imgur.com/c0IEjoV.jpeg",
  },
  {
    id: BigInt(5),
    name: "Luxury Swiss Watch",
    description:
      "Automatic mechanical watch with sapphire crystal and genuine leather strap. Swiss precision.",
    price: BigInt(1299999), // $12,999.99 in cents
    category: "Watches",
    image: "https://i.imgur.com/N4SOCTH.jpeg",
  },
  {
    id: BigInt(6),
    name: "Sapphire Halo Ring",
    description:
      "Deep blue sapphire surrounded by diamonds in 18k white gold. Royal elegance redefined.",
    price: BigInt(349999), // $3,499.99 in cents
    category: "Rings",
    image: "https://i.imgur.com/B9RjGLl.jpeg",
  },
  {
    id: BigInt(7),
    name: "Gold Chain Necklace",
    description:
      "Solid 14k gold Cuban link chain. Substantial weight with a polished finish.",
    price: BigInt(199999), // $1,999.99 in cents
    category: "Necklaces",
    image: "https://i.imgur.com/follmw8.jpeg",
  },
  {
    id: BigInt(8),
    name: "Charm Bracelet",
    description:
      "Sterling silver charm bracelet with 10 customizable charms. Tell your unique story.",
    price: BigInt(79999), // $799.99 in cents
    category: "Bracelets",
    image: "https://i.imgur.com/XtVXwVy.jpeg",
  },
  {
    id: BigInt(9),
    name: "Rose Gold Hoops",
    description:
      "Modern twist on classic hoops in 18k rose gold. Perfect size for everyday elegance.",
    price: BigInt(129999), // $1,299.99 in cents
    category: "Earrings",
    image: "https://i.imgur.com/yoDoh3X.jpeg",
  },
  {
    id: BigInt(10),
    name: "Chronograph Watch",
    description:
      "Stainless steel chronograph with black dial. Water resistant to 100 meters.",
    price: BigInt(599999), // $5,999.99 in cents
    category: "Watches",
    image: "https://i.imgur.com/li9Yt5B.jpeg",
  },
  {
    id: BigInt(11),
    name: "Emerald Cut Ring",
    description:
      "3-carat emerald cut diamond in platinum setting. Exceptional clarity and brilliance.",
    price: BigInt(1599999), // $15,999.99 in cents
    category: "Rings",
    image: "https://i.imgur.com/qbsDXWA.jpeg",
  },
  {
    id: BigInt(12),
    name: "Pendant Necklace",
    description:
      "Heart-shaped diamond pendant on delicate white gold chain. Symbol of love and affection.",
    price: BigInt(169999), // $1,699.99 in cents
    category: "Necklaces",
    image: "https://i.imgur.com/5Atqlvm.jpeg",
  },
  {
    id: BigInt(13),
    name: "Bangle Set",
    description:
      "Set of 5 gold-plated bangles with intricate patterns. Traditional meets contemporary.",
    price: BigInt(49999), // $499.99 in cents
    category: "Bracelets",
    image: "https://i.imgur.com/VtqXAch.jpeg",
  },
  {
    id: BigInt(14),
    name: "Drop Earrings",
    description:
      "Elegant teardrop pearls suspended from diamond-studded posts. Timeless sophistication.",
    price: BigInt(229999), // $2,299.99 in cents
    category: "Earrings",
    image: "https://i.imgur.com/bepGcg7.jpeg",
  },
  {
    id: BigInt(15),
    name: "Dive Watch",
    description:
      "Professional dive watch with ceramic bezel. Automatic movement, 300m water resistance.",
    price: BigInt(899999), // $8,999.99 in cents
    category: "Watches",
    image: "https://i.imgur.com/QgfEy98.jpeg",
  },
  {
    id: BigInt(16),
    name: "Eternity Band",
    description:
      "Full eternity band with 3 carats of diamonds. Continuous sparkle in platinum.",
    price: BigInt(699999), // $6,999.99 in cents
    category: "Rings",
    image: "https://i.imgur.com/h2djazZ.jpeg",
  },
  {
    id: BigInt(17),
    name: "Layered Necklace",
    description:
      "Three-strand layered necklace in mixed metals. Modern bohemian style.",
    price: BigInt(89999), // $899.99 in cents
    category: "Necklaces",
    image: "https://i.imgur.com/zrbOPvV.jpeg",
  },
  {
    id: BigInt(18),
    name: "Cuff Bracelet",
    description:
      "Bold sterling silver cuff with hammered texture. Statement piece for any outfit.",
    price: BigInt(59999), // $599.99 in cents
    category: "Bracelets",
    image: "https://i.imgur.com/pM5KKEU.jpeg",
  },
  {
    id: BigInt(19),
    name: "Chandelier Earrings",
    description:
      "Dramatic chandelier earrings with cascading crystals. Red carpet glamour.",
    price: BigInt(149999), // $1,499.99 in cents
    category: "Earrings",
    image: "https://i.imgur.com/ZoDLcnV.jpeg",
  },
  {
    id: BigInt(20),
    name: "Skeleton Watch",
    description:
      "Luxury skeleton watch revealing intricate mechanical movement. Limited edition.",
    price: BigInt(2499999), // $24,999.99 in cents
    category: "Watches",
    image: "https://i.imgur.com/3fNgwRp.jpeg",
  },
];

export const prepareTestData = () => {
  const categories = testCategories.map((cat) => ({
    name: cat.name,
    description: cat.description,
    image: cat.image || undefined,
  }));

  const products = testProducts.map((prod) => ({
    id: Number(prod.id),
    name: prod.name,
    description: prod.description,
    price: Number(prod.price),
    category: prod.category,
    image: prod.image || undefined,
  }));

  const allowedOrigins = [window.location.origin];
  return { categories, products, allowedOrigins };
};
