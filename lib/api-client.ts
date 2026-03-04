import {
    APIOrderListResponseItem,
    APIOrderItemsResponse,
    UpdateItemStatusPayload,
    LoginCredentials,
    AuthResponse,
    PharmacyRegisterData,
    PharmacistRegisterData,
    APIOrderDetailsResponse,
    OrderValidationPayload,
    ProductData,
    Product,
    Category,
    Galenic,
    Unit,
    ProductCreatePayload,
    Pharmacy,
    LotCreatePayload,
    ConversionCreatePayload,
    PriceCreatePayload,
    SchedulePayload,
    ScheduleResponse,
    SubOrderPayload,
    InvoiceResponse,
    QrCodeResponse,
    PharmaNotification,
    PharmaWallet,
    PharmaTransaction,
    PatientOrder,
    PatientOrderItem,
    PaymentPayload,
    PaymentResponse,
} from '@/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

interface RequestOptions extends RequestInit {
    requiresAuth?: boolean;
}

class ApiClient {
    private static instance: ApiClient;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private _isRefreshing = false;

    private constructor() {
        if (typeof window !== 'undefined') {
            this.accessToken = localStorage.getItem('accessToken');
            this.refreshToken = localStorage.getItem('refreshToken');
        }
    }

    public static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    private getHeaders(requiresAuth: boolean = true): HeadersInit {
        const headers: HeadersInit = {};

        if (requiresAuth && this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }

    private async refreshAccessToken(): Promise<string> {
        if (!this.refreshToken) {
            this.logout();
            if (typeof window !== 'undefined') window.location.href = '/login';
            throw new Error('No refresh token');
        }
        const res = await fetch(`${API_BASE_URL}/api/v1/token/refresh/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh: this.refreshToken }),
        });
        if (!res.ok) throw new Error('Refresh token expired');
        const data = await res.json() as { access: string; refresh?: string };
        this.setTokens(data.access, data.refresh || this.refreshToken!);
        return data.access;
    }

    private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const { requiresAuth = true, ...fetchOptions } = options;
        const isFormData = fetchOptions.body instanceof FormData;

        const headers: Record<string, string> = {
            ...(this.getHeaders(requiresAuth) as Record<string, string>),
            ...(fetchOptions.headers as Record<string, string>),
        };

        if (!isFormData && !headers['Content-Type']) {
            headers['Content-Type'] = 'application/json';
        }

        const config: RequestInit = {
            ...fetchOptions,
            headers: headers as HeadersInit,
        };

        // Debug logging
        console.log(`[API] ${fetchOptions.method || 'GET'} ${url}`);
        console.log(`[API] requiresAuth=${requiresAuth}, hasToken=${!!this.accessToken}`);
        console.log(`[API] Headers:`, JSON.stringify(config.headers));

        try {
            const response = await fetch(url, config);

            console.log(`[API] Response status: ${response.status}`);

            if (response.status === 401 && requiresAuth && !this._isRefreshing) {
                try {
                    this._isRefreshing = true;
                    const newToken = await this.refreshAccessToken();
                    this._isRefreshing = false;
                    // Réessayer la requête avec le nouveau token
                    const retryHeaders: Record<string, string> = {
                        ...headers,
                        Authorization: `Bearer ${newToken}`,
                    };
                    const retryResponse = await fetch(url, { ...config, headers: retryHeaders as HeadersInit });
                    if (!retryResponse.ok) {
                        const retryText = await retryResponse.text();
                        let retryError: Record<string, unknown> = {};
                        try { retryError = JSON.parse(retryText); } catch { /* not JSON */ }
                        throw new Error(String(retryError.detail || retryError.error || retryError.message || `Error ${retryResponse.status}`));
                    }
                    const retryText = await retryResponse.text();
                    return retryText ? JSON.parse(retryText) : {} as T;
                } catch {
                    this._isRefreshing = false;
                    this.logout();
                    if (typeof window !== 'undefined') window.location.href = '/login';
                    throw new Error('Session expirée. Veuillez vous reconnecter.');
                }
            }

            if (!response.ok) {
                const responseText = await response.text();
                console.error(`[API] Error response body:`, responseText);
                let errorData: Record<string, unknown> = {};
                try {
                    errorData = JSON.parse(responseText);
                } catch {
                    /* not JSON */
                }

                // Extract meaningful error message
                let errorMessage = `Error ${response.status}`;

                if (errorData.detail) {
                    errorMessage = String(errorData.detail);
                } else if (errorData.error) {
                    errorMessage = String(errorData.error);
                } else if (errorData.message) {
                    errorMessage = String(errorData.message);
                } else if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
                    errorMessage = (errorData.non_field_errors as string[]).join(', ');
                } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
                    // Handle field-specific errors
                    const fieldErrors: string[] = [];
                    for (const [field, errors] of Object.entries(errorData)) {
                        if (Array.isArray(errors)) {
                            fieldErrors.push(`${field}: ${errors.join(', ')}`);
                        } else {
                            fieldErrors.push(`${field}: ${String(errors)}`);
                        }
                    }
                    if (fieldErrors.length > 0) {
                        errorMessage = fieldErrors.join('; ');
                    }
                } else {
                    errorMessage = `Error ${response.status}: ${response.statusText}`;
                }

                throw new Error(errorMessage);
            }

            // Check if response has content before parsing JSON
            const text = await response.text();
            return text ? JSON.parse(text) : {} as T;
        } catch (error) {
            // Ne pas loguer les erreurs réseau pures (serveur en veille, pas de connexion)
            if (!(error instanceof TypeError)) {
                console.error('API Request Failed:', error);
            }
            throw error;
        }
    }

    public setTokens(access: string, refresh: string) {
        this.accessToken = access;
        this.refreshToken = refresh;
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', refresh);
            // Set cookie for middleware access
            document.cookie = `accessToken=${access}; path=/; max-age=86400; SameSite=Lax`;
        }
    }

    public logout() {
        this.accessToken = null;
        this.refreshToken = null;
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('account');
            localStorage.removeItem('officine');
            // Clear cookie
            document.cookie = 'accessToken=; path=/; max-age=0; SameSite=Lax';
        }
    }

    // --- Authentication & Profile Management ---
    /**
     * Manages user login.
     */
    public async login(credentials: LoginCredentials): Promise<AuthResponse> {
        return this.request<AuthResponse>('/api/v1/login/', {
            method: 'POST',
            body: JSON.stringify(credentials),
            requiresAuth: false,
        });
    }

    /**
     * Manages updating the user's account profile.
     */
    public async updateProfile(userData: Record<string, unknown>): Promise<unknown> {
        return this.request('/api/v1/update-account/', {
            method: 'PUT',
            body: JSON.stringify(userData),
            requiresAuth: true,
        });
    }

    /**
     * Request password reset OTP.
     */
    public async changeForgotPassword(telephone: string): Promise<unknown> {
        return this.request('/api/v1/send-otp/', {
            method: 'POST',
            body: JSON.stringify({ telephone }),
            requiresAuth: false,
        });
    }

    // --- Pharmacy Registration ---
    /**
     * Manages pharmacy registration (step 1).
     */
    public async registerPharmacy(data: PharmacyRegisterData): Promise<Record<string, unknown>> {
        return this.request<Record<string, unknown>>('/api/v1/register-officine/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
    }

    /**
     * Manages pharmacist registration (step 2).
     */
    public async registerPharmacist(data: PharmacistRegisterData): Promise<unknown> {
        return this.request('/api/v1/register-officine-user/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
    }

    /**
     * Manages OTP validation (for registration/verification).
     */
    public async validateOtp(data: { otp: string; telephone: string; new_password?: string }): Promise<unknown> {
        return this.request('/api/v1/valid-otp/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
    }

    /**
     * Manages changing forgotten password with OTP code.
     * Note: OTP validation happens on backend, we only send telephone and new password.
     */
    public async changeForgotPasswordWithOtp(data: { telephone: string; password: string }): Promise<unknown> {
        return this.request('/api/v1/change-fogot-password/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: false,
        });
    }

    // --- Pharmacy Management ---
    /**
     * Retrieves pharmacy details by ID.
     */
    public async getPharmacy(id: string): Promise<Pharmacy> {
        return this.request<Pharmacy>(`/api/v1/officine/${id}/`, { requiresAuth: true });
    }

    /**
     * Manages updating pharmacy details.
     */
    public async updatePharmacy(id: string, data: Partial<Pharmacy>): Promise<Pharmacy> {
        return this.request<Pharmacy>(`/api/v1/officine/${id}/`, {
            method: 'PATCH', // Assuming PATCH for partial update, or PUT if full replacement. 
            // Based on user request "gestion du profil", PATCH/PUT on ID is standard.
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    // --- Order Management ---
    /**
     * Manages fetching all orders (Generic).
     */
    public async getOrders(): Promise<APIOrderListResponseItem[]> {
        return this.request('/api/v1/order/', { requiresAuth: true });
    }

    /**
     * Manages fetching orders specific to a pharmacy.
     * Uses GET /api/v1/officine-order/get_order_by_officine/ — the backend
     * filters by the authenticated user's pharmacy automatically via JWT.
     */
    public async getPharmacyOrders(): Promise<APIOrderListResponseItem[]> {
        return this.request('/api/v1/officine-order/get_order_by_officine/', { requiresAuth: true });
    }

    /**
     * Fetches ALL pharmacy orders (all statuses: PENDING, RESERVED, REJECTED…).
     * The get_order_by_officine/ endpoint returns every order for this pharmacy
     * regardless of status — no filtering needed.
     */
    public async getAllPharmacyOrders(): Promise<APIOrderListResponseItem[]> {
        const res = await this.request<unknown>('/api/v1/officine-order/get_order_by_officine/', { requiresAuth: true });
        if (Array.isArray(res)) return res as APIOrderListResponseItem[];
        const paged = res as { results?: APIOrderListResponseItem[]; data?: APIOrderListResponseItem[] };
        if (Array.isArray(paged?.results)) return paged.results;
        if (Array.isArray(paged?.data)) return paged.data;
        return [];
    }

    /**
     * Manages fetching pending orders for a pharmacy.
     */
    public async getPendingOrders(pharmacyId: string): Promise<APIOrderListResponseItem[]> {
        return this.request<APIOrderListResponseItem[]>(`/api/v1/officine/${pharmacyId}/list-officine-orders-pending/?status=PENDING`);
    }

    /**
     * Retrieves base details for a specific order (metadata: patient, status, total…).
     */
    public async getOrderById(orderId: string): Promise<APIOrderDetailsResponse['order']> {
        return this.request<APIOrderDetailsResponse['order']>(`/api/v1/officine-order/${orderId}/`);
    }

    /**
     * Retrieves the list of items for a specific order.
     */
    public async getOrderItems(orderId: string): Promise<APIOrderItemsResponse> {
        return this.request<APIOrderItemsResponse>(`/api/v1/officine-order/${orderId}/items-order/`);
    }

    /**
     * Retrieves full order details by merging base order + items in parallel.
     */
    public async getOrderDetails(orderId: string): Promise<APIOrderDetailsResponse> {
        const [orderData, itemsData] = await Promise.all([
            this.getOrderById(orderId),
            this.getOrderItems(orderId),
        ]);

        // Normalise items: the endpoint may return an array directly or { items: [] }
        let itemsArray: import('@/lib/types').OrderItem[] = [];
        if (Array.isArray(itemsData)) {
            console.log('[getOrderDetails] Raw items (array):', JSON.stringify(itemsData.slice(0, 2), null, 2));
            itemsArray = itemsData;
        } else if (itemsData && Array.isArray((itemsData as APIOrderItemsResponse).items)) {
            console.log('[getOrderDetails] Raw items (nested):', JSON.stringify((itemsData as APIOrderItemsResponse).items!.slice(0, 2), null, 2));
            itemsArray = (itemsData as APIOrderItemsResponse).items!;
        } else {
            console.log('[getOrderDetails] Raw itemsData (unknown shape):', JSON.stringify(itemsData, null, 2));
        }

        return {
            order: orderData,
            items: itemsArray,
        };
    }

    /**
     * Updates the status of a single item in an order.
     * POST /api/v1/officine-order/{orderId}/update-items-status/
     */
    public async updateOrderItemStatus(orderId: string, payload: UpdateItemStatusPayload): Promise<unknown> {
        console.log('[updateOrderItemStatus] Sending payload:', JSON.stringify(payload), 'for order:', orderId);
        return this.request(`/api/v1/officine-order/${orderId}/update-items-status/`, {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });
    }

    /**
     * Sends a prescription to a pharmacy for a prescription order.
     * POST /api/v1/send-presciption-order/{officineId}/validate/
     */
    public async sendPrescriptionOrder(
        officineId: string,
        prescriptionFile: File,
        note?: string
    ): Promise<unknown> {
        const url = `${API_BASE_URL}/api/v1/send-presciption-order/${officineId}/validate/`;
        const formData = new FormData();
        formData.append('prescription', prescriptionFile);
        if (note) formData.append('medecin', note);

        // Don't set Content-Type manually – browser sets it with the correct boundary
        const headers: HeadersInit = {};
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }

        console.log(`[API] POST ${url}`);
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: formData,
        });

        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erreur ${response.status}: ${text || response.statusText}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    /**
     * Manages validating a pharmacy order.
     */
    public async validateOrder(orderId: string, data: OrderValidationPayload): Promise<unknown> {
        return this.request(`/api/v1/officine-order/${orderId}/validate-officine-order/`, {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    /**
     * Retrieves the list of officines available for pickup (for delivery drivers).
     * GET /api/v1/pickup-qr-code/
     */
    public async getPickupOfficines(): Promise<unknown> {
        return this.request('/api/v1/pickup-qr-code/', { requiresAuth: true });
    }

    /**
     * Scans a pickup QR code at the officine (pharmacist confirms handover to driver).
     * POST /api/v1/scan-qrcode-pickup/
     * Sends multipart/form-data so the package photo can be attached.
     */
    public async scanQrCodePickup(
        rawQrValue: string,
        options?: { missionCode?: string; packagePhoto?: File }
    ): Promise<unknown> {
        const formData = new FormData();

        // Parse QR value and append fields
        try {
            const parsed = JSON.parse(rawQrValue);
            if (parsed.pickup_id) formData.append('pickup_id', String(parsed.pickup_id));
            if (parsed.officine_order_id) formData.append('officine_order_id', String(parsed.officine_order_id));
            if (parsed.ts) formData.append('ts', String(parsed.ts));
            if (parsed.driver) formData.append('driver', String(parsed.driver));
        } catch {
            // Fallback: send raw QR value
            formData.append('qr_code', rawQrValue);
        }

        // Code de mission du livreur
        if (options?.missionCode?.trim()) {
            formData.append('mission_code', options.missionCode.trim());
        }

        // Photo/vidéo du colis
        if (options?.packagePhoto) {
            formData.append('package_photo', options.packagePhoto, options.packagePhoto.name);
        }

        const url = `${API_BASE_URL}/api/v1/scan-qrcode-pickup/`;
        const headers: HeadersInit = {};
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        console.log(`[API] POST ${url} (multipart)`);
        const response = await fetch(url, { method: 'POST', headers, body: formData });

        if (!response.ok) {
            const text = await response.text();
            let errData: Record<string, unknown> = {};
            try { errData = JSON.parse(text); } catch { /* not JSON */ }
            const msg = String(
                errData.detail ?? errData.error ?? errData.message ?? `Erreur ${response.status}`
            );
            throw new Error(msg);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    // --- Product Management ---
    /**
     * Manages fetching all available products (global).
     */
    public async getAllProducts(): Promise<ProductData[]> {
        return this.request('/api/v1/products/', { requiresAuth: true });
    }

    /**
     * Manages fetching products for a specific pharmacy.
     */
    public async getProducts(pharmacyId: string): Promise<Product[]> {
        return this.request<Product[]>(`/api/v1/officine/${pharmacyId}/list-product/`, { requiresAuth: true });
    }

    /**
     * Manages adding a new product. The product must include an 'officine' field to associate it with a pharmacy.
     */
    public async addProduct(data: ProductCreatePayload | FormData): Promise<Product> {
        return this.request<Product>('/api/v1/products/', {
            method: 'POST',
            body: data instanceof FormData ? data : JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Manages creating a lot/stock for a product.
     */
    public async createLot(data: LotCreatePayload): Promise<unknown> {
        return this.request('/api/v1/lots/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Manages creating a unit conversion for a product.
     */
    public async createConversion(data: ConversionCreatePayload): Promise<unknown> {
        return this.request('/api/v1/conversions/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Manages creating a price for a product.
     */
    public async createProductPrice(data: PriceCreatePayload): Promise<unknown> {
        return this.request('/api/v1/product-price/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Retrieves available product categories.
     */
    public async getCategories(): Promise<Category[]> {
        return this.request<Category[]>('/api/v1/categories/', { requiresAuth: true });
    }

    /**
     * Retrieves available galenic forms.
     */
    public async getGalenics(): Promise<Galenic[]> {
        return this.request<Galenic[]>('/api/v1/galenics/', { requiresAuth: true });
    }

    /**
     * Retrieves available units.
     */
    public async getUnits(): Promise<Unit[]> {
        return this.request<Unit[]>('/api/v1/units/', { requiresAuth: true });
    }

    /**
     * Retrieves a single pharmacy-product lot by its ID.
     */
    public async getLotById(lotId: string): Promise<unknown> {
        return this.request(`/api/v1/lots/${lotId}/`, { requiresAuth: true });
    }

    /**
     * Manages updating an existing product/lot.
     */
    public async updateProduct(lotId: string, data: Record<string, unknown>): Promise<unknown> {
        return this.request(`/api/v1/lots/${lotId}/`, {
            method: 'PUT',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Manages deleting a product/lot.
     */
    public async deleteProduct(lotId: string): Promise<unknown> {
        return this.request(`/api/v1/lots/${lotId}/`, {
            method: 'DELETE',
            requiresAuth: true,
        });
    }

    // --- Product Price / Pharmacy Product Management ---
    // These endpoints govern the specific instance of a product in a pharmacy (price, visibility, etc.)
    // generated when a pharmacy adds a product to their list.

    /**
     * Retrieves a pharmacy product (product-price) by its ID.
     */
    public async getProductPrice(id: string): Promise<unknown> {
        return this.request(`/api/v1/product-price/${id}/`, { requiresAuth: true });
    }

    /**
     * Updates a pharmacy product (product-price).
     */
    public async updateProductPrice(id: string, data: Record<string, unknown> | FormData): Promise<unknown> {
        return this.request(`/api/v1/product-price/${id}/`, {
            method: 'PATCH', // Usually PATCH for partial updates
            body: data instanceof FormData ? data : JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Deletes a pharmacy product (product-price).
     */
    public async deleteProductPrice(id: string): Promise<unknown> {
        return this.request(`/api/v1/product-price/${id}/`, {
            method: 'DELETE',
            requiresAuth: true,
        });
    }

    // --- KYC Officine ---
    /**
     * Uploads KYC documents for an officine.
     * POST /api/v1/kyc-file-officine/
     * Uses FormData (multipart) — Content-Type set automatically by browser.
     */
    public async submitKycOfficine(formData: FormData): Promise<unknown> {
        const url = `${API_BASE_URL}/api/v1/kyc-file-officine/`;
        const headers: HeadersInit = {};
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        console.log(`[API] POST ${url}`);
        const response = await fetch(url, { method: 'POST', headers, body: formData });
        if (!response.ok) {
            const text = await response.text();
            throw new Error(`Erreur ${response.status}: ${text || response.statusText}`);
        }
        const text = await response.text();
        return text ? JSON.parse(text) : {};
    }

    // --- Planning / Horaires ---
    /**
     * Retrieves the opening schedule of an officine.
     * GET /api/v1/officine/{officine_id}/schedule/
     */
    public async getSchedule(officineId: string): Promise<ScheduleResponse> {
        return this.request<ScheduleResponse>(`/api/v1/officine/${officineId}/schedule/`, {
            requiresAuth: true,
        });
    }

    /**
     * Creates or updates the opening schedule of an officine.
     * PUT /api/v1/officine/{officine_id}/update-schedule/
     */
    public async updateSchedule(officineId: string, data: SchedulePayload): Promise<unknown> {
        return this.request(`/api/v1/officine/${officineId}/update-schedule/`, {
            method: 'PUT',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    // --- Sous-commande officine ---
    /**
     * Generates a custom sub-order for a patient (prescription flow, 2nd process).
     * POST /api/v1/sub-order-item-officine/
     */
    public async generateSubOrder(data: SubOrderPayload): Promise<unknown> {
        const payload = {
            officine_order: data.order_id,
            officine: data.officine_id,
            product: data.items.map(({ product_id, quantity }) => ({ product_id, quantity })),
        };
        return this.request('/api/v1/sub-order-item-officine/', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });
    }

    // --- Facture ---
    /**
     * Retrieves the invoice for a patient order.
     * POST /api/v1/get-invoice-order-patient/
     */
    public async getInvoice(data: { order_id: string }): Promise<InvoiceResponse> {
        return this.request<InvoiceResponse>('/api/v1/get-invoice-order-patient/', {
            method: 'POST',
            body: JSON.stringify(data),
            requiresAuth: true,
        });
    }

    /**
     * Downloads the PDF invoice for a given invoice ID.
     * GET /api/v1/get-invoice-order-patient/{invoice_id}/pdf/
     * Returns a Blob (application/pdf).
     */
    public async getInvoicePdf(invoiceId: string): Promise<Blob> {
        const url = `${API_BASE_URL}/api/v1/get-invoice-order-patient/${invoiceId}/pdf/`;
        const headers: HeadersInit = {};
        if (this.accessToken) {
            headers['Authorization'] = `Bearer ${this.accessToken}`;
        }
        console.log(`[API] GET ${url}`);
        const response = await fetch(url, { method: 'GET', headers });
        if (!response.ok) {
            throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
        return response.blob();
    }

    // --- QR Code commande ---
    /**
     * Retrieves the QR code for an order (used to confirm delivery reception).
     * GET /api/v1/orders/{order_id}/qr-code/
     */
    public async getOrderQrCode(orderId: string): Promise<QrCodeResponse> {
        return this.request<QrCodeResponse>(`/api/v1/orders/${orderId}/qr-code/`, {
            requiresAuth: true,
        });
    }

    // --- Recherche & Catalogue produits ---
    /**
     * Searches products within a specific officine.
     * POST /api/v1/search-produit-officine/
     */
    public async searchProductOfficine(payload: { search: string; officine_id: string }): Promise<unknown> {
        return this.request('/api/v1/search-produit-officine/', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });
    }

    /**
     * Retrieves all products associated with the authenticated officine.
     * GET /api/v1/officine/list-all-product-officine/
     */
    public async getAllProductsOfficine(): Promise<unknown> {
        return this.request('/api/v1/officine/list-all-product-officine/', { requiresAuth: true });
    }

    // --- Notifications ---
    public async getNotifications(): Promise<PharmaNotification[]> {
        try {
            const data = await this.request<unknown>('/api/v1/notification-user/list_notification_user/', { requiresAuth: true });
            const items: unknown[] = Array.isArray(data) ? data : ((data as { results?: unknown[] }).results ?? []);
            return items.map((n) => {
                const notif = n as Record<string, unknown>;
                return {
                    id: String(notif.id ?? ''),
                    title: String(notif.title ?? 'Notification'),
                    message: String(notif.message ?? notif.content ?? notif.body ?? ''),
                    is_read: Boolean(notif.is_read ?? notif.read ?? false),
                    created_at: String(notif.created_at ?? new Date().toISOString()),
                    type: notif.type ? String(notif.type) : undefined,
                    order_id: notif.order_id ? String(notif.order_id) : undefined,
                } as PharmaNotification;
            });
        } catch {
            return [];
        }
    }

    public async markNotificationAsRead(id: string): Promise<void> {
        try {
            await this.request(`/api/v1/notification-user/${id}/mark-read/`, { method: 'POST', requiresAuth: true });
        } catch {
            // silent
        }
    }


    // --- Wallet ---
    public async getWallet(): Promise<PharmaWallet | null> {
        try {
            const data = await this.request<PharmaWallet>('/api/v1/wallet-officine/get_wallet_officine/', { requiresAuth: true });
            return data ?? null;
        } catch {
            return null;
        }
    }

    public async getWalletTransactions(): Promise<PharmaTransaction[]> {
        try {
            const data = await this.request<unknown>('/api/v1/wallet-officine/transactions/', { requiresAuth: true });
            const items: unknown[] = Array.isArray(data) ? data : ((data as { results?: unknown[] }).results ?? []);
            return items as PharmaTransaction[];
        } catch {
            return [];
        }
    }

    // --- Patient Orders ---

    /**
     * Retrieves all orders for the authenticated patient.
     * GET /api/v1/list_order_patient/
     */
    public async getPatientOrders(): Promise<PatientOrder[]> {
        try {
            const data = await this.request<unknown>('/api/v1/list_order_patient/', { requiresAuth: true });
            const items: unknown[] = Array.isArray(data)
                ? data
                : ((data as { results?: unknown[] }).results ?? []);
            return items as PatientOrder[];
        } catch {
            return [];
        }
    }

    /**
     * Retrieves a single patient order by ID.
     * GET /api/v1/list_order_patient/{order_id}/
     */
    public async getPatientOrderById(orderId: string): Promise<PatientOrder> {
        return this.request<PatientOrder>(`/api/v1/list_order_patient/${orderId}/`, { requiresAuth: true });
    }

    /**
     * Retrieves items for a patient order.
     * GET /api/v1/officine-order/{order_id}/items-order/
     */
    public async getPatientOrderItems(orderId: string): Promise<PatientOrderItem[]> {
        try {
            const data = await this.request<unknown>(`/api/v1/officine-order/${orderId}/items-order/`, { requiresAuth: true });
            if (Array.isArray(data)) return data as PatientOrderItem[];
            const nested = data as { items?: PatientOrderItem[]; results?: PatientOrderItem[] };
            return nested?.items ?? nested?.results ?? [];
        } catch {
            return [];
        }
    }

    /**
     * Initiates payment for a patient order.
     * POST /api/v1/pay-order/
     */
    public async payOrder(payload: PaymentPayload): Promise<PaymentResponse> {
        return this.request<PaymentResponse>('/api/v1/pay-order/', {
            method: 'POST',
            body: JSON.stringify(payload),
            requiresAuth: true,
        });
    }

    // --- Firebase Cloud Messaging ---
    /**
     * Enregistre le token FCM de l'appareil courant auprès du backend.
     * POST /api/v1/register-fcm-token/
     */
    public async registerFcmToken(token: string): Promise<void> {
        await this.request('/api/v1/register-fcm-token/', {
            method: 'POST',
            body: JSON.stringify({ token, device_type: 'web' }),
            requiresAuth: true,
        });
    }
}

export const api = ApiClient.getInstance();
