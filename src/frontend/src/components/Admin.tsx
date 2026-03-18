import {
  ArrowRight,
  BarChart3,
  CheckCircle,
  Clock,
  Coffee,
  Eye,
  Folder,
  Globe,
  Lock,
  LogOut,
  Package,
  Pencil,
  Plus,
  Receipt,
  Settings,
  Shield,
  ShoppingCart,
  Store,
  Trash2,
  Upload,
  UserMinus,
  UserPlus,
  Users,
  X,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  type Product,
  useAddAdmin,
  useAddAllowedOrigin,
  useAddCategory,
  useAddProduct,
  useAdmins,
  useAllCategories,
  useAllowedOrigins,
  useCategories,
  useClearAllCategories,
  useClearAllProducts,
  useClearAllTransactions,
  useDeleteCategory,
  useDeleteProduct,
  useDeleteTransaction,
  useEditProduct,
  useGetIsAdmin,
  useProducts,
  useRemoveAdmin,
  useRemoveAllowedOrigin,
  useSetStripeApiKey,
  useTransactions,
} from "../hooks/useQueries";
import Pagination from "./Pagination";
import { Link } from "./Router";
import TransactionDetailsModal from "./TransactionDetailsModal";

function shortenMiddle(str: string, visible = 8) {
  if (str.length <= visible * 2) return str;
  const start = str.slice(0, visible);
  const end = str.slice(-visible);
  return `${start}...${end}`;
}

function extractDomain(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.port
      ? `${urlObj.protocol}//${urlObj.hostname}:${urlObj.port}`
      : `${urlObj.protocol}//${urlObj.hostname}`;
  } catch (error) {
    console.error("Error extracting domain from URL:", error);
    return url;
  }
}

function Admin() {
  const { login, clear, identity } = useInternetIdentity();
  const [activeTab, setActiveTab] = useState("products");
  const [showProductModal, setShowProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false);
  const [_editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null,
  );
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);
  const [newAdminName, setNewAdminName] = useState("");

  // Bulk operations state
  const [selectedProducts, setSelectedProducts] = useState<Set<bigint>>(
    new Set(),
  );
  const [editingCells, setEditingCells] = useState<{ [key: string]: any }>({});
  const [bulkEditedProducts, setBulkEditedProducts] = useState<{
    [key: string]: Product;
  }>({});
  const [isBulkEditMode, setIsBulkEditMode] = useState(false);

  // Pagination state
  const [productsPage, setProductsPage] = useState(1);
  const [categoriesPage, setCategoriesPage] = useState(1);

  const { data: categories } = useCategories({
    page: categoriesPage,
    limit: 5,
  });
  const { data: products } = useProducts({ page: productsPage, limit: 5 });
  const { data: transactions } = useTransactions();
  const { data: allCategories } = useAllCategories();
  const { data: admins } = useAdmins();
  const { data: allowedOrigins } = useAllowedOrigins();

  const { mutate: addCategory } = useAddCategory();
  const { mutate: deleteCategory } = useDeleteCategory();

  const { mutateAsync: addProduct, isPending: isAddingProduct } =
    useAddProduct();
  const { mutateAsync: editProduct, isPending: isEditingProduct } =
    useEditProduct();
  const { mutate: deleteProduct } = useDeleteProduct();

  const { mutate: clearAllProducts, isPending: isClearingProducts } =
    useClearAllProducts();
  const { mutate: clearAllCategories, isPending: isClearingCategories } =
    useClearAllCategories();

  const { mutate: deleteTransaction, isPending: _isDeletingTransaction } =
    useDeleteTransaction();
  const { mutate: clearAllTransactions, isPending: isClearingTransactions } =
    useClearAllTransactions();

  const { mutate: setStripeApiKey, isPending: isSettingApiKey } =
    useSetStripeApiKey();
  const { mutate: addAdmin, isPending: isAddingAdmin } = useAddAdmin();
  const { mutate: removeAdmin, isPending: isRemovingAdmin } = useRemoveAdmin();

  const { mutate: addAllowedOrigin, isPending: isAddingOrigin } =
    useAddAllowedOrigin();
  const { mutate: removeAllowedOrigin, isPending: isRemovingOrigin } =
    useRemoveAllowedOrigin();

  // Success states
  const [apiKeySuccess, setApiKeySuccess] = useState(false);
  const [originSuccess, setOriginSuccess] = useState(false);

  // Compute revenue and orders from transactions
  const computeMetrics = () => {
    if (!transactions)
      return { totalRevenue: 0, totalOrders: 0, completedOrders: 0 };

    let totalRevenue = 0;
    let completedOrders = 0;

    for (const [_sessionId, status] of transactions) {
      if ("completed" in status) {
        completedOrders++;

        try {
          // Parse the Stripe response to get the amount
          const responseData = JSON.parse(status.completed.response);
          if (responseData.amount_total != null) {
            // Convert from cents to dollars
            totalRevenue += responseData.amount_total / 100;
          }
        } catch (error) {
          console.error("Error parsing transaction response:", error);
        }
      }
    }

    return {
      totalRevenue,
      totalOrders: transactions.length,
      completedOrders,
    };
  };

  const { totalRevenue, completedOrders } = computeMetrics();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAuthenticated = !!identity;
  const { data, isFetching } = useGetIsAdmin();
  const [isLoading, setIsLoading] = useState(true);

  const [newProduct, setNewProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [editProductForm, setEditProductForm] = useState({
    id: BigInt(0),
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
  });
  const [newCategory, setNewCategory] = useState({
    name: "",
    description: "",
    image: "",
  });
  const [newOrigin, setNewOrigin] = useState("");
  const [settings, setSettings] = useState({
    stripeApiKey: "",
  });

  const [isDragOver, setIsDragOver] = useState(false);

  // Error and success states for modals
  const [productError, setProductError] = useState<string | null>(null);
  const [productSuccess, setProductSuccess] = useState(false);
  const [editProductError, setEditProductError] = useState<string | null>(null);
  const [editProductSuccess, setEditProductSuccess] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [adminSuccess, setAdminSuccess] = useState(false);
  const [originError, setOriginError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (isAuthenticated) {
      await clear();
    } else {
      try {
        await login();
      } catch (error: unknown) {
        console.error("Login error:", error);
      }
    }
  };

  const handleLogout = async () => {
    await clear();
  };

  const handleDeleteTransaction = async (sessionId: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(sessionId);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);

    try {
      const productData = {
        id: BigInt(0),
        name: newProduct.name,
        description: newProduct.description,
        price: BigInt(Math.round(Number.parseFloat(newProduct.price) * 100)),
        category: newProduct.category,
        image: newProduct.image,
      };

      addProduct(productData, {
        onSuccess: () => {
          setProductSuccess(true);
          setNewProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            image: "",
          });
          setTimeout(() => {
            setShowProductModal(false);
            setProductSuccess(false);
          }, 1500);
        },
        onError: (error: any) => {
          console.error("Error adding product:", error);
          const errorMessage = error?.message ?? "Failed to add product";
          setProductError(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error in handleAddProduct:", error);
      setProductError("An unexpected error occurred");
    }
  };

  const handleEditProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditProductError(null);

    try {
      const productData = {
        id: editProductForm.id,
        name: editProductForm.name,
        description: editProductForm.description,
        price: BigInt(
          Math.round(Number.parseFloat(editProductForm.price) * 100),
        ),
        category: editProductForm.category,
        image: editProductForm.image,
      };
      editProduct(productData, {
        onSuccess: () => {
          setEditProductSuccess(true);
          setTimeout(() => {
            setShowEditProductModal(false);
            setEditProductSuccess(false);
            setEditingProduct(null);
          }, 1500);
        },
        onError: (error: any) => {
          console.error("Error editing product:", error);
          const errorMessage = error?.message ?? "Failed to edit product";
          setEditProductError(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error in handleEditProduct:", error);
      setEditProductError("An unexpected error occurred");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addCategory(newCategory);
      setNewCategory({ name: "", description: "", image: "" });
      setShowCategoryModal(false);
    } catch (error) {
      console.error("Failed to add category:", error);
      // Keep modal open to show error or retry
    }
  };

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);

    if (!newAdminName.trim()) {
      setAdminError("Admin name is required");
      return;
    }

    try {
      addAdmin(newAdminName.trim(), {
        onSuccess: () => {
          setAdminSuccess(true);
          setNewAdminName("");
          setTimeout(() => {
            setShowAddAdminModal(false);
            setAdminSuccess(false);
          }, 1500);
        },
        onError: (error: any) => {
          console.error("Error adding admin:", error);
          const errorMessage = error?.message ?? "Failed to add admin";
          setAdminError(errorMessage);
        },
      });
    } catch (error) {
      console.error("Error in handleAddAdmin:", error);
      setAdminError("An unexpected error occurred");
    }
  };

  const handleRemoveAdmin = (adminName: string) => {
    if (
      window.confirm(`Are you sure you want to remove admin: ${adminName}?`)
    ) {
      removeAdmin(adminName, {
        onError: (error: any) => {
          console.error("Error removing admin:", error);
          alert("Failed to remove admin");
        },
      });
    }
  };

  // Bulk operations handlers
  const handleSelectProduct = (productId: bigint) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      newSelected.add(productId);
    }
    setSelectedProducts(newSelected);
  };

  const handleSelectAllProducts = (checked: boolean) => {
    if (checked && products?.items) {
      setSelectedProducts(new Set(products.items.map((p) => p.id)));
    } else {
      setSelectedProducts(new Set());
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedProducts.size} selected products? This action cannot be undone.`,
      )
    ) {
      const deletePromises = Array.from(selectedProducts).map(
        (productId) =>
          new Promise((resolve) => {
            deleteProduct(productId, {
              onSettled: () => resolve(null),
            });
          }),
      );

      await Promise.all(deletePromises);
      // Clear all states after bulk delete
      setSelectedProducts(new Set());
      setIsBulkEditMode(false);
      setBulkEditedProducts({});
      setEditingCells({});
    }
  };

  const handleCellEdit = (productId: bigint, field: string, value: any) => {
    const key = `${productId.toString()}-${field}`;
    setEditingCells((prev) => ({ ...prev, [key]: value }));

    const product = products?.items?.find((p) => p.id === productId);
    if (product != null) {
      setBulkEditedProducts((prev) => ({
        ...prev,
        [productId.toString()]: {
          ...(prev[productId.toString()] ?? product),
          [field]:
            field === "price"
              ? BigInt(Math.round(Number.parseFloat(value) * 100))
              : value,
        },
      }));
    }
  };

  const handleBulkUpdate = async () => {
    try {
      const productsToUpdate = Object.entries(bulkEditedProducts);
      if (productsToUpdate.length === 0) return;

      if (
        window.confirm(
          `Are you sure you want to update ${productsToUpdate.length} products?`,
        )
      ) {
        for (const [_, product] of productsToUpdate) {
          editProduct(product);
        }

        setSelectedProducts(new Set());
        setIsBulkEditMode(false);
        setBulkEditedProducts({});
        setEditingCells({});
      }
    } catch (error) {
      console.error("Error in handleBulkUpdate:", error);
    }
  };

  const getCellValue = (product: Product, field: string) => {
    const key = `${product.id.toString()}-${field}`;
    if (key in editingCells) {
      return editingCells[key];
    }

    if (field === "price") {
      return (Number(product.price) / 100).toFixed(2);
    }
    return product[field as keyof Product];
  };

  const isProductEditable = (productId: bigint) => {
    return isBulkEditMode && selectedProducts.has(productId);
  };

  const isProductEdited = (productId: bigint) => {
    return productId.toString() in bulkEditedProducts;
  };

  const handleFileUpload = (file: File, isEdit = false) => {
    if (file != null) {
      // Check file size (0.5MB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        alert("File size must be less than 0.5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        if (isEdit) {
          setEditProductForm({ ...editProductForm, image: base64String });
        } else {
          setNewProduct({ ...newProduct, image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadCategory = (file: File) => {
    if (file != null) {
      // Check file size (0.5MB = 500 * 1024 bytes)
      if (file.size > 500 * 1024) {
        alert("File size must be less than 0.5MB");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = event.target?.result as string;
        setNewCategory({ ...newCategory, image: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent, isEdit = false) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith("image/")) {
        // Check file size (1MB = 1024 * 1024 bytes)
        if (file.size > 1024 * 1024) {
          alert("File size must be less than 1MB");
          return;
        }
        handleFileUpload(file, isEdit);
      }
    }
  };

  const getTransactionStatusIcon = (status: any) => {
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

  const getTransactionStatusText = (status: any) => {
    if ("completed" in status) return "Completed";
    if ("failed" in status) return "Failed";
    if ("checking" in status) return "Processing";
    return "Unknown";
  };

  const getTransactionStatusColor = (status: any) => {
    if ("completed" in status) return "text-green-600 bg-green-50";
    if ("failed" in status) return "text-red-600 bg-red-50";
    if ("checking" in status) return "text-yellow-600 bg-yellow-50";
    return "text-gray-600 bg-gray-50";
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setEditProductForm({
      id: product.id,
      name: product.name,
      description: product.description,
      price: (Number(product.price) / 100).toFixed(2),
      category: product.category,
      image: product.image || "",
    });
    setShowEditProductModal(true);
    setEditProductError(null);
    setEditProductSuccess(false);
  };

  // Reset pagination when switching tabs
  useEffect(() => {
    if (activeTab === "products") {
      setProductsPage(1);
    } else if (activeTab === "categories") {
      setCategoriesPage(1);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!isAuthenticated || (isAuthenticated && data != null)) {
      setIsLoading(false);
      return;
    }

    if (isFetching) {
      setIsLoading(true);
      return;
    }

    // Once fetching is complete
    if (data === true) {
      // User is admin - clear any timeout and stop loading
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsLoading(false);
    } else if (data === false) {
      // User is not admin - schedule logout
      setIsLoading(false);
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          clear();
        }, 30000);
      }
    }

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [isAuthenticated, isFetching, data, clear]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-white flex">
        <div className="flex-1 p-6 bg-gray-50 hidden md:block">
          <div className="flex gap-2 items-center text-lg font-semibold">
            <Store /> Webstore manager
          </div>
        </div>
        <div className="flex-1 p-6 relative flex items-center justify-center">
          <Link
            to="/"
            className="absolute top-6 right-6 cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg transition-colors"
          >
            <Store className="w-4 h-4" />
            View Store
          </Link>
          <main className="flex-1 flex items-center justify-center max-w-full sm:max-w-xs">
            <div className="max-w-md w-full text-center">
              {/* Title */}
              <h1 className="text-3xl font-bold text-black mb-2 tracking-tight">
                Sign in
              </h1>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Manage your webstore
              </p>

              {/* Login Button */}
              <button
                type="button"
                className="w-full bg-black text-sm text-white border-2 border-black px-3 py-2 font-medium cursor-pointer transition-all duration-300 tracking-wider hover:bg-transparent hover:text-black flex items-center justify-center gap-3 rounded-lg"
                onClick={handleLogin}
              >
                Sign in
              </button>

              {/* Security Notice */}
              <div className="mt-8">
                <p className="text-gray-600 text-sm leading-relaxed mx-auto max-w-full sm:max-w-60">
                  Secure authentication powered by Internet Computer Protocol
                </p>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Show loading while checking admin status
  if (isLoading || data == null) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4" />
          <p className="text-gray-600">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Show admin dashboard if authenticated and is admin
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <h1 className="text-2xl font-light tracking-widest text-black uppercase">
                  Brilliance Admin
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-black border border-gray-200 rounded-lg transition-colors"
              >
                <Store className="w-4 h-4" />
                View Store
              </Link>
              <button
                type="button"
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 border border-gray-200 rounded-lg transition-colors"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">
                  Total Products
                </p>
                <p className="text-2xl font-bold text-black">
                  {products?.totalItems ?? 0}
                </p>
              </div>
              <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Package className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Categories</p>
                <p className="text-2xl font-bold text-black">
                  {categories?.totalItems ?? 0}
                </p>
              </div>
              <div className="bg-green-50 w-12 h-12 rounded-full flex items-center justify-center">
                <Folder className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Revenue</p>
                <p className="text-2xl font-bold text-black">
                  $
                  {totalRevenue.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-purple-50 w-12 h-12 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Orders</p>
                <p className="text-2xl font-bold text-black">
                  {completedOrders}
                </p>
              </div>
              <div className="bg-orange-50 w-12 h-12 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="border-b border-gray-200 flex justify-between">
            <nav className="flex">
              <button
                type="button"
                className={`cursor-pointer flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "products"
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("products")}
              >
                <Package className="w-4 h-4" />
                Products
              </button>
              <button
                type="button"
                className={`cursor-pointer flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "categories"
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("categories")}
              >
                <Folder className="w-4 h-4" />
                Categories
              </button>
              <button
                type="button"
                className={`cursor-pointer flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "transactions"
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("transactions")}
              >
                <Receipt className="w-4 h-4" />
                Transactions
              </button>
              <button
                type="button"
                className={`cursor-pointer flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "settings"
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("settings")}
              >
                <Settings className="w-4 h-4" />
                Settings
              </button>
              <button
                type="button"
                className={`cursor-pointer flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === "admins"
                    ? "border-black text-black bg-gray-50"
                    : "border-transparent text-gray-600 hover:text-black hover:bg-gray-50"
                }`}
                onClick={() => setActiveTab("admins")}
              >
                <Users className="w-4 h-4" />
                Admins
              </button>
            </nav>
          </div>

          {/* Products Tab */}
          {activeTab === "products" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Products Management
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="cursor-pointer flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete ALL products? This action cannot be undone.",
                        )
                      ) {
                        clearAllProducts();
                      }
                    }}
                    disabled={isClearingProducts}
                  >
                    {isClearingProducts ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear All Products
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => {
                      setShowProductModal(true);
                      setProductError(null);
                      setProductSuccess(false);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Product
                  </button>
                </div>
              </div>

              {/* Bulk Actions Section */}
              {selectedProducts.size > 0 && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 flex items-center justify-between gap-4">
                      <div className="text-blue-800 font-medium">
                        {selectedProducts.size} product
                        {selectedProducts.size !== 1 ? "s" : ""} selected
                      </div>
                      {!isBulkEditMode && (
                        <button
                          type="button"
                          className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                          onClick={() => setIsBulkEditMode(true)}
                        >
                          <Pencil className="w-4 h-4" />
                          Bulk Edit
                        </button>
                      )}
                      {isBulkEditMode && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="cursor-pointer flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            onClick={handleBulkUpdate}
                            disabled={
                              Object.keys(bulkEditedProducts).length === 0
                            }
                          >
                            <Pencil className="w-4 h-4" />
                            Apply Changes{" "}
                            {Object.keys(bulkEditedProducts).length > 0 &&
                              `(${Object.keys(bulkEditedProducts).length})`}
                          </button>
                          <button
                            type="button"
                            className="cursor-pointer flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                            onClick={() => {
                              setIsBulkEditMode(false);
                              setBulkEditedProducts({});
                              setEditingCells({});
                            }}
                          >
                            Cancel Edit
                          </button>
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      className="cursor-pointer flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                      onClick={handleBulkDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Selected
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        <input
                          type="checkbox"
                          checked={
                            Boolean(products?.items?.length) &&
                            selectedProducts.size === products?.items?.length
                          }
                          onChange={(e) =>
                            handleSelectAllProducts(e.target.checked)
                          }
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Price
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products?.items != null && products.items.length > 0 ? (
                      products.items.map((product) => (
                        <tr
                          key={product.id}
                          className={`border-b border-gray-100 hover:bg-gray-50 ${
                            selectedProducts.has(product.id) ? "bg-blue-50" : ""
                          } ${
                            isProductEdited(product.id)
                              ? "ring-2 ring-blue-300"
                              : ""
                          }`}
                        >
                          <td className="py-4 px-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-gray-300 text-black focus:ring-black"
                            />
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Coffee className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                {isProductEditable(product.id) ? (
                                  <>
                                    <input
                                      type="text"
                                      value={getCellValue(product, "name")}
                                      onChange={(e) =>
                                        handleCellEdit(
                                          product.id,
                                          "name",
                                          e.target.value,
                                        )
                                      }
                                      className="font-semibold text-black bg-white border border-blue-300 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-full"
                                      placeholder="Product name"
                                    />
                                    <textarea
                                      value={getCellValue(
                                        product,
                                        "description",
                                      )}
                                      onChange={(e) =>
                                        handleCellEdit(
                                          product.id,
                                          "description",
                                          e.target.value,
                                        )
                                      }
                                      className="text-gray-600 text-sm bg-white border border-blue-300 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-full resize-none mt-1"
                                      rows={2}
                                      placeholder="Product description"
                                    />
                                  </>
                                ) : (
                                  <>
                                    <h3 className="font-semibold text-black">
                                      {product.name}
                                    </h3>
                                    <p className="text-gray-600 text-sm line-clamp-1">
                                      {product.description}
                                    </p>
                                  </>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {isProductEditable(product.id) ? (
                              <select
                                value={getCellValue(product, "category")}
                                onChange={(e) =>
                                  handleCellEdit(
                                    product.id,
                                    "category",
                                    e.target.value,
                                  )
                                }
                                className="bg-white border border-blue-300 text-gray-800 px-2 py-1 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 w-full"
                              >
                                {allCategories?.map((category) => (
                                  <option key={category} value={category}>
                                    {category}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-lg text-sm">
                                {product.category}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            {isProductEditable(product.id) ? (
                              <div className="flex items-center">
                                <span className="mr-1">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={getCellValue(product, "price")}
                                  onChange={(e) =>
                                    handleCellEdit(
                                      product.id,
                                      "price",
                                      e.target.value,
                                    )
                                  }
                                  className="font-semibold text-black bg-white border border-blue-300 focus:ring-1 focus:ring-blue-500 rounded px-2 py-1 w-24"
                                  placeholder="0.00"
                                />
                              </div>
                            ) : (
                              <span className="font-semibold text-black">
                                $
                                {(Number(product.price) / 100).toLocaleString(
                                  "en-US",
                                  {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2,
                                  },
                                )}
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                onClick={() => openEditProductModal(product)}
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                className="cursor-pointer text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                onClick={() => deleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-gray-500"
                        >
                          No products found. Create your first product to get
                          started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Products Pagination */}
              {products && products.totalPages > 1 && (
                <Pagination
                  currentPage={Number(productsPage)}
                  totalPages={Number(products.totalPages)}
                  onPageChange={(page) => setProductsPage(Number(page))}
                  totalItems={Number(products.totalItems)}
                  itemsPerPage={10}
                />
              )}
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Categories Management
                </h2>
                <div className="flex gap-3">
                  <button
                    type="button"
                    className="cursor-pointer flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete ALL categories? This action cannot be undone.",
                        )
                      ) {
                        clearAllCategories();
                      }
                    }}
                    disabled={isClearingCategories}
                  >
                    {isClearingCategories ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear All Categories
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                    onClick={() => setShowCategoryModal(true)}
                  >
                    <Plus className="w-4 h-4" />
                    Add Category
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Category
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Products
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories?.items && categories?.items?.length > 0 ? (
                      categories?.items?.map((category) => (
                        <tr
                          key={category.name}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="bg-gray-100 w-12 h-12 rounded-lg flex items-center justify-center">
                                {category.image ? (
                                  <img
                                    src={category.image}
                                    alt={category.name}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                ) : (
                                  <Folder className="w-6 h-6 text-gray-500" />
                                )}
                              </div>
                              <div>
                                <h3 className="font-semibold text-black">
                                  {category.name}
                                </h3>
                                <p className="text-gray-600 text-sm">
                                  {category.description}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="text-gray-600">
                              {products?.items?.filter(
                                (p) => p.category === category.name,
                              ).length ?? 0}{" "}
                              products
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <button
                              type="button"
                              className="cursor-pointer text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              onClick={() => deleteCategory(category.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-12 text-center text-gray-500"
                        >
                          No categories found. Create your first category to
                          organize products.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Categories Pagination */}
              {categories && categories.totalPages > 1 && (
                <Pagination
                  currentPage={Number(categoriesPage)}
                  totalPages={Number(categories.totalPages)}
                  onPageChange={(page) => setCategoriesPage(Number(page))}
                  totalItems={Number(categories.totalItems)}
                  itemsPerPage={10}
                />
              )}
            </div>
          )}

          {/* Transactions Tab */}
          {activeTab === "transactions" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Transactions Management
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-500">
                    Total: {transactions?.length ?? 0} transactions
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        window.confirm(
                          "Are you sure you want to delete ALL transactions? This action cannot be undone.",
                        )
                      ) {
                        clearAllTransactions();
                      }
                    }}
                    disabled={
                      isClearingTransactions ||
                      (transactions?.length ?? 0) === 0
                    }
                    className="cursor-pointer flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isClearingTransactions ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                        Clearing...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Clear All Transactions
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Session ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        User Principal
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Details
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions && transactions.length > 0 ? (
                      transactions.map(([sessionId, status]) => (
                        <tr
                          key={sessionId}
                          className="border-b border-gray-100 hover:bg-gray-50"
                        >
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm text-gray-800">
                              {sessionId.slice(0, 16)}...
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="font-mono text-sm text-gray-600">
                              {"completed" in status &&
                              status.completed.userPrincipal
                                ? shortenMiddle(status.completed.userPrincipal)
                                : "N/A"}
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {getTransactionStatusIcon(status)}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getTransactionStatusColor(status)}`}
                              >
                                {getTransactionStatusText(status)}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            {"failed" in status ? (
                              <div className="text-sm text-red-600 max-w-xs truncate">
                                {status.failed.error}
                              </div>
                            ) : "completed" in status ? (
                              <div className="text-sm text-green-600">
                                Payment completed
                              </div>
                            ) : (
                              <div className="text-sm text-yellow-600">
                                Processing...
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2">
                              {"completed" in status && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedTransaction(sessionId)
                                  }
                                  className="cursor-pointer text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() =>
                                  handleDeleteTransaction(sessionId)
                                }
                                className="cursor-pointer text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className="py-12 text-center text-gray-500"
                        >
                          No transactions found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Admins Tab */}
          {activeTab === "admins" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">
                  Admin Management
                </h2>
                <button
                  type="button"
                  className="cursor-pointer flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors"
                  onClick={() => {
                    setShowAddAdminModal(true);
                    setAdminError(null);
                    setAdminSuccess(false);
                  }}
                >
                  <UserPlus className="w-4 h-4" />
                  Add Admin
                </button>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-black">Current Admins</h3>
                    <p className="text-gray-600 text-sm">
                      Manage who has administrative access to the system
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {admins && admins.length > 0 ? (
                    admins.map((admin) => (
                      <div
                        key={admin}
                        className="flex items-center justify-between bg-white border border-gray-200 rounded-lg p-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-100 w-10 h-10 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <p className="font-medium text-black">
                              {admin.trim()}
                            </p>
                            <p className="text-sm text-gray-600">
                              Administrator
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="cursor-pointer flex items-center gap-2 text-red-600 hover:text-red-800 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={() => handleRemoveAdmin(admin.trim())}
                          disabled={isRemovingAdmin}
                        >
                          {isRemovingAdmin ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600" />
                          ) : (
                            <UserMinus className="w-4 h-4" />
                          )}
                          Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">No admins found</p>
                      <p className="text-gray-400 text-sm">
                        Add your first administrator to get started
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-black">Settings</h2>
                <div className="text-sm text-gray-500">
                  Configure Stripe integration and allowed domains settings
                </div>
              </div>

              <div className="max-w-2xl space-y-8">
                {/* Stripe API Key Section */}
                <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-blue-50 w-10 h-10 rounded-lg flex items-center justify-center">
                      <Receipt className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        Stripe API Key
                      </h3>
                      <p className="text-gray-600 text-sm">
                        Configure your Stripe API key for payment processing
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="stripe-api-key"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Stripe API Key (Write access for checkout sessions)
                      </label>
                      <input
                        id="stripe-api-key"
                        type="password"
                        value={settings.stripeApiKey}
                        onChange={(e) =>
                          setSettings({
                            ...settings,
                            stripeApiKey: e.target.value,
                          })
                        }
                        placeholder="sk_test_... or rk_test_..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        For security, only use restricted keys with write access
                        to checkout sessions
                      </p>
                    </div>

                    <button
                      type="button"
                      className="cursor-pointer flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => {
                        if (settings.stripeApiKey.trim()) {
                          setApiKeySuccess(false);
                          setStripeApiKey(settings.stripeApiKey.trim(), {
                            onSuccess: () => {
                              setApiKeySuccess(true);
                              setTimeout(() => setApiKeySuccess(false), 3000);
                            },
                          });
                        }
                      }}
                      disabled={
                        !settings.stripeApiKey.trim() || isSettingApiKey
                      }
                    >
                      {isSettingApiKey ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Settings className="w-4 h-4" />
                          Save Stripe API Key
                        </>
                      )}
                    </button>

                    {apiKeySuccess && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Stripe API key saved successfully!
                      </div>
                    )}
                  </div>
                </div>

                {/* Allowed Origins Section */}
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                      <Globe className="h-5 w-5 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-black">
                        Allowed Origins
                      </h3>
                      <p className="text-sm text-gray-600">
                        Configure allowed domains for checkout URLs (maximum
                        10). This validates that success and cancel URLs are
                        from approved domains.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Add New Origin */}
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={newOrigin}
                        onChange={(e) => setNewOrigin(e.target.value)}
                        placeholder="example.com"
                        className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-black"
                      />
                      <button
                        type="button"
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-black px-4 py-2 text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() => {
                          const originToAdd = newOrigin.trim();
                          if (originToAdd) {
                            setOriginSuccess(false);
                            setOriginError(null);

                            const normalizedOrigin = extractDomain(originToAdd);

                            if (normalizedOrigin) {
                              addAllowedOrigin(normalizedOrigin, {
                                onSuccess: (message) => {
                                  if (message === "Successfully added origin") {
                                    setNewOrigin("");
                                    setOriginSuccess(true);
                                    setTimeout(
                                      () => setOriginSuccess(false),
                                      3000,
                                    );
                                  }
                                },
                              });

                              return;
                            }

                            setOriginError(
                              "Invalid origin. Please use a valid URL.",
                            );
                          }
                        }}
                        disabled={!newOrigin.trim() || isAddingOrigin}
                      >
                        {isAddingOrigin ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Plus className="h-4 w-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>

                    {/* Error Message */}
                    {originError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                        <p className="text-sm font-medium text-red-800">
                          {originError}
                        </p>
                      </div>
                    )}

                    {originSuccess && (
                      <div className="flex items-center gap-2 text-sm font-medium text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        Origin added successfully!
                      </div>
                    )}

                    {/* Current Origins List */}
                    <div className="space-y-2">
                      <label
                        htmlFor="allowed-origins-info"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Current Allowed Origins ({allowedOrigins?.length ?? 0}
                        /10)
                      </label>
                      {allowedOrigins != null && allowedOrigins.length > 0 ? (
                        <div className="max-h-40 space-y-2 overflow-y-auto">
                          {allowedOrigins.map((origin) => (
                            <div
                              key={origin}
                              className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-3"
                            >
                              <span className="font-mono text-sm text-gray-700">
                                {origin}
                              </span>
                              <button
                                type="button"
                                className="cursor-pointer rounded-md p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-800 disabled:opacity-50"
                                onClick={() => removeAllowedOrigin(origin)}
                                disabled={isRemovingOrigin}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm italic text-gray-500">
                          No origins configured. Add origins to restrict
                          checkout URLs.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Instructions Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                  <h3 className="font-semibold text-black mb-3 flex items-center gap-2">
                    <Coffee className="w-5 h-5 text-blue-600" />
                    Setup Instructions
                  </h3>
                  <div className="space-y-3 text-sm text-gray-700">
                    <div>
                      <strong>1. Stripe API Key:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>
                          Go to your Stripe Dashboard → Developers → API keys
                        </li>
                        <li>Create a restricted key with read access to:</li>
                        <li className="ml-4">Checkout Sessions</li>
                        <li>Copy the key and paste it above</li>
                      </ul>
                    </div>
                    <div>
                      <strong>2. Allowed Origins:</strong>
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>
                          Add the domains where your success and cancel URLs for
                          checkout will be hosted
                        </li>
                        <li>
                          Do not include the protocol (https:// or http://)
                        </li>
                        <li>Maximum of 10 origins can be configured</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Product Modal */}
      {showProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowProductModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowProductModal(false);
          }}
          role="presentation"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
          <div
            className="relative bg-white rounded-2xl w-full max-w-md my-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Add New Product</h3>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowProductModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) =>
                    setNewProduct({ ...newProduct, name: e.target.value })
                  }
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-desc"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  value={newProduct.description}
                  onChange={(e) =>
                    setNewProduct({
                      ...newProduct,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-image-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (max 0.5MB)
                      </p>
                    </div>
                    <input
                      id="product-image-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                {newProduct.image && (
                  <div className="mt-2">
                    <img
                      src={newProduct.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-price-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price ($)
                  </label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newProduct.price}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, price: e.target.value })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="product-category-input"
                    value={newProduct.category}
                    onChange={(e) =>
                      setNewProduct({ ...newProduct, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {allCategories?.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {productError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    {productError}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {productSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      Product added successfully!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingProduct || productSuccess}
                  className="cursor-pointer flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : productSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Added!
                    </>
                  ) : (
                    "Add Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {showEditProductModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowEditProductModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowEditProductModal(false);
          }}
          role="presentation"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
          <div
            className="relative bg-white rounded-2xl w-full max-w-md my-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Edit Product</h3>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowEditProductModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleEditProduct} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="product-name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Name
                </label>
                <input
                  type="text"
                  value={editProductForm.name}
                  onChange={(e) =>
                    setEditProductForm({
                      ...editProductForm,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-desc"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  value={editProductForm.description}
                  onChange={(e) =>
                    setEditProductForm({
                      ...editProductForm,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter product description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-image-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Product Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, true)}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (max 0.5MB)
                      </p>
                    </div>
                    <input
                      id="product-image-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUpload(e.target.files[0], true)
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                {editProductForm.image && (
                  <div className="mt-2">
                    <img
                      src={editProductForm.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="product-price-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Price ($)
                  </label>
                  <input
                    id="product-price-input"
                    type="number"
                    step="0.01"
                    min="0"
                    value={editProductForm.price}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        price: e.target.value,
                      })
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="product-category-input"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Category
                  </label>
                  <select
                    id="product-category-input"
                    value={editProductForm.category}
                    onChange={(e) =>
                      setEditProductForm({
                        ...editProductForm,
                        category: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                    required
                  >
                    <option value="">Select category</option>
                    {allCategories?.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Error Message */}
              {editProductError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    {editProductError}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {editProductSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      Product updated successfully!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowEditProductModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingProduct || editProductSuccess}
                  className="cursor-pointer flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isEditingProduct ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Updating...
                    </>
                  ) : editProductSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Updated!
                    </>
                  ) : (
                    "Update Product"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowCategoryModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowCategoryModal(false);
          }}
          role="presentation"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
          <div
            className="relative bg-white rounded-2xl w-full max-w-md my-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Add New Category</h3>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowCategoryModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="category-name-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Name
                </label>
                <input
                  id="category-name-input"
                  type="text"
                  value={newCategory.name}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, name: e.target.value })
                  }
                  placeholder="Enter category name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="product-desc"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) =>
                    setNewCategory({
                      ...newCategory,
                      description: e.target.value,
                    })
                  }
                  placeholder="Enter category description"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="category-image-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Category Image
                </label>
                <div className="flex items-center justify-center w-full">
                  <label
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                      isDragOver
                        ? "border-blue-400 bg-blue-50"
                        : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-3 text-gray-400" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG or JPEG (max 0.5MB)
                      </p>
                    </div>
                    <input
                      id="product-image-input"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        e.target.files?.[0] &&
                        handleFileUploadCategory(e.target.files[0])
                      }
                      className="hidden"
                    />
                  </label>
                </div>
                {newCategory.image && (
                  <div className="mt-2">
                    <img
                      src={newCategory.image}
                      alt="Preview"
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowCategoryModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="cursor-pointer flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  Add Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Admin Modal */}
      {showAddAdminModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowAddAdminModal(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setShowAddAdminModal(false);
          }}
          role="presentation"
        >
          <div className="fixed inset-0 bg-black opacity-50" />
          <div
            className="relative bg-white rounded-2xl w-full max-w-md my-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-black">Add New Admin</h3>
              <button
                type="button"
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setShowAddAdminModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleAddAdmin} className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="admin-principal-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Admin Principal ID
                </label>
                <input
                  id="admin-principal-input"
                  type="text"
                  value={newAdminName}
                  onChange={(e) => setNewAdminName(e.target.value)}
                  placeholder="Enter principal ID (e.g., rdmx6-jaaaa-aaaah-qcaiq-cai)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the principal ID of the user you want to make an admin
                </p>
              </div>

              {/* Error Message */}
              {adminError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 text-sm font-medium">
                    {adminError}
                  </p>
                </div>
              )}

              {/* Success Message */}
              {adminSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-4 h-4" />
                    <p className="text-sm font-medium">
                      Admin added successfully!
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowAddAdminModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingAdmin || adminSuccess}
                  className="cursor-pointer flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isAddingAdmin ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Adding...
                    </>
                  ) : adminSuccess ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Added!
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Add Admin
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Details Modal */}
      <TransactionDetailsModal
        isOpen={!!selectedTransaction}
        onClose={() => setSelectedTransaction(null)}
        sessionId={selectedTransaction || ""}
        sessionTitle={
          selectedTransaction
            ? `Transaction ${selectedTransaction.slice(0, 12)}...`
            : undefined
        }
      />
    </div>
  );
}

export default Admin;
