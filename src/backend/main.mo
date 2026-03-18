import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import List "mo:core/List";
import Blob "mo:core/Blob";
import Error "mo:core/Error";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Int "mo:core/Int";
import Char "mo:core/Char";

actor {
  type Product = {
    id : Nat;
    name : Text;
    description : Text;
    price : Nat;
    category : Text;
    image : ?Text;
  };

  type Category = {
    name : Text;
    description : Text;
    image : ?Text;
  };

  type Status = {
    #checking : { userPrincipal : ?Text };
    #failed : { error : Text; userPrincipal : ?Text };
    #completed : { response : Text; userPrincipal : ?Text };
  };

  type CheckoutLineItem = {
    product_id : Nat;
    quantity : Nat;
  };

  type PaginationResult<T> = {
    items : [T];
    totalItems : Nat;
    totalPages : Nat;
    currentPage : Nat;
    hasNextPage : Bool;
    hasPrevPage : Bool;
  };

  var authorization = "";
  var nonce = 0;
  var nextProductId : Nat = 1;

  var products : Map.Map<Nat, Product> = Map.empty<Nat, Product>();
  var categories : Map.Map<Text, Category> = Map.empty<Text, Category>();
  var transactions : Map.Map<Text, Status> = Map.empty<Text, Status>();

  var userProfiles : Map.Map<Principal, Text> = Map.empty<Principal, Text>();
  var adminPrincipals : List.List<Principal> = List.empty<Principal>();
  var isInitialized : Bool = false;
  var allowedOrigins : List.List<Text> = List.empty<Text>();

  let ic = actor ("aaaaa-aa") : actor {
    http_request : ({
      url : Text;
      max_response_bytes : ?Nat;
      headers : [{ name : Text; value : Text }];
      body : ?Blob;
      method : { #get; #post };
      transform : ?{
        function : shared query ({
          response : {
            status : Nat;
            headers : [{ name : Text; value : Text }];
            body : Blob;
          };
        }) -> async {
          status : Nat;
          headers : [{ name : Text; value : Text }];
          body : Blob;
        };
        context : Blob;
      };
    }) -> async {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  };

  func requireAdmin(caller : Principal) {
    if (not hasAdminPermission(caller)) {
      Runtime.trap("Unauthorized: Admin access required");
    };
  };

  func hasAdminPermission(caller : Principal) : Bool {
    adminPrincipals.contains(caller);
  };

  func paginateArray<T>(items : [T], page : Nat, limit : Nat) : PaginationResult<T> {
    let totalItems = items.size();
    let safeLimit = if (limit == 0) { 1 } else { limit };
    let totalPages = if (totalItems == 0 or safeLimit == 0) { 1 } else {
      (totalItems + safeLimit - 1) / safeLimit;
    };
    let currentPage = Nat.min(Nat.max(page, 1), totalPages);
    let startIndex = if (currentPage > 0) { (currentPage - 1) * safeLimit } else {
      0;
    };
    let endIndex = Nat.min(startIndex + safeLimit, totalItems);
    let sliceLength = if (endIndex > startIndex) { endIndex - startIndex } else {
      0;
    };

    {
      items = if (startIndex >= totalItems) { [] } else {
        items.sliceToArray(startIndex, sliceLength);
      };
      totalItems;
      totalPages;
      currentPage;
      hasNextPage = currentPage < totalPages;
      hasPrevPage = currentPage > 1;
    };
  };

  func validatePagination(page : ?Nat, limit : ?Nat) : (Nat, Nat) {
    let validatedPage = switch (page) {
      case (?p) {
        if (p == 0) { Runtime.trap("Page must be greater than 0") };
        if (p > 10000) { Runtime.trap("Page number too large (max 10000)") };
        p;
      };
      case (null) { 1 };
    };
    let validatedLimit = switch (limit) {
      case (?l) {
        if (l == 0) { Runtime.trap("Limit must be greater than 0") };
        if (l > 100) { Runtime.trap("Limit too large (max 100)") };
        l;
      };
      case (null) { 10 };
    };
    (validatedPage, validatedLimit);
  };

  public shared ({ caller }) func initializeData(
    initCategories : [Category],
    initProducts : [Product],
    initAllowedOrigins : [Text],
  ) : async Text {
    if (isInitialized) {
      return "Store already initialized. Only admins can reinitialize.";
    };

    var categoriesLoaded = 0;
    var productsLoaded = 0;

    // Load categories from input
    for (category in initCategories.values()) {
      categories.add(category.name, category);
      categoriesLoaded += 1;
    };

    // Load products from input
    for (product in initProducts.values()) {
      products.add(product.id, product);
      if (product.id >= nextProductId) {
        nextProductId := product.id + 1;
      };
      productsLoaded += 1;
    };

    allowedOrigins := List.fromArray<Text>(initAllowedOrigins);
    isInitialized := true;
    "Initialized store with " # categoriesLoaded.toText() # " categories and " # productsLoaded.toText() # " products";
  };

  public shared ({ caller }) func initializeAuth() : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot be admin");
    };
    if (adminPrincipals.isEmpty()) { adminPrincipals.add(caller) };
  };

  public query ({ caller }) func isAdmin() : async Bool {
    hasAdminPermission(caller);
  };

  public shared ({ caller }) func addAdmin(newAdmin : Principal) : async () {
    requireAdmin(caller);
    if (newAdmin.isAnonymous()) {
      Runtime.trap("Cannot add anonymous principal as admin");
    };
    if (adminPrincipals.contains(newAdmin)) {
      Runtime.trap("Principal is already an admin");
    };
    adminPrincipals.add(newAdmin);
  };

  public shared ({ caller }) func removeAdmin(adminToRemove : Principal) : async () {
    requireAdmin(caller);
    if (adminPrincipals.size() <= 1) {
      Runtime.trap("Cannot remove the last admin");
    };
    if (caller == adminToRemove) {
      Runtime.trap("Admins cannot remove themselves");
    };

    adminPrincipals := adminPrincipals.filter(func(admin) { admin != adminToRemove });
  };

  public query ({ caller }) func getAdmins() : async [Principal] {
    requireAdmin(caller);
    adminPrincipals.toArray();
  };

  public shared ({ caller }) func setAuthorization(newAuthorization : Text) : async () {
    requireAdmin(caller);
    if (newAuthorization.size() == 0) {
      Runtime.trap("Authorization cannot be empty");
    };
    authorization := newAuthorization;
  };

  public shared ({ caller }) func addProduct(name : Text, description : Text, price : Nat, category : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Product name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Product name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Product description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Product description too long (max 1000 characters)");
    };
    if (price == 0) {
      Runtime.trap("Product price must be greater than 0");
    };
    if (category.size() == 0) {
      Runtime.trap("Product category cannot be empty");
    };
    if (categories.get(category) == null) {
      Runtime.trap("Category does not exist");
    };
    let product : Product = {
      id = nextProductId;
      name;
      description;
      price;
      category;
      image;
    };
    products.add(nextProductId, product);
    nextProductId += 1;
  };

  public shared ({ caller }) func editProduct(id : Nat, name : Text, description : Text, price : Nat, category : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Product name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Product name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Product description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Product description too long (max 1000 characters)");
    };
    if (price == 0) {
      Runtime.trap("Product price must be greater than 0");
    };
    if (category.size() == 0) {
      Runtime.trap("Product category cannot be empty");
    };
    if (categories.get(category) == null) {
      Runtime.trap("Category does not exist");
    };
    if (not products.containsKey(id)) {
      Runtime.trap("Product not found");
    };
    let updatedProduct : Product = {
      id;
      name;
      description;
      price;
      category;
      image;
    };
    products.add(id, updatedProduct);
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    requireAdmin(caller);
    products.remove(id);
  };

  public shared ({ caller }) func addCategory(name : Text, description : Text, image : ?Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Category name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("Category name too long (max 255 characters)");
    };
    if (description.size() == 0) {
      Runtime.trap("Category description cannot be empty");
    };
    if (description.size() > 1000) {
      Runtime.trap("Category description too long (max 1000 characters)");
    };
    if (categories.get(name) != null) {
      Runtime.trap("Category already exists");
    };
    categories.add(name, { name; description; image });
  };

  public shared ({ caller }) func deleteCategory(name : Text) : async () {
    requireAdmin(caller);
    if (name.size() == 0) {
      Runtime.trap("Category name cannot be empty");
    };
    if (categories.get(name) == null) {
      Runtime.trap("Category not found");
    };
    let productsUsingCategory = products.values().toArray().filter(func(product) { product.category == name });

    if (productsUsingCategory.size() > 0) {
      Runtime.trap("Cannot delete category: " # productsUsingCategory.size().toText() # " product(s) still use this category");
    };
    categories.remove(name);
  };

  public shared ({ caller }) func clearAllProducts() : async Text {
    requireAdmin(caller);
    let count = products.size();
    products.clear();
    nextProductId := 1;
    "Deleted " # count.toText() # " products";
  };

  public shared ({ caller }) func clearAllCategories() : async Text {
    requireAdmin(caller);
    let count = categories.size();
    categories.clear();
    "Deleted " # count.toText() # " categories";
  };

  public shared ({ caller }) func deleteTransaction(session_id : Text) : async Bool {
    requireAdmin(caller);
    if (transactions.containsKey(session_id)) {
      transactions.remove(session_id);
      true;
    } else {
      false;
    };
  };

  public shared ({ caller }) func clearAllTransactions() : async Text {
    requireAdmin(caller);
    let count = transactions.size();
    transactions.clear();
    "Deleted " # count.toText() # " transactions";
  };

  public query func getProducts(page : ?Nat, limit : ?Nat) : async PaginationResult<Product> {
    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    paginateArray<Product>(products.values().toArray(), validatedPage, validatedLimit);
  };

  public query func getProductsByCategory(category : Text, page : ?Nat, limit : ?Nat) : async PaginationResult<Product> {
    if (category.size() == 0) {
      Runtime.trap("Category cannot be empty");
    };

    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    let filtered = products.values().toArray().filter(func(p) { p.category == category });
    paginateArray<Product>(filtered, validatedPage, validatedLimit);
  };

  public query func getAllCategories() : async [Text] {
    categories.values().toArray().map(func(c) { c.name });
  };

  public query func getCategories(page : ?Nat, limit : ?Nat) : async PaginationResult<Category> {
    let (validatedPage, validatedLimit) = validatePagination(page, limit);
    paginateArray<Category>(categories.values().toArray(), validatedPage, validatedLimit);
  };

  // HTTP Transform
  public query func transform({
    response : {
      status : Nat;
      headers : [{ name : Text; value : Text }];
      body : Blob;
    };
  }) : async {
    status : Nat;
    headers : [{ name : Text; value : Text }];
    body : Blob;
  } {
    { response with headers = [] };
  };

  func getCurrentDay() : Int {
    let now = Time.now();
    let tenMinutesNanos = 1 * 60 * 1_000_000_000; // 1min in nanoseconds
    now / tenMinutesNanos * tenMinutesNanos;
  };

  func generateNonce() : Nat {
    let currentNonce = nonce;
    nonce += 1;
    currentNonce;
  };

  func callStripeWithKey(endpoint : Text, method : { #get; #post }, body : ?Text, idempotencyKey : Text) : async Text {
    let headers = List.empty<{ name : Text; value : Text }>();

    headers.add({
      name = "content-type";
      value = if (method == #get) { "application/json" } else {
        "application/x-www-form-urlencoded";
      };
    });
    headers.add({
      name = "authorization";
      value = "Bearer " # authorization;
    });
    headers.add({
      name = "idempotency-key";
      value = idempotencyKey;
    });

    let http_request = {
      url = "https://api.stripe.com/" # endpoint;
      headers = headers.toArray();
      max_response_bytes = ?8192;
      body = switch (body) {
        case (?b) { ?b.encodeUtf8() };
        case (null) { null };
      };
      method;
      transform = ?{ function = transform; context = Blob.fromArray([]) };
    };

    let response = await (with cycles = 230_850_258_000) ic.http_request(http_request);
    switch (response.body.decodeUtf8()) {
      case (?text) { text };
      case (null) { "No value returned" };
    };
  };

  func callStripe(endpoint : Text, method : { #get; #post }, body : ?Text) : async Text {
    let uniqueNonce = generateNonce();
    let idempotencyKey = "key-" # getCurrentDay().toText() # uniqueNonce.toText();
    await callStripeWithKey(endpoint, method, body, idempotencyKey);
  };

  func buildCheckoutSessionBody(lineItems : [CheckoutLineItem], successUrl : Text, cancelUrl : Text, clientReferenceId : ?Text) : Text {
    let params = List.empty<Text>();
    var index = 0;

    for (item in lineItems.values()) {
      switch (products.get(item.product_id)) {
        case (?product) {
          let i = index.toText();
          params.add("line_items[" # i # "][price_data][currency]=usd");
          params.add("line_items[" # i # "][price_data][product_data][name]=" # urlEncode(product.name));
          params.add("line_items[" # i # "][price_data][product_data][description]=" # urlEncode(product.description));
          params.add("line_items[" # i # "][price_data][unit_amount]=" # product.price.toText());
          params.add("line_items[" # i # "][quantity]=" # item.quantity.toText());
          index += 1;
        };
        case (null) {};
      };
    };

    params.add("mode=payment");
    params.add("success_url=" # urlEncode(successUrl));
    params.add("cancel_url=" # urlEncode(cancelUrl));
    params.add("shipping_address_collection[allowed_countries][0]=US");
    params.add("shipping_address_collection[allowed_countries][1]=CA");
    switch (clientReferenceId) {
      case (?id) { params.add("client_reference_id=" # urlEncode(id)) };
      case (null) {};
    };

    params.values().join("&");
  };

  func extractJsonStringField(jsonText : Text, fieldName : Text) : ?Text {
    let patterns = ["\"" # fieldName # "\":\"", "\"" # fieldName # "\": \""];

    for (pattern in patterns.values()) {
      if (jsonText.contains(#text pattern)) {
        let parts = jsonText.split(#text pattern);
        if (parts.next() != null) {
          switch (parts.next()) {
            case (?afterPattern) {
              switch (afterPattern.split(#text "\"").next()) {
                case (?value) { if (value.size() > 0) { return ?value } };
                case (_) {};
              };
            };
            case (null) {};
          };
        };
      };
    };

    if (jsonText.contains(#text "\"client_reference_id\":null")) { return null };
    null;
  };

  func isPaymentSuccessful(paymentStatus : ?Text, sessionStatus : ?Text) : Bool {
    switch (paymentStatus, sessionStatus) {
      case (?"paid", ?"complete") { true }; // Standard successful payment
      case (?"no_payment_required", ?"complete") { true }; // Free checkout
      case (_, _) { false }; // All other cases
    };
  };

  public shared ({ caller }) func addTransaction(session_id : Text) : async ?Status {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot add a transaction");
    };
    if (session_id.size() == 0) {
      Runtime.trap("Session ID cannot be empty");
    };
    if (not session_id.startsWith(#text "cs_")) {
      Runtime.trap("Invalid session ID format");
    };
    let userPrincipal = ?caller.toText();
    try {
      if (transactions.get(session_id) == null) {
        transactions.add(session_id, #checking({ userPrincipal }));
        let reply = await callStripe("v1/checkout/sessions/" # session_id, #get, null);

        if (reply.contains(#text "\"error\"")) {
          transactions.add(session_id, #failed({ error = "Stripe API error"; userPrincipal }));
        } else {
          let paymentStatus = extractJsonStringField(reply, "payment_status");
          let sessionStatus = extractJsonStringField(reply, "status");

          if (isPaymentSuccessful(paymentStatus, sessionStatus)) {
            let clientReferenceId = extractJsonStringField(reply, "client_reference_id");
            let extractedPrincipal = switch (clientReferenceId) {
              case (?p) { ?p };
              case (null) { userPrincipal };
            };
            transactions.add(session_id, #completed({ response = reply; userPrincipal = extractedPrincipal }));
          } else {
            let errorMsg = switch (paymentStatus, sessionStatus) {
              case (?"unpaid", _) { "Payment was not completed" };
              case (_, ?"expired") { "Checkout session expired" };
              case (_, ?"open") { "Checkout session still pending" };
              case (null, _) { "Could not determine payment status" };
              case (_, null) { "Could not determine session status" };
              case (?ps, ?ss) {
                "Payment not successful. Payment status: " # ps # ", Session status: " # ss;
              };
            };

            transactions.add(session_id, #failed({ error = errorMsg; userPrincipal }));
          };
        };
      };
    } catch (err) {
      transactions.add(session_id, #failed({ error = err.message(); userPrincipal }));
    };

    transactions.get(session_id);
  };

  public query ({ caller }) func getTransactions() : async [(Text, Status)] {
    requireAdmin(caller);
    transactions.entries().toArray();
  };

  public query ({ caller }) func getTransactionsByPrincipal() : async [(Text, Status)] {
    if (caller.isAnonymous()) { return [] };

    let userPrincipal = caller.toText();
    transactions.entries().toArray().filter(
      func((_, status)) {
        switch (status) {
          case (#completed({ userPrincipal = ?p }) or #checking({ userPrincipal = ?p }) or #failed({ userPrincipal = ?p })) {
            p == userPrincipal;
          };
          case (_) { false };
        };
      }
    );

  };

  public query ({ caller }) func getTransaction(session_id : Text) : async ?Status {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access transactions");
    };
    if (session_id.size() == 0) {
      Runtime.trap("Session ID cannot be empty");
    };

    switch (transactions.get(session_id)) {
      case (?status) {
        // Admin can access any transaction
        if (hasAdminPermission(caller)) {
          return ?status;
        };

        // Non-admin users can only access their own transactions
        let userPrincipal = caller.toText();
        switch (status) {
          case (#completed({ userPrincipal = ?p }) or #checking({ userPrincipal = ?p }) or #failed({ userPrincipal = ?p })) {
            if (p == userPrincipal) {
              return ?status;
            };
          };
          case (_) {};
        };
        Runtime.trap("Unauthorized: You can only access your own transactions");
      };
      case (null) {
        null;
      };
    };
  };

  public shared ({ caller }) func getTransactionLineItems(session_id : Text, starting_after : ?Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Unauthorized: Anonymous users cannot access line items");
    };
    if (session_id.size() == 0) {
      Runtime.trap("Session ID cannot be empty");
    };
    if (not session_id.startsWith(#text "cs_")) {
      Runtime.trap("Invalid session ID format");
    };
    var endpoint = "v1/checkout/sessions/" # session_id # "/line_items";
    switch (starting_after) {
      case (?id) { if (id.size() > 0) { endpoint #= "?starting_after=" # id } };
      case (_) {};
    };
    try {
      await callStripe(endpoint, #get, null);
    } catch (err) {
      Runtime.trap("Failed to get line items: " # err.message());
    };
  };

  func callStripeWithRetry(endpoint : Text, method : { #get; #post }, body : ?Text, maxRetries : Nat) : async Text {
    let uniqueNonce = generateNonce();
    let idempotencyKey = "key-" # getCurrentDay().toText() # uniqueNonce.toText();
    var attempt = 0;
    while (attempt <= maxRetries) {
      try {
        let result = await callStripeWithKey(endpoint, method, body, idempotencyKey);
        return result;
      } catch (err) {
        let errorMsg = err.message();
        if (errorMsg.contains(#text "409") and attempt < maxRetries) {
          attempt += 1;
        } else {
          throw err;
        };
      };
    };
    Runtime.trap("Unexpected error in retry logic");
  };

  func extractSessionId(response : Text) : ?Text {
    switch (extractJsonStringField(response, "id")) {
      case (?id) {
        if (id.startsWith(#text "cs_")) {
          ?id;
        } else {
          null;
        };
      };
      case (null) { null };
    };
  };

  func validateCheckoutSession(
    sessionId : Text,
    expectedSuccessUrl : Text,
    expectedCancelUrl : Text,
    expectedClientReferenceId : Text,
  ) : async () {
    let sessionData = try {
      await callStripe("v1/checkout/sessions/" # sessionId, #get, null);
    } catch (err) {
      Runtime.trap("Session validation failed: Failed to retrieve session for validation: " # err.message());
    };
    let cleanSessionData = sessionData.replace(#text " ", "");
    if (not cleanSessionData.contains(#text "\"mode\":\"payment\"")) {
      Runtime.trap("Session validation failed: Session mode is not 'payment'");
    };
    let clientRefPattern = "\"client_reference_id\":\"" # expectedClientReferenceId # "\"";
    if (not cleanSessionData.contains(#text clientRefPattern)) {
      Runtime.trap("Session validation failed: Client reference ID does not match");
    };
    switch (extractJsonStringField(cleanSessionData, "success_url")) {
      case (?actualSuccessUrl) {
        if (normalizeOrigin(actualSuccessUrl) != normalizeOrigin(expectedSuccessUrl)) {
          Runtime.trap("Session validation failed: Success URL does not match expected");
        };
      };
      case (null) {
        Runtime.trap("Session validation failed: Success URL not found in session");
      };
    };
    switch (extractJsonStringField(cleanSessionData, "cancel_url")) {
      case (?actualCancelUrl) {
        if (normalizeOrigin(actualCancelUrl) != normalizeOrigin(expectedCancelUrl)) {
          Runtime.trap("Session validation failed: Cancel URL does not match expected");
        };
      };
      case (null) {
        Runtime.trap("Session validation failed: Cancel URL not found in session");
      };
    };
  };

  public shared ({ caller }) func createCheckoutSession(lineItems : [CheckoutLineItem], successUrl : Text, cancelUrl : Text) : async Text {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot create checkout sessions");
    };
    if (lineItems.size() == 0) {
      Runtime.trap("Line items cannot be empty");
    };
    if (lineItems.size() > 100) {
      Runtime.trap("Too many line items (max 100)");
    };
    if (not isValidCheckoutDomain(successUrl)) {
      Runtime.trap("Success URL domain not allowed");
    };
    if (not isValidCheckoutDomain(cancelUrl)) {
      Runtime.trap("Cancel URL domain not allowed");
    };
    for (item in lineItems.values()) {
      if (item.quantity == 0) {
        Runtime.trap("Line item quantity must be greater than 0");
      };
      if (item.quantity > 1000) {
        Runtime.trap("Line item quantity too large (max 1000)");
      };
      if (not products.containsKey(item.product_id)) {
        Runtime.trap("Product with ID " # item.product_id.toText() # " not found");
      };
    };
    if (successUrl.size() == 0) {
      Runtime.trap("Success URL cannot be empty");
    };
    if (successUrl.size() > 2000) {
      Runtime.trap("Success URL too long (max 2000 characters)");
    };
    if (cancelUrl.size() == 0) {
      Runtime.trap("Cancel URL cannot be empty");
    };
    if (cancelUrl.size() > 2000) {
      Runtime.trap("Cancel URL too long (max 2000 characters)");
    };

    let clientReferenceId = caller.toText();
    let requestBody = buildCheckoutSessionBody(lineItems, successUrl, cancelUrl, ?clientReferenceId);
    let sessionResponse = try {
      await callStripeWithRetry("v1/checkout/sessions", #post, ?requestBody, 2);
    } catch (err) {
      Runtime.trap("Failed to create checkout session: " # err.message());
    };
    let sessionId = switch (extractSessionId(sessionResponse)) {
      case (?id) { id };
      case (null) {
        Runtime.trap("Failed to extract session ID from response" # sessionResponse);
      };
    };
    await validateCheckoutSession(sessionId, successUrl, cancelUrl, clientReferenceId);
    sessionResponse;
  };

  public query ({ caller }) func getUser() : async ?Text {
    userProfiles.get(caller);
  };

  public shared ({ caller }) func setUser(name : Text) : async () {
    if (caller.isAnonymous()) {
      Runtime.trap("Anonymous users cannot set user profiles");
    };
    if (name.size() == 0) {
      Runtime.trap("User name cannot be empty");
    };
    if (name.size() > 255) {
      Runtime.trap("User name too long (max 255 characters)");
    };
    let allowedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 -_";
    for (char in name.chars()) {
      if (not allowedChars.contains(#char char)) {
        Runtime.trap("User name contains invalid characters (only letters, numbers, spaces, hyphens, and underscores allowed)");
      };
    };
    userProfiles.add(caller, name);
  };

  func extractOrigin(url : Text) : Text {
    url.replace(#text "https://", "").replace(#text "http://", "");
  };

  func normalizeOrigin(url : Text) : Text {
    extractOrigin(url).trimEnd(#text "/");
  };

  func isValidCheckoutDomain(url : Text) : Bool {
    let domain = normalizeOrigin(url);

    allowedOrigins.find(func(allowed) { domain.startsWith(#text allowed) }) != null;
  };

  public shared ({ caller }) func addAllowedOrigin(newOrigin : Text) : async Text {
    requireAdmin(caller);
    let cleanOrigin = normalizeOrigin(newOrigin);
    if (cleanOrigin.size() == 0) {
      return "Invalid origin format";
    };
    if (allowedOrigins.contains(cleanOrigin)) {
      return "Origin already exists";
    };
    if (allowedOrigins.size() >= 10) {
      return "Maximum of 10 allowed origins reached";
    };
    allowedOrigins.add(cleanOrigin);
    "Successfully added origin: " # cleanOrigin;
  };

  public shared ({ caller }) func removeAllowedOrigin(originToRemove : Text) : async Text {
    requireAdmin(caller);
    allowedOrigins := allowedOrigins.filter(func(origin) { origin != originToRemove });
    "Successfully removed " # originToRemove # " from allowed origins";
  };

  public query ({ caller }) func getAllowedOrigins() : async [Text] {
    requireAdmin(caller);
    allowedOrigins.toArray();
  };

  func urlEncode(text : Text) : Text {
    var encoded = "";
    for (char in text.chars()) {
      switch (char) {
        case (' ') { encoded #= "%20" };
        case ('!') { encoded #= "%21" };
        case ('\"') { encoded #= "%22" };
        case ('#') { encoded #= "%23" };
        case ('$') { encoded #= "%24" };
        case ('%') { encoded #= "%25" };
        case ('&') { encoded #= "%26" };
        case ('\'') { encoded #= "%27" };
        case ('(') { encoded #= "%28" };
        case (')') { encoded #= "%29" };
        case ('+') { encoded #= "%2B" };
        case (',') { encoded #= "%2C" };
        case ('/') { encoded #= "%2F" };
        case (':') { encoded #= "%3A" };
        case (';') { encoded #= "%3B" };
        case ('<') { encoded #= "%3C" };
        case ('=') { encoded #= "%3D" };
        case ('>') { encoded #= "%3E" };
        case ('?') { encoded #= "%3F" };
        case ('@') { encoded #= "%40" };
        case ('[') { encoded #= "%5B" };
        case ('\\') { encoded #= "%5C" };
        case (']') { encoded #= "%5D" };
        case ('^') { encoded #= "%5E" };
        case ('`') { encoded #= "%60" };
        case ('{') { encoded #= "%7B" };
        case ('|') { encoded #= "%7C" };
        case ('}') { encoded #= "%7D" };
        case (_) { encoded #= char.toText() };
      };
    };
    encoded;
  };
};
