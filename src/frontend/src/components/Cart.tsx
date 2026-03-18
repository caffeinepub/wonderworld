import { CreditCard, Footprints, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../contexts/CartContext";
import { useCreateCheckoutSession } from "../hooks/useQueries";

export default function Cart() {
  const {
    state,
    closeCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalPrice,
  } = useCart();
  const { mutate: createCheckoutSession, isPending } =
    useCreateCheckoutSession();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheckout = async () => {
    if (state.items.length === 0) return;
    setCheckoutLoading(true);
    try {
      const lineItems = state.items.map((item) => ({
        product_id: BigInt(item.product.id),
        quantity: BigInt(item.quantity),
      }));
      const successUrl = `${window.location.origin}/payment/success?checkout_session_id={CHECKOUT_SESSION_ID}`;
      const cancelUrl = `${window.location.origin}/`;
      createCheckoutSession(
        { lineItems, successUrl, cancelUrl },
        {
          onSuccess: (response) => {
            try {
              const data = JSON.parse(response);
              if (
                data !== null &&
                typeof data === "object" &&
                typeof data.url === "string" &&
                data.url.length > 0
              ) {
                clearCart();
                closeCart();
                window.location.href = data.url;
              } else {
                setError("No checkout URL received. Please contact owner.");
              }
            } catch {
              setError(
                "Error parsing checkout response. Please contact owner.",
              );
            } finally {
              setCheckoutLoading(false);
            }
          },
          onError: (err) => {
            setCheckoutLoading(false);
            setError(err.message);
          },
        },
      );
    } catch (err) {
      console.error("Error creating checkout session:", err);
      setCheckoutLoading(false);
    }
  };

  return (
    <>
      <div
        className={`fixed inset-0 bg-black z-50 transition-opacity duration-500 ${
          state.isOpen ? "bg-opacity-20" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={state.isOpen ? closeCart : undefined}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            if (state.isOpen) closeCart();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label="Close cart"
      />
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-lg bg-white z-50 transition-transform duration-500 ease-out ${
          state.isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div
          className={`flex flex-col h-full transition-opacity duration-200 ${state.isOpen ? "opacity-100 delay-150" : "opacity-0"}`}
        >
          <div className="flex items-center justify-between p-8 border-b border-gray-100">
            <h2 className="text-2xl font-light tracking-widest uppercase">
              Cart
            </h2>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 hover:bg-gray-50 rounded-full transition-colors"
            >
              <X className="w-5 h-5 stroke-[1.5] text-gray-600" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-8">
            {state.items.length === 0 ? (
              <div className="text-center py-16">
                <div className="mb-8">
                  <Footprints className="w-12 h-12 text-gray-300 mx-auto stroke-[1.5]" />
                </div>
                <h3 className="text-lg font-light mb-4 tracking-wide">
                  Your Cart is Empty
                </h3>
                <p className="text-sm text-gray-600 font-light mb-8">
                  Discover our collection and find your perfect pair
                </p>
                <button
                  type="button"
                  onClick={closeCart}
                  className="cursor-pointer px-8 py-3 bg-black text-white text-sm font-light tracking-widest uppercase hover:bg-gray-900 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                {state.items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex gap-6 py-6 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 overflow-hidden shrink-0">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Footprints className="w-8 h-8 text-gray-300 stroke-[1.5]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-light text-black mb-2 text-lg truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-gray-600 text-sm font-light mb-4">
                        ${(Number(item.product.price) / 100).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-light text-gray-500 uppercase tracking-wider">
                          Qty
                        </span>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <Minus className="w-3 h-3 text-gray-600 stroke-[1.5]" />
                          </button>
                          <span className="w-8 text-center text-sm font-light">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                            className="p-1.5 hover:bg-gray-50 rounded-full transition-colors"
                          >
                            <Plus className="w-3 h-3 text-gray-600 stroke-[1.5]" />
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="ml-auto text-xs font-light text-gray-500 hover:text-black transition-colors underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {state.items.length > 0 && (
            <div className="border-t border-gray-100 p-8 space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-light tracking-wide uppercase">
                  Total
                </span>
                <span className="text-xl font-light">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="space-y-4">
                {error && (
                  <div className="text-sm text-red-600 font-light">{error}</div>
                )}
                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={checkoutLoading || isPending}
                  className="w-full cursor-pointer bg-black text-white py-4 text-sm font-light tracking-widest uppercase hover:bg-gray-900 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {checkoutLoading || isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="w-4 h-4 stroke-[1.5]" />
                      Checkout
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full cursor-pointer text-gray-600 py-3 text-sm font-light hover:text-black transition-colors underline"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
