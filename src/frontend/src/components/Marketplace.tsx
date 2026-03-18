import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Headphones,
  Quote,
  RefreshCw,
  Star,
  Truck,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../contexts/CartContext";
import {
  type Product,
  useAllCategories,
  useCategories,
  useProducts,
} from "../hooks/useQueries";
import Cart from "./Cart";
import Footer from "./Footer";
import Header from "./Header";
import Pagination from "./Pagination";

const heroImages = [
  {
    url: "https://images.pexels.com/photos/168927/pexels-photo-168927.jpeg",
    collection: "Signature Collection",
    title: "Timeless Brilliance",
    subtitle: "Where elegance meets eternal beauty",
  },
  {
    url: "https://images.pexels.com/photos/177332/pexels-photo-177332.jpeg",
    collection: "Artisan Series",
    title: "Handcrafted Perfection",
    subtitle: "Each piece tells a story of excellence",
  },
  {
    url: "https://images.pexels.com/photos/2735970/pexels-photo-2735970.jpeg",
    collection: "Essential Collection",
    title: "Modern Luxury",
    subtitle: "Sophisticated jewelry for everyday elegance",
  },
];

const reviews = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Absolutely stunning jewelry! The diamond earrings are even more beautiful in person. Exceptional quality and craftsmanship.",
    date: "2 weeks ago",
  },
  {
    id: 2,
    name: "Michael Chen",
    rating: 5,
    comment:
      "Purchased an engagement ring and couldn't be happier. The customer service was outstanding and helped me find the perfect ring.",
    date: "1 month ago",
  },
  {
    id: 3,
    name: "Emma Williams",
    rating: 4,
    comment:
      "Beautiful collection of fine jewelry. The pearl necklace I ordered is exquisite. Will definitely be a returning customer.",
    date: "3 weeks ago",
  },
];

function Marketplace() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [productsPage, setProductsPage] = useState(1);

  const { data: categories } = useAllCategories();
  const { data: categoriesWithImage } = useCategories({ page: 1, limit: 2 });
  const { data: products } = useProducts({
    category: selectedCategory === "all" ? undefined : selectedCategory,
    page: productsPage,
    limit: 6,
  });
  const { addToCart } = useCart();
  const productList: Array<Product> = products?.items || [];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroImages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const categoryCards = [
    {
      id: "all",
      name: "All Products",
      image: "https://images.pexels.com/photos/265906/pexels-photo-265906.jpeg",
    },
    ...(categoriesWithImage?.items ?? []),
  ];

  const categoryOptions = [
    { id: "all", name: "All" },
    ...(categories?.map((category) => ({ id: category, name: category })) ??
      []),
  ];

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional reset
  useEffect(() => {
    setProductsPage(1);
  }, [selectedCategory]);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
  };

  return (
    <div className="store">
      <Header />

      <section className="relative h-[calc(100vh-76px)] overflow-hidden">
        {heroImages.map((hero, index) => (
          <div
            key={hero.collection}
            className={`absolute inset-0 transition-all duration-2000 ease-out ${
              index === currentHeroIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: `url(${hero.url})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
          </div>
        ))}

        <div className="relative z-10 h-full flex items-center lg:items-end">
          <div className="w-full px-6 lg:px-12 pb-12 lg:pb-20">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center lg:items-end">
                <div className="text-white text-center lg:text-left">
                  <div className="mb-4 lg:mb-6">
                    <span className="inline-block px-3 py-1 lg:px-4 lg:py-1 border border-white/50 text-xs font-light tracking-[0.3em] uppercase backdrop-blur-sm">
                      {heroImages[currentHeroIndex].collection}
                    </span>
                  </div>
                  <h1 className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-light leading-tight mb-4 lg:mb-6">
                    {heroImages[currentHeroIndex].title
                      .split(" ")
                      .map((word, i, arr) => (
                        <span
                          key={word}
                          className={
                            i === arr.length - 1
                              ? "block italic font-serif"
                              : ""
                          }
                        >
                          {word}
                          {i < arr.length - 1 ? " " : ""}
                        </span>
                      ))}
                  </h1>
                  <p className="text-base lg:text-lg font-light mb-6 lg:mb-8 opacity-90 max-w-md mx-auto lg:mx-0">
                    {heroImages[currentHeroIndex].subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <button
                      type="button"
                      className="group inline-flex items-center justify-center gap-3 px-6 py-3 lg:px-8 lg:py-4 bg-white text-black text-sm font-light tracking-widest uppercase hover:bg-transparent hover:text-white border border-white transition-all duration-300"
                      onClick={() =>
                        document
                          .querySelector(".products-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                    >
                      Explore Collection
                      <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform" />
                    </button>
                  </div>
                </div>
                <div className="text-white text-center lg:text-right mt-8 lg:mt-0">
                  <div className="space-y-4 lg:space-y-6">
                    <div>
                      <p className="text-xs font-light tracking-[0.3em] uppercase opacity-70 mb-2">
                        Featured Collection
                      </p>
                      <h3 className="text-xl lg:text-2xl font-light">
                        {heroImages[currentHeroIndex].collection}
                      </h3>
                    </div>
                    <div className="w-12 lg:w-20 h-px bg-white/50 mx-auto lg:ml-auto lg:mr-0" />
                    <div>
                      <p className="text-xs font-light tracking-[0.3em] uppercase opacity-70 mb-2">
                        Available Now
                      </p>
                      <p className="text-sm font-light opacity-80">
                        Limited quantities
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute left-6 lg:left-12 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={() =>
              setCurrentHeroIndex(
                (prev) => (prev - 1 + heroImages.length) % heroImages.length,
              )
            }
            className="p-3 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>
        <div className="absolute right-6 lg:right-12 top-1/2 -translate-y-1/2 z-20">
          <button
            type="button"
            onClick={() =>
              setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
            }
            className="p-3 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
          >
            <ArrowRight className="w-5 h-5 stroke-[1.5]" />
          </button>
        </div>

        <div className="absolute bottom-8 left-6 lg:left-12 z-20">
          <div className="flex flex-col gap-3">
            {heroImages.map((hero, index) => (
              <button
                key={hero.collection}
                type="button"
                className={`w-[2px] h-12 transition-all duration-300 ${index === currentHeroIndex ? "bg-white" : "bg-white/30"}`}
                onClick={() => setCurrentHeroIndex(index)}
              />
            ))}
          </div>
          <div className="mt-6">
            <p className="text-white text-xs font-light tracking-[0.3em] uppercase opacity-70">
              {String(currentHeroIndex + 1).padStart(2, "0")} /{" "}
              {String(heroImages.length).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 right-6 lg:right-12 z-20">
          <div className="flex flex-col items-center text-white/70">
            <p className="text-xs font-light tracking-[0.3em] uppercase mb-4 [writing-mode:vertical-lr] rotate-180">
              Scroll
            </p>
            <div className="w-px h-16 bg-gradient-to-b from-white/70 to-transparent" />
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
            <div>
              <div className="mb-6">
                <Truck className="w-8 h-8 mx-auto stroke-[1.5] text-gray-600" />
              </div>
              <h3 className="text-lg font-light mb-3">
                Complimentary Shipping
              </h3>
              <p className="text-sm text-gray-600 font-light">
                On all orders worldwide. Fast, reliable shipping to your
                doorstep.
              </p>
            </div>
            <div>
              <div className="mb-6">
                <RefreshCw className="w-8 h-8 mx-auto stroke-[1.5] text-gray-600" />
              </div>
              <h3 className="text-lg font-light mb-3">Easy Returns</h3>
              <p className="text-sm text-gray-600 font-light">
                30-day return policy. Not satisfied? Get your money back, no
                questions asked.
              </p>
            </div>
            <div>
              <div className="mb-6">
                <Headphones className="w-8 h-8 mx-auto stroke-[1.5] text-gray-600" />
              </div>
              <h3 className="text-lg font-light mb-3">Personal Service</h3>
              <p className="text-sm text-gray-600 font-light">
                Dedicated customer care. We're here to help whenever you need
                us.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">
              Explore <span className="italic font-serif">Collections</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categoryCards.slice(0, 3).map((category) => {
              const isActive = selectedCategory === category.name;
              return (
                <div
                  key={category.name}
                  className="group cursor-pointer"
                  onClick={() => {
                    setSelectedCategory(category.name);
                    document
                      .querySelector(".products-section")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setSelectedCategory(category.name);
                      document
                        .querySelector(".products-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }
                  }}
                  // biome-ignore lint/a11y/useSemanticElements: styled category card
                  role="button"
                  tabIndex={0}
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                    <div
                      className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                      style={{ backgroundImage: `url(${category.image})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-0 left-0 p-8">
                      <h3
                        className={`text-2xl font-light text-white mb-2 ${isActive ? "underline" : ""}`}
                      >
                        {category.name}
                      </h3>
                      <p className="text-sm text-white/80 font-light">
                        Explore Collection
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 products-section bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-light mb-4">
              {categoryOptions.find((cat) => cat.id === selectedCategory)
                ?.name || "All"}{" "}
              <span className="italic font-serif">Collection</span>
            </h2>
            <p className="text-sm font-light text-gray-600 tracking-wide">
              {products?.totalItems ?? 0} pieces
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {productList.map((product) => (
              <div key={product.id} className="group">
                <div className="aspect-square mb-6 overflow-hidden bg-gray-100">
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl font-light text-gray-300">
                        Brilliance
                      </span>
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-light mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 font-light mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-light">
                    $
                    {(Number(product.price) / 100).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAddToCart(product)}
                    className="text-sm font-light underline hover:no-underline transition-all"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
          {products && products.totalPages > 1 && (
            <div className="mt-16">
              <Pagination
                currentPage={productsPage}
                totalPages={Number(products.totalPages)}
                onPageChange={(page) => setProductsPage(page)}
                totalItems={Number(products.totalItems)}
                itemsPerPage={9}
              />
            </div>
          )}
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light mb-4">
              Customer <span className="italic font-serif">Stories</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {reviews.map((review) => (
              <div key={review.id} className="text-center">
                <Quote className="w-8 h-8 mx-auto mb-6 text-gray-300" />
                <p className="text-gray-700 mb-8 font-light italic leading-relaxed">
                  "{review.comment}"
                </p>
                <div className="flex justify-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      // biome-ignore lint/suspicious/noArrayIndexKey: star ratings are positional
                      key={i}
                      className={`w-4 h-4 ${i < review.rating ? "text-black fill-current" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <h4 className="text-sm font-light">{review.name}</h4>
                <p className="text-xs text-gray-500 font-light">
                  {review.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Cart />
    </div>
  );
}

export default Marketplace;
