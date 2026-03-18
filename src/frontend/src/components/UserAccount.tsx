import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Copy,
  Eye,
  LogIn,
  LogOut,
  Package,
  Save,
  ShoppingBag,
  User,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import type { Status } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useSetUser, useUser, useUserTransactions } from "../hooks/useQueries";
import { Link } from "./Router";
import TransactionDetailsModal from "./TransactionDetailsModal";

const getTotalInvoice = (status: Status): string => {
  if ("completed" in status && "response" in status.completed) {
    const jsonText = status.completed.response;
    const json = JSON.parse(jsonText);
    return Number(json.amount_total / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return "0";
};

function UserAccount() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: userTransactions = [] } = useUserTransactions();
  const { data: user, isLoading: userLoading } = useUser();
  const { mutate: setUser, isPending: isSettingUser } = useSetUser();
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null,
  );
  const [isFetching, setIsFetching] = useState(true);
  const [userName, setUserName] = useState("");
  const [nameSuccess, setNameSuccess] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isLoadingActor = identity && actorFetching && !actor;

  const handleLogin = async () => {
    try {
      setError(null);
      await login();
    } catch (err) {
      console.error("Login error:", err);
      setError("Failed to login. Please try again.");
    }
  };

  const handleLogout = async () => {
    await clear();
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setUser(userName.trim(), {
      onSuccess: () => {
        setNameSuccess(true);
        setTimeout(() => setNameSuccess(false), 3000);
      },
      onError: (error) => {
        console.error("Error saving name:", error);
        setError("Failed to save name. Please try again.");
      },
    });
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if desired
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  const getStatusIcon = (status: Status) => {
    if ("completed" in status) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if ("failed" in status) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    if ("checking" in status) {
      return <Clock className="w-5 h-5 text-yellow-500" />;
    }
    return null;
  };

  const getStatusText = (status: Status) => {
    if ("completed" in status) return "Completed";
    if ("failed" in status) return "Failed";
    if ("checking" in status) return "Processing";
    return "Unknown";
  };

  const getStatusColor = (status: Status) => {
    if ("completed" in status) return "text-green-600 bg-green-50";
    if ("failed" in status) return "text-red-600 bg-red-50";
    if ("checking" in status) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional
  useEffect(() => {
    if (!identity) {
      setIsFetching(false);
      return;
    }

    if (userLoading) {
      setIsFetching(true);
      return;
    }

    if (user) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsFetching(false);
    } else {
      timeoutRef.current = setTimeout(() => {
        setIsFetching(false);
      }, 5000);
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [identity, setIsFetching, user]);

  if (isInitializing === true || isLoadingActor === true || !actor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-gray-600">Connecting...</p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">Brilliance</h1>
            <p className="text-gray-600">Fine Jewelry</p>
          </div>

          {/* Login Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">User Login</h2>
              <p className="text-gray-600">
                Sign in to view your orders and account
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="w-full bg-black text-white px-6 py-3 font-medium uppercase tracking-wider transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoggingIn ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    Sign in
                  </>
                )}
              </button>

              <div className="text-center">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Store
                </Link>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm">
              New to Internet Identity? It will create an account for you
              automatically.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (identity !== null && (isFetching || user === undefined)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (identity !== null && user === null && !isFetching) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-black mb-2">Brilliance</h1>
            <p className="text-gray-600">Fine Jewelry</p>
          </div>

          {/* Name Setup Card */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-lg p-8">
            <div className="text-center mb-8">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-black mb-2">Welcome!</h2>
              <p className="text-gray-600">
                Please tell us your name to complete your profile
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {nameSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <p className="text-sm font-medium">
                    Name saved successfully!
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSaveName} className="space-y-4">
              <div>
                <label
                  htmlFor="user-name-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  id="user-name-input"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                  disabled={isSettingUser}
                />
              </div>

              <button
                type="submit"
                disabled={isSettingUser || !userName.trim()}
                className="w-full bg-black text-white px-6 py-3 font-medium uppercase tracking-wider transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSettingUser ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Name
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Principal Info */}
          <div className="text-center mt-8">
            <p className="text-gray-500 text-sm mb-2">
              Your Internet Identity:
            </p>
            <p className="text-gray-700 text-sm font-mono bg-white px-3 py-2 rounded-lg border">
              {identity.getPrincipal().toString()}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show dashboard view if authenticated and user is set
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-light tracking-widest text-black uppercase">
                Brilliance
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {user ||
                    `${identity.getPrincipal().toString().slice(0, 8)}...`}
                </span>
              </div>
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                Shopping
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black mb-2">
            Welcome Back{user ? `, ${user}` : ""}!
          </h1>
          <p className="text-gray-600">
            Manage your orders and account settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-50 p-3 rounded-full">
                <ShoppingBag className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {userTransactions.length}
                </h3>
                <p className="text-gray-600">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {
                    userTransactions.filter(
                      ([_, status]) => "completed" in status,
                    ).length
                  }
                </h3>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="bg-purple-50 p-3 rounded-full">
                <Package className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-black">
                  {
                    userTransactions.filter(
                      ([_, status]) => "checking" in status,
                    ).length
                  }
                </h3>
                <p className="text-gray-600">Processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Account Info Section */}
        <div className="bg-white rounded-2xl shadow-lg mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">
              Account Information
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <p className="block text-sm font-medium text-gray-700 mb-2">
                  Principal ID
                </p>
                <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <code className="flex-1 text-sm font-mono text-gray-800 break-all">
                    {identity.getPrincipal().toString()}
                  </code>
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(identity.getPrincipal().toString())
                    }
                    className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-black border border-gray-300 rounded-md hover:bg-white transition-colors"
                    title="Copy Principal ID"
                  >
                    <Copy className="w-4 h-4" />
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Your unique Internet Identity principal
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-2xl shadow-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-black">Your Orders</h2>
          </div>

          <div className="p-6">
            {userTransactions.length === 0 ? (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start shopping to see your orders here
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 font-medium uppercase tracking-wider transition-all hover:bg-gray-800"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Start Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {userTransactions.map(([sessionId, status]) => (
                  <div
                    key={sessionId}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(status)}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-black">
                              Order #{sessionId.slice(0, 12)}...
                            </h3>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(sessionId)}
                              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                              title="Copy full session ID"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-sm text-gray-600">
                            Total: ${getTotalInvoice(status)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}
                        >
                          {getStatusText(status)}
                        </span>
                        {"completed" in status && (
                          <button
                            type="button"
                            onClick={() => setSelectedTransaction(sessionId)}
                            className="flex items-center gap-2 px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            View Details
                          </button>
                        )}
                      </div>
                    </div>

                    {"failed" in status && (
                      <div className="mt-3 p-3 bg-red-50 rounded-lg">
                        <p className="text-sm text-red-800">
                          Error: {status.failed.error}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        sessionId={selectedTransaction || ""}
        sessionTitle={
          selectedTransaction
            ? `Order #${selectedTransaction.slice(0, 12)}...`
            : undefined
        }
      />
    </div>
  );
}

export default UserAccount;
