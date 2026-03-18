import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Category {
    name: string;
    description: string;
    image?: string;
}
export type Status = {
    __kind__: "completed";
    completed: {
        userPrincipal?: string;
        response: string;
    };
} | {
    __kind__: "checking";
    checking: {
        userPrincipal?: string;
    };
} | {
    __kind__: "failed";
    failed: {
        error: string;
        userPrincipal?: string;
    };
};
export interface PaginationResult {
    currentPage: bigint;
    items: Array<Product>;
    totalPages: bigint;
    totalItems: bigint;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface PaginationResult_1 {
    currentPage: bigint;
    items: Array<Category>;
    totalPages: bigint;
    totalItems: bigint;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}
export interface Product {
    id: bigint;
    name: string;
    description: string;
    category: string;
    image?: string;
    price: bigint;
}
export interface CheckoutLineItem {
    product_id: bigint;
    quantity: bigint;
}
export interface backendInterface {
    addAdmin(newAdmin: Principal): Promise<void>;
    addAllowedOrigin(newOrigin: string): Promise<string>;
    addCategory(name: string, description: string, image: string | null): Promise<void>;
    addProduct(name: string, description: string, price: bigint, category: string, image: string | null): Promise<void>;
    addTransaction(session_id: string): Promise<Status | null>;
    clearAllCategories(): Promise<string>;
    clearAllProducts(): Promise<string>;
    clearAllTransactions(): Promise<string>;
    createCheckoutSession(lineItems: Array<CheckoutLineItem>, successUrl: string, cancelUrl: string): Promise<string>;
    deleteCategory(name: string): Promise<void>;
    deleteProduct(id: bigint): Promise<void>;
    deleteTransaction(session_id: string): Promise<boolean>;
    editProduct(id: bigint, name: string, description: string, price: bigint, category: string, image: string | null): Promise<void>;
    getAdmins(): Promise<Array<Principal>>;
    getAllCategories(): Promise<Array<string>>;
    getAllowedOrigins(): Promise<Array<string>>;
    getCategories(page: bigint | null, limit: bigint | null): Promise<PaginationResult_1>;
    getProducts(page: bigint | null, limit: bigint | null): Promise<PaginationResult>;
    getProductsByCategory(category: string, page: bigint | null, limit: bigint | null): Promise<PaginationResult>;
    getTransaction(session_id: string): Promise<Status | null>;
    getTransactionLineItems(session_id: string, starting_after: string | null): Promise<string>;
    getTransactions(): Promise<Array<[string, Status]>>;
    getTransactionsByPrincipal(): Promise<Array<[string, Status]>>;
    getUser(): Promise<string | null>;
    initializeAuth(): Promise<void>;
    initializeData(initCategories: Array<Category>, initProducts: Array<Product>, initAllowedOrigins: Array<string>): Promise<string>;
    isAdmin(): Promise<boolean>;
    removeAdmin(adminToRemove: Principal): Promise<void>;
    removeAllowedOrigin(originToRemove: string): Promise<string>;
    setAuthorization(newAuthorization: string): Promise<void>;
    setUser(name: string): Promise<void>;
    transform(arg0: {
        response: {
            status: bigint;
            body: Uint8Array;
            headers: Array<{
                value: string;
                name: string;
            }>;
        };
    }): Promise<{
        status: bigint;
        body: Uint8Array;
        headers: Array<{
            value: string;
            name: string;
        }>;
    }>;
}
