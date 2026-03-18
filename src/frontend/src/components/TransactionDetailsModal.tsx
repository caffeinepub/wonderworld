import { Loader2, MapPin, Package, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTransaction, useTransactionLineItems } from "../hooks/useQueries";

interface LineItem {
  id: string;
  description: string;
  amount_total: number;
  quantity: number;
  price?: {
    product?: {
      name?: string;
    };
  };
}

interface TransactionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
  sessionTitle?: string;
}

function TransactionDetailsModal({
  isOpen,
  onClose,
  sessionId,
  sessionTitle,
}: TransactionDetailsModalProps) {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [shippingDetails, setShippingDetails] = useState<any>(null);
  const {
    mutateAsync: fetchLineItems,
    isPending: loading,
    error: mutationError,
  } = useTransactionLineItems();
  const { data: transaction } = useTransaction(sessionId);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (isOpen && sessionId) {
      handleFetchLineItems();
      // Extract shipping details from transaction data
      if (transaction && "completed" in transaction) {
        try {
          const response = JSON.parse(transaction.completed.response);
          if (
            response !== null &&
            typeof response === "object" &&
            "shipping_details" in response &&
            response.shipping_details !== null &&
            response.shipping_details !== undefined
          ) {
            setShippingDetails(response.shipping_details);
          } else if (
            response !== null &&
            typeof response === "object" &&
            "collected_information" in response &&
            response.collected_information !== null &&
            typeof response.collected_information === "object" &&
            "shipping_details" in response.collected_information &&
            response.collected_information.shipping_details !== null &&
            response.collected_information.shipping_details !== undefined
          ) {
            setShippingDetails(response.collected_information.shipping_details);
          }
        } catch (err) {
          console.error("Error parsing shipping details:", err);
        }
      }
    }
  }, [isOpen, sessionId, transaction]);

  const handleFetchLineItems = async (startingAfter: string | null = null) => {
    setError(null);
    if (!startingAfter) {
      setLineItems([]); // Only clear items for initial fetch
    }

    try {
      const response = await fetchLineItems({ sessionId, startingAfter });
      const data = JSON.parse(response);

      if (
        data !== null &&
        typeof data === "object" &&
        "data" in data &&
        data.data !== null &&
        data.data !== undefined
      ) {
        if (startingAfter) {
          // Append to existing items for pagination
          setLineItems((prev) => [...prev, ...data.data]);
        } else {
          // Set items for initial fetch
          setLineItems(data.data);
        }

        // Check if there are more items to fetch
        if (
          data !== null &&
          typeof data === "object" &&
          "has_more" in data &&
          data.has_more === true &&
          Array.isArray(data.data) &&
          data.data.length > 0
        ) {
          setIsLoadingMore(true);
          const lastItemId = data.data[data.data.length - 1].id;
          // Automatically fetch next batch
          await handleFetchLineItems(lastItemId);
          setIsLoadingMore(false);
        }
      } else {
        setError("No line items found");
      }
    } catch (err) {
      console.error("Error fetching line items:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch line items",
      );
      setIsLoadingMore(false);
    }
  };

  // Handle mutation error
  useEffect(() => {
    if (mutationError) {
      setError(
        mutationError instanceof Error
          ? mutationError.message
          : "Failed to fetch line items",
      );
    }
  }, [mutationError]);

  const formatPrice = (amount: number) => {
    return (amount / 100).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black opacity-50"
        onClick={onClose}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
        role="presentation"
      />

      <div className="relative bg-white rounded-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-bold text-black">
              Transaction Details
            </h2>
            {sessionTitle && (
              <p className="text-sm text-gray-600 mt-1">{sessionTitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading && lineItems.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              <span className="ml-3 text-gray-600">Loading line items...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          ) : lineItems.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">
                No items found in this transaction
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Shipping Details Section */}
              {shippingDetails !== null &&
                typeof shippingDetails === "object" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <h3 className="text-lg font-semibold text-black">
                        Shipping Address
                      </h3>
                    </div>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium text-black">
                        {shippingDetails.name}
                      </p>
                      {shippingDetails.address !== null &&
                        shippingDetails.address !== undefined &&
                        typeof shippingDetails.address === "object" && (
                          <>
                            <p className="text-gray-700">
                              {shippingDetails.address.line1}
                            </p>
                            {shippingDetails.address.line2 !== null &&
                              shippingDetails.address.line2 !== undefined &&
                              typeof shippingDetails.address.line2 ===
                                "string" &&
                              shippingDetails.address.line2.length > 0 && (
                                <p className="text-gray-700">
                                  {shippingDetails.address.line2}
                                </p>
                              )}
                            <p className="text-gray-700">
                              {shippingDetails.address.city},{" "}
                              {shippingDetails.address.state}{" "}
                              {shippingDetails.address.postal_code}
                            </p>
                            <p className="text-gray-700">
                              {shippingDetails.address.country}
                            </p>
                          </>
                        )}
                    </div>
                  </div>
                )}

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-black mb-4">
                  Items ({lineItems.length})
                </h3>
              </div>

              {lineItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-medium text-black">
                        {item.price?.product?.name ||
                          item.description ||
                          "Product"}
                      </h4>
                      {item.description && item.price?.product?.name && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </span>
                        <span className="text-sm text-gray-500">
                          Unit Price: $
                          {formatPrice(item.amount_total / item.quantity)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-black">
                        ${formatPrice(item.amount_total)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  <span className="ml-2 text-gray-600 text-sm">
                    Loading more items...
                  </span>
                </div>
              )}

              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-black">
                    Total
                  </span>
                  <span className="text-lg font-bold text-black">
                    $
                    {formatPrice(
                      lineItems.reduce(
                        (sum, item) => sum + item.amount_total,
                        0,
                      ),
                    )}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TransactionDetailsModal;
