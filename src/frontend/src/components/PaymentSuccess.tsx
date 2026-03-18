import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useActor } from "../hooks/useActor";
import { useAddTransaction } from "../hooks/useQueries";
import { Link } from "./Router";

function PaymentSuccess() {
  const searchParams = new URLSearchParams(window.location.search);
  const sessionId = searchParams.get("checkout_session_id");
  const { mutateAsync, isPending } = useAddTransaction();
  const { actor, isFetching } = useActor();

  const [transactionStatus, setTransactionStatus] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processTransaction = async () => {
      if (!sessionId || !actor || isFetching) {
        return;
      }

      try {
        setIsProcessing(true);
        const result = await mutateAsync(sessionId);

        // Handle the direct Status response from your backend
        if (result) {
          setTransactionStatus(result);

          // Handle different status types by checking which property exists
          if ("completed" in result) {
            setIsProcessing(false);
          } else if ("failed" in result) {
            setIsProcessing(false);
            setError(result.failed.error);
          } else if ("checking" in result) {
            // Keep processing, maybe retry after delay
            setTimeout(() => processTransaction(), 3000);
          } else {
            setIsProcessing(false);
            setError("Unknown payment status");
          }
        } else {
          setIsProcessing(false);
          setError("No transaction record found");
        }
      } catch (err) {
        console.error("Error processing transaction:", err);
      } finally {
        setIsProcessing(false);
      }
    };

    processTransaction();
  }, [sessionId, mutateAsync, actor, isFetching]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isProcessing || isPending) {
        e.preventDefault();
        e.returnValue =
          "Your payment is still being processed. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isProcessing, isPending]);

  // Render different states based on transaction status
  const renderContent = () => {
    // Still processing or pending
    if (isProcessing || isPending) {
      return (
        <>
          <div className="mx-auto mb-6 h-16 w-16 animate-spin rounded-full border-b-2 border-blue-600" />
          <h2 className="mb-4 text-3xl font-bold text-blue-800">
            Processing Payment...
          </h2>
          <div className="mb-6 rounded-lg bg-blue-50 p-4">
            <div className="flex items-center justify-center gap-2 text-blue-800">
              <Clock className="h-4 w-4" />
              <p className="font-medium">
                We're verifying your payment and processing your order. Please
                wait...
              </p>
            </div>
          </div>
        </>
      );
    }

    // Payment failed or error occurred
    if (
      error ||
      (transactionStatus !== null &&
        typeof transactionStatus === "object" &&
        "failed" in transactionStatus)
    ) {
      const errorMessage =
        error ||
        (transactionStatus !== null &&
        typeof transactionStatus === "object" &&
        "failed" in transactionStatus
          ? transactionStatus.failed.error
          : "Payment verification failed");

      return (
        <>
          <XCircle className="mx-auto mb-6 h-16 w-16 text-red-500" />
          <h2 className="mb-4 text-3xl font-bold text-red-800">
            Payment Issue
          </h2>
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <div className="flex items-center justify-center gap-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="font-medium">{errorMessage}</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-red-600 px-6 py-3 font-medium uppercase tracking-wider text-white transition-all hover:bg-red-700"
            >
              Try Again
            </button>

            <Link
              to="/"
              className="inline-flex w-full items-center justify-center gap-2 border border-gray-300 px-6 py-3 font-medium uppercase tracking-wider text-gray-700 transition-all hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Shop
            </Link>
          </div>
        </>
      );
    }

    // Payment successful
    if (
      transactionStatus !== null &&
      typeof transactionStatus === "object" &&
      "completed" in transactionStatus
    ) {
      return (
        <>
          <CheckCircle className="mx-auto mb-6 h-16 w-16 text-green-500" />
          <h2 className="mb-4 text-3xl font-bold text-green-800">Thank You!</h2>
          <div className="mb-6 rounded-lg bg-green-50 p-4">
            <p className="font-medium text-green-800">
              Your payment has been processed successfully. We appreciate your
              purchase!
            </p>
            <p className="mt-2 text-sm text-green-600">
              Order confirmed for: {transactionStatus.completed.userPrincipal}
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-black px-6 py-3 font-medium uppercase tracking-wider text-white transition-all hover:bg-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </>
      );
    }

    // Fallback for unknown states
    return (
      <>
        <AlertTriangle className="mx-auto mb-6 h-16 w-16 text-yellow-500" />
        <h2 className="mb-4 text-3xl font-bold text-yellow-800">
          Processing...
        </h2>
        <div className="mb-6 rounded-lg bg-yellow-50 p-4">
          <p className="font-medium text-yellow-800">
            We're still processing your payment. Please wait a moment.
          </p>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-light uppercase tracking-widest text-black">
            Brilliance
          </h1>
          <p className="text-gray-600">Fine Jewelry</p>
        </div>

        {/* Dynamic Content Card */}
        <div className="rounded-2xl bg-white p-8 text-center shadow-lg">
          {renderContent()}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccess;
