import { ChevronDown, Menu, ShoppingCart, User, X } from "lucide-react";
import { useRef, useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useAllCategories } from "../hooks/useQueries";
import { Link } from "./Router";

export default function Header() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: categories } = useAllCategories();
  const { getTotalItems, toggleCart } = useCart();

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center py-5">
          <a href="/" className="flex items-center">
            <h1 className="text-2xl font-light tracking-widest text-black uppercase">
              Brilliance
            </h1>
          </a>

          <div className="hidden lg:flex items-center">
            <div className="flex gap-8 items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  className="text-sm font-light tracking-wide text-gray-700 hover:text-black transition-colors flex items-center gap-2"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  Categories
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {dropdownOpen && (
                  <div className="absolute top-full left-0 mt-4 w-56 bg-white border border-gray-100 shadow-lg z-50">
                    <div className="py-3">
                      <button
                        type="button"
                        className={`block w-full text-left px-6 py-3 text-sm font-light hover:bg-gray-50 transition-colors ${selectedCategory === "all" ? "bg-gray-50 text-black" : "text-gray-700"}`}
                        onClick={() => {
                          setSelectedCategory("all");
                          setDropdownOpen(false);
                        }}
                      >
                        All Products
                      </button>
                      {categories?.map((category) => (
                        <button
                          key={category}
                          type="button"
                          className={`block w-full text-left px-6 py-3 text-sm font-light hover:bg-gray-50 transition-colors ${selectedCategory === category ? "bg-gray-50 text-black" : "text-gray-700"}`}
                          onClick={() => {
                            setSelectedCategory(category);
                            setDropdownOpen(false);
                          }}
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link
                to="/about"
                className="text-sm font-light tracking-wide text-gray-700 hover:text-black transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-sm font-light tracking-wide text-gray-700 hover:text-black transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              to="/dashboard"
              className="p-2 text-gray-700 hover:text-black transition-colors"
            >
              <User className="w-5 h-5 stroke-[1.5]" />
            </Link>
            <button
              type="button"
              onClick={toggleCart}
              className="relative p-2 text-gray-700 hover:text-black transition-colors"
            >
              <ShoppingCart className="w-5 h-5 stroke-[1.5]" />
              {getTotalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-black text-white rounded-full w-4 h-4 text-xs flex items-center justify-center font-medium">
                  {getTotalItems()}
                </span>
              )}
            </button>
            <Link
              to="/admin"
              className="ml-4 text-sm font-light text-gray-600 hover:text-black transition-colors"
            >
              Admin
            </Link>
          </div>

          <button
            type="button"
            className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 stroke-[1.5]" />
            ) : (
              <Menu className="w-6 h-6 stroke-[1.5]" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white">
            <div className="py-4 space-y-2">
              <div className="px-4 py-2">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                  Categories
                </h3>
                <div className="space-y-1">
                  <button
                    type="button"
                    className={`block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${selectedCategory === "all" ? "bg-gray-100 font-medium" : ""}`}
                    onClick={() => {
                      setSelectedCategory("all");
                      setMobileMenuOpen(false);
                      document
                        .querySelector(".products-section")
                        ?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    All Products
                  </button>
                  {categories?.map((category) => (
                    <button
                      key={category}
                      type="button"
                      className={`block w-full text-left px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors ${selectedCategory === category ? "bg-gray-100 font-medium" : ""}`}
                      onClick={() => {
                        setSelectedCategory(category);
                        setMobileMenuOpen(false);
                        document
                          .querySelector(".products-section")
                          ?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="px-4 space-y-1">
                  <Link
                    to="/about"
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 transition-colors rounded-lg"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-4 px-4 space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    toggleCart();
                    setMobileMenuOpen(false);
                  }}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <ShoppingCart className="w-6 h-6 text-black" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white rounded-full w-5 h-5 text-xs flex items-center justify-center font-bold">
                      {getTotalItems()}
                    </span>
                  )}
                </button>
                <Link
                  to="/dashboard"
                  className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg transition-colors"
                >
                  <User className="w-4 h-4" />
                  My Account
                </Link>
                <Link
                  to="/admin"
                  className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg transition-colors"
                >
                  Admin
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
