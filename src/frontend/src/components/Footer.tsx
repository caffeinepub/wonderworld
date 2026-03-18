import { Link } from "./Router";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="md:col-span-2">
            <h3 className="text-xl font-light tracking-widest uppercase mb-4">
              Brilliance
            </h3>
            <p className="text-sm text-gray-600 font-light max-w-sm">
              Redefining luxury jewelry through timeless design and exceptional
              craftsmanship.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-light tracking-wide mb-4">Shop</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="/#new"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  New Arrivals
                </a>
              </li>
              <li>
                <a
                  href="/#collections"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  Collections
                </a>
              </li>
              <li>
                <a
                  href="/#sale"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  Sale
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-light tracking-wide mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <a
                  href="/#shipping"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  Shipping
                </a>
              </li>
              <li>
                <a
                  href="/#returns"
                  className="text-sm text-gray-600 font-light hover:text-black transition-colors"
                >
                  Returns
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-400 font-light">
            © 2025 Brilliance. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
