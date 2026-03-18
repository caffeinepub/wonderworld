import { Principal } from "@dfinity/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  Category,
  PaginationResult,
  PaginationResult_1,
  Product,
  Status,
} from "../backend";
import { useActor } from "./useActor";

export function useGetIsAdmin() {
  const { actor, isFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ["isAdmin"],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isAdmin();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProducts({
  category,
  page = 1,
  limit = 10,
}: {
  category?: string;
  page?: number;
  limit?: number;
}) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginationResult>({
    queryKey: ["products", category, page, limit],
    queryFn: async () => {
      if (!actor)
        return {
          items: [],
          totalItems: 0n,
          totalPages: 1n,
          currentPage: 1n,
          hasNextPage: false,
          hasPrevPage: false,
        };
      if (category && category !== "") {
        return actor.getProductsByCategory(
          category,
          BigInt(page),
          BigInt(limit),
        );
      }
      return actor.getProducts(BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllCategories() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["all-categories"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllCategories();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useCategories({
  page = 1,
  limit = 10,
}: {
  page?: number;
  limit?: number;
}) {
  const { actor, isFetching } = useActor();

  return useQuery<PaginationResult_1>({
    queryKey: ["categories", page, limit],
    queryFn: async () => {
      if (!actor)
        return {
          items: [],
          totalItems: 0n,
          totalPages: 1n,
          currentPage: 1n,
          hasNextPage: false,
          hasPrevPage: false,
        };
      return actor.getCategories(BigInt(page), BigInt(limit));
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, Status]>>({
    queryKey: ["transactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactions();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUserTransactions() {
  const { actor, isFetching } = useActor();

  return useQuery<Array<[string, Status]>>({
    queryKey: ["userTransactions"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransactionsByPrincipal();
    },
    enabled: !!actor && !isFetching,
  });
}

// Admin mutations for adding/deleting templates
export function useAddProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (template: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      image?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addProduct(
        template.name,
        template.description,
        template.price,
        template.category,
        template.image || "",
      );
    },
    onSuccess: () => {
      console.log("Product added successfully, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("useAddProduct mutation error:", error);
    },
  });
}

export function useEditProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (product: {
      id: bigint;
      name: string;
      description: string;
      price: bigint;
      category: string;
      image?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.editProduct(
        product.id,
        product.name,
        product.description,
        product.price,
        product.category,
        product.image && product.image.trim() !== "" ? product.image : null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error) => {
      console.error("useEditProduct mutation error:", error);
    },
  });
}

export function useDeleteProduct() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (productId: bigint) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteProduct(productId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

// Admin mutations for adding/deleting categories
export function useAddCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (category: {
      name: string;
      description: string;
      image?: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addCategory(
        category.name,
        category.description,
        category.image || null,
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useDeleteCategory() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoryName: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.deleteCategory(categoryName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useClearAllProducts() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.clearAllProducts();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useClearAllCategories() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.clearAllCategories();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      return await actor.deleteTransaction(sessionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useClearAllTransactions() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return await actor.clearAllTransactions();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useAddTransaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      if (!actor) throw new Error("Actor not available");
      const data = await actor.addTransaction(sessionId);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useTransactionLineItems() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      sessionId,
      startingAfter,
    }: {
      sessionId: string;
      startingAfter: string | null;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.getTransactionLineItems(sessionId, startingAfter);
    },
  });
}

export function useTransaction(sessionId: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Status | null>({
    queryKey: ["transaction", sessionId],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const result = await actor.getTransaction(sessionId);
      return result ?? null;
    },
    enabled: !!actor && !isFetching && !!sessionId,
  });
}

export function useSetStripeApiKey() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async (apiKey: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setAuthorization(apiKey);
    },
  });
}

export function useCreateCheckoutSession() {
  const { actor } = useActor();

  return useMutation({
    mutationFn: async ({
      lineItems,
      successUrl,
      cancelUrl,
    }: {
      lineItems: Array<{
        product_id: bigint;
        quantity: bigint;
      }>;
      successUrl: string;
      cancelUrl: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const data = actor.createCheckoutSession(
        lineItems,
        successUrl,
        cancelUrl,
      );
      return data;
    },
  });
}

export function useSetUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.setUser(name);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useUser() {
  const { actor, isFetching } = useActor();

  return useQuery<string | null>({
    queryKey: ["user"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const user = await actor.getUser();
      return user ?? null;
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addAdmin(Principal.fromText(name));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useRemoveAdmin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      if (!actor) throw new Error("Actor not available");
      await actor.removeAdmin(Principal.fromText(name));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admins"] });
    },
  });
}

export function useAdmins() {
  const { actor, isFetching } = useActor();

  return useQuery({
    queryKey: ["admins"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      const admins = await actor.getAdmins();
      return admins.map((admin: Principal) => admin.toString());
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllowedOrigins() {
  const { actor, isFetching } = useActor();

  return useQuery<string[]>({
    queryKey: ["allowedOrigins"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAllowedOrigins();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddAllowedOrigin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origin: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.addAllowedOrigin(origin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

export function useRemoveAllowedOrigin() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (origin: string) => {
      if (!actor) throw new Error("Actor not available");
      return actor.removeAllowedOrigin(origin);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowedOrigins"] });
    },
  });
}

export type { Product, Category, PaginationResult };
