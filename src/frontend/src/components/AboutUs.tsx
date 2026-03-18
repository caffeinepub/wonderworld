import { ArrowLeft, Quote } from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";
import { Link } from "./Router";

function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section - Minimalist approach */}
      <section className="min-h-screen flex items-center justify-center px-6 lg:px-12 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-8">
            Our Story
          </p>
          <h1 className="text-5xl md:text-7xl font-light leading-tight mb-8">
            Where Luxury
            <br />
            <span className="italic font-serif">Meets Eternity</span>
          </h1>
          <div className="w-20 h-px bg-black mx-auto mb-8" />
          <p className="text-lg font-light text-gray-700 leading-relaxed max-w-2xl mx-auto">
            Founded with a vision to redefine fine jewelry, Brilliance is more
            than a brand—it's a philosophy. We believe in the power of timeless
            elegance, the beauty of precious materials, and the art of creating
            heirlooms that transcend generations.
          </p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-6">
                Philosophy
              </p>
              <h2 className="text-4xl md:text-5xl font-light leading-tight mb-8">
                Crafted with
                <br />
                <span className="italic font-serif">Intention</span>
              </h2>
              <p className="text-gray-700 font-light leading-relaxed mb-6">
                Every piece of jewelry in our collection tells a story of
                meticulous craftsmanship and thoughtful design. We work with
                master jewelers who share our commitment to excellence, using
                only the finest precious metals and ethically sourced gemstones.
              </p>
              <p className="text-gray-700 font-light leading-relaxed">
                Our minimalist approach extends beyond aesthetics—it's about
                creating timeless pieces that transcend seasons and trends,
                becoming treasured heirlooms passed through generations.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg"
                  alt="Craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-white p-8 shadow-lg">
                <Quote className="w-8 h-8 text-gray-300 mb-4" />
                <p className="text-sm font-light italic text-gray-600 max-w-xs">
                  "Simplicity is the ultimate sophistication"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section - Grid Layout */}
      <section className="py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-6">
              Our Values
            </p>
            <h2 className="text-4xl md:text-5xl font-light">
              What Defines <span className="italic font-serif">Us</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="text-center">
              <div className="mb-8">
                <span className="text-6xl font-light text-gray-300">01</span>
              </div>
              <h3 className="text-xl font-light tracking-wide mb-4">
                Quality First
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                We never compromise. Each piece undergoes rigorous quality
                checks to ensure it meets our exacting standards.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <span className="text-6xl font-light text-gray-300">02</span>
              </div>
              <h3 className="text-xl font-light tracking-wide mb-4">
                Sustainable Luxury
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Ethical sourcing and sustainable practices are at the heart of
                everything we create.
              </p>
            </div>

            <div className="text-center">
              <div className="mb-8">
                <span className="text-6xl font-light text-gray-300">03</span>
              </div>
              <h3 className="text-xl font-light tracking-wide mb-4">
                Timeless Design
              </h3>
              <p className="text-gray-600 font-light leading-relaxed">
                We create pieces that transcend trends, focusing on enduring
                elegance and versatility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Artisan Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
              <div className="aspect-[3/4] bg-gray-100 rounded-sm overflow-hidden">
                <img
                  src="https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg"
                  alt="Artisan at work"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-6">
                Craftsmanship
              </p>
              <h2 className="text-4xl md:text-5xl font-light leading-tight mb-8">
                Made by
                <br />
                <span className="italic font-serif">Artisans</span>
              </h2>
              <p className="text-gray-700 font-light leading-relaxed mb-6">
                Behind every Brilliance creation is a master jeweler who brings
                decades of experience and passion to their craft. We partner
                with ateliers that honor traditional techniques while embracing
                modern innovation.
              </p>
              <p className="text-gray-700 font-light leading-relaxed">
                This collaboration results in jewelry that's not just worn, but
                cherished—pieces that become more precious with time and carry
                the mark of true artistry.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-32 bg-black text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center">
          <p className="text-sm font-light tracking-[0.3em] text-gray-400 uppercase mb-8">
            Our Mission
          </p>
          <h2 className="text-3xl md:text-4xl font-light leading-relaxed">
            To create jewelry that honors the art of
            <span className="italic font-serif"> timeless beauty</span>, where
            every piece is a statement of enduring elegance and refined luxury.
          </h2>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-light mb-8">
            Experience the
            <br />
            <span className="italic font-serif">Difference</span>
          </h2>
          <p className="text-gray-700 font-light mb-12 text-lg">
            Join us in celebrating the art of fine jewelry.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link
              to="/"
              className="inline-block px-12 py-4 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-gray-900 transition-colors duration-300"
            >
              Explore Collection
            </Link>
            <Link
              to="/contact"
              className="inline-block px-12 py-4 border border-black text-black text-sm font-light tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
            >
              Get in Touch
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default AboutUs;
