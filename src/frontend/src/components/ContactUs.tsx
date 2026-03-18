import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import Footer from "./Footer";
import Header from "./Header";
import { Link } from "./Router";

function ContactUs() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="max-w-3xl">
            <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-8">
              Contact
            </p>
            <h1 className="text-5xl md:text-7xl font-light leading-tight mb-8">
              Let's Start a
              <br />
              <span className="italic font-serif">Conversation</span>
            </h1>
            <div className="w-20 h-px bg-black mb-8" />
            <p className="text-lg font-light text-gray-700 leading-relaxed">
              Whether you have a question about our jewelry collections, need
              guidance on selecting the perfect piece, or want to create a
              custom design, we're here to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-6 lg:px-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div>
              <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-8">
                Get in Touch
              </p>
              <div className="space-y-8">
                <div className="flex items-start gap-6">
                  <Mail className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-light mb-2">Email</h3>
                    <a
                      href="mailto:hello@brilliance.com"
                      className="text-gray-700 font-light hover:text-black transition-colors"
                    >
                      hello@brilliance.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <Phone className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-light mb-2">Phone</h3>
                    <a
                      href="tel:+1-555-0123"
                      className="text-gray-700 font-light hover:text-black transition-colors"
                    >
                      +1 (555) 0123
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-6">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <h3 className="text-lg font-light mb-2">Visit</h3>
                    <p className="text-gray-700 font-light">
                      456 Diamond District
                      <br />
                      New York, NY 10036
                      <br />
                      United States
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="mb-12">
                <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-8">
                  Store Hours
                </p>
                <div className="space-y-3 text-gray-700 font-light">
                  <div className="flex justify-between">
                    <span>Monday — Friday</span>
                    <span>10:00 — 19:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span>10:00 — 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span>12:00 — 17:00</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-8">
                  Customer Care
                </p>
                <p className="text-gray-700 font-light leading-relaxed mb-6">
                  Our jewelry specialists are available to assist you with
                  questions about our collections, custom designs, or special
                  orders. We typically respond within 24 hours during business
                  days.
                </p>
                <p className="text-gray-700 font-light">
                  For immediate assistance, please call during store hours.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <p className="text-sm font-light tracking-[0.3em] text-gray-500 uppercase mb-6">
                Flagship Store
              </p>
              <h2 className="text-4xl md:text-5xl font-light leading-tight mb-8">
                Experience
                <br />
                <span className="italic font-serif">Brilliance</span>
              </h2>
              <p className="text-gray-700 font-light leading-relaxed mb-8">
                Visit our flagship boutique in the heart of New York's Diamond
                District. Experience our exquisite collections and enjoy
                personalized consultations with our certified gemologists.
              </p>
              <Link
                to="/"
                className="inline-block px-8 py-3 border border-black text-black text-sm font-light tracking-widest uppercase hover:bg-black hover:text-white transition-all duration-300"
              >
                Get Directions
              </Link>
            </div>
            <div className="aspect-[4/3] bg-gray-200 rounded-sm overflow-hidden">
              <img
                src="https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg"
                alt="Brilliance Store"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Preview */}
      <section className="py-20 px-6 lg:px-12 border-t border-gray-200">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-light mb-8">
            Frequently Asked{" "}
            <span className="italic font-serif">Questions</span>
          </h2>
          <div className="space-y-8 text-left">
            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-200 text-gray-700 hover:text-black transition-colors">
                <span className="font-light text-lg">
                  What is your return policy?
                </span>
                <span className="text-2xl font-light group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="py-4 text-gray-600 font-light leading-relaxed">
                We offer complimentary returns within 30 days of purchase for
                all jewelry in its original condition with certificates and
                packaging.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-200 text-gray-700 hover:text-black transition-colors">
                <span className="font-light text-lg">
                  Do you offer international shipping?
                </span>
                <span className="text-2xl font-light group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="py-4 text-gray-600 font-light leading-relaxed">
                Yes, we ship worldwide. International orders are delivered
                within 5-10 business days. Shipping costs and import duties vary
                by destination.
              </p>
            </details>

            <details className="group">
              <summary className="flex justify-between items-center cursor-pointer py-4 border-b border-gray-200 text-gray-700 hover:text-black transition-colors">
                <span className="font-light text-lg">
                  How can I determine my ring size?
                </span>
                <span className="text-2xl font-light group-open:rotate-45 transition-transform">
                  +
                </span>
              </summary>
              <p className="py-4 text-gray-600 font-light leading-relaxed">
                We provide a complimentary ring sizing guide with every order.
                For accurate sizing, visit our boutique for professional
                measurement or consult with our jewelry specialists online.
              </p>
            </details>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default ContactUs;
