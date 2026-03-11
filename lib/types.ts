export interface Patient {
    first_name?: string;
    last_name?: string;
    phone?: string;
    email?: string;
    address?: string;
}

export interface OrderDetails {
    id?: string;
    patient?: Patient;
    total_amount?: number;
    payment_status?: string;
    status?: string;
    prescription?: string | null;
    created_at?: string;
}

export interface OrderItem {
    id: number | string;
    product_name?: string;
    quantity: number;
    price: number;
    total_price?: number;
    status?: string;
}

export interface APIOrderDetailsResponse {
    order: OrderDetails;
    items: OrderItem[];
}

/** Response shape from /officine-order/{id}/items-order/ */
export interface APIOrderItemsResponse {
    items?: OrderItem[];
    // Some backends return arrays directly
    [key: string]: unknown;
}

/** Payload for POST /officine-order/{id}/update-items-status/ */
export interface UpdateItemStatusPayload {
    id: number | string; // SubOrderItem UUID
    status: string;
}

/** One item returned by the pending-orders list endpoint */
export interface APIOrderListResponseItem {
    id: string;
    created_at?: string;
    status?: string;
    payment_status?: string;
    total_amount?: number | string;
    prescription?: string | null;
    patient?: {
        first_name?: string;
        last_name?: string;
        phone?: string;
    };
    /** Legacy nested shape – some endpoints still nest it */
    order?: OrderDetails;
}

export interface APIOrder {
    id?: string;
    order_id?: string;
    patient_name?: string;
    patient?: {
        first_name?: string;
        last_name?: string;
    };
    created_at?: string;
    date?: string;
    total_amount?: number | string;
    total?: number | string;
    payment_status?: string;
    status?: string;
}

export interface OrderUI {
    id: string;
    patient: string;
    date: string;
    total: string;
    payment: string;
    status: string;
}

export interface LoginCredentials {
    telephone: string;
    password: string;
}

export interface AuthResponse {
    access: string;
    refresh: string;
    account?: Record<string, unknown>;
    officine?: Record<string, unknown>;
}

export interface OrderValidationPayload {
    status: string; // "RESERVED" | "REJECTED"
}

export interface PharmacyRegisterData {
    name: string;
    description: string;
    telephone: string;
    adresse: {
        city: string;
        rue: string;
        quater: string;
        bp: string;
        longitude: number;
        latitude: number;
        telephone: string;
    };
}

export interface PharmacistRegisterData {
    officine: string; // ID of the created officine
    telephone: string;
    email: string;
    last_name: string;
    first_name: string;
    password: string;
}

export interface Product {
    id: string;
    name: string;
    dci?: string;
    dosage?: string;

    // UUIDs
    category: string;
    galenic: string;
    unit_base: string;
    unit_sale: string;
    unit_purchase: string;

    // Détails enrichis retournés par l'API
    category_detail?: {
        id: string;
        name: string;
        description?: string;
        is_medical_regulated?: boolean;
    };
    galenic_detail?: {
        id: string;
        name: string;
        unit_base_override?: string;
    };
    unit_base_detail?: {
        id: string;
        code: string;
        label: string;
    };
    unit_sale_detail?: {
        id: string;
        code: string;
        label: string;
    };
    unit_purchase_detail?: {
        id: string;
        code: string;
        label: string;
    };

    sale_price?: number;
    currency?: string;
    image?: string | null;

    created_at?: string;
    updated_at?: string;
    [key: string]: unknown;
}

export interface ProductData {
    name: string;
    galenic: string;
    unit: string;
    expirationDate: string;
    quantity: number;
    purchasePrice: number;
    salePrice: number;
    currency: string;
    stock: number;
    categoryId?: string;
    description?: string;
    [key: string]: unknown;
}

export interface Category {
    id: string;
    name: string;
    description?: string;
    is_medical_regulated?: boolean;
}

export interface Galenic {
    id: string;
    name: string;
    description?: string;
    unit_base_override?: string;
}

export interface Unit {
    id: string;
    label: string;
    code?: string;
    name?: string; // Kept for backward compatibility if needed, but API returns label
}

export interface ProductCreatePayload {
    name: string;
    dci?: string;
    dosage?: string;
    officine?: string;

    // UUIDs des entités existantes
    category?: string;
    galenic?: string;
    unit_base?: string;
    unit_sale?: string;
    unit_purchase?: string;

    // Détails pour création à la volée (optionnels)
    category_detail?: {
        name: string;
        description?: string;
        is_medical_regulated?: boolean;
    };
    galenic_detail?: {
        name: string;
        unit_base_override?: string;
    };
    unit_base_detail?: {
        code: string;
        label: string;
    };
    unit_sale_detail?: {
        code: string;
        label: string;
    };
    unit_purchase_detail?: {
        code: string;
        label: string;
    };
    sale_price?: number;
    currency?: string;
    stock?: number;
    image?: File | string | null;
}

export interface LotCreatePayload {
    pharmacy: string;
    product: string;
    batch_number: string;
    expiration_date: string;
    unit: string;
    quantity: number;
    purchase_price: number;
}

export interface ConversionCreatePayload {
    product: string;
    from_unit: string;
    to_unit: string;
    multiplier: number;
}

export interface PriceCreatePayload {
    pharmacy: string;
    product: string;
    sale_price: number;
    currency: string;
}

export interface Pharmacy {
    id: string;
    name: string;
    description?: string;
    telephone?: string;
    status?: string;
    created_at?: string;
    adresse?: {
        id?: string;
        city?: string;
        rue?: string;
        quater?: string;
        bp?: string;
        longitude?: number;
        latitude?: number;
        telephone?: string;
    };
    [key: string]: unknown;
}
export interface Account {
    id?: string;
    last_name?: string;
    lastName?: string;
    first_name?: string;
    firstName?: string;
    email?: string;
    telephone?: string;
    role?: string;
    status?: string;
    [key: string]: unknown;
}

// --- Planning / Horaires ---
export interface ScheduleDayPayload {
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
    open_time: string;   // 'HH:MM'
    close_time: string;  // 'HH:MM'
    is_guard: boolean;
}

export interface SchedulePayload {
    schedules: ScheduleDayPayload[];
}

export interface ScheduleResponse {
    schedules?: ScheduleDayPayload[];
    [key: string]: unknown;
}

// --- Sous-commande officine ---
export interface SubOrderItemPayload {
    product_id: string;
    quantity: number;
    unit_price?: number;   // prix affiché localement, non envoyé à l'API
}

export interface SubOrderPayload {
    officine_order_id: string;  // ✅ renommé
    items: SubOrderItemPayload[];
}
// --- Facture ---
export interface InvoiceResponse {
    id: string;
    total?: number;
    total_amount?: number;
    created_at?: string;
    [key: string]: unknown;
}

// --- QR Code commande ---
export interface QrCodeResponse {
    qr_code?: string;
    qr_code_url?: string;
    image?: string;
    [key: string]: unknown;
}

// --- Notifications pharmacie ---
export interface PharmaNotification {
    id: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    type?: string;
    order_id?: string;
}

// --- Wallet pharmacie ---
export interface PharmaWallet {
    id: string;
    balance: number;
    locked_amount: number;
    created_at: string;
    updated_at?: string;
}

export interface PharmaTransaction {
    id: string;
    type: 'CREDIT' | 'DEBIT';
    amount: number;
    status: 'COMPLETED' | 'PENDING' | 'FAILED';
    description: string;
    created_at: string;
    reference?: string;
}

// --- Patient-side order types ---

export interface PatientOrderItem {
    id: string | number;
    product_name?: string;
    product?: {
        id?: string;
        name?: string;
        dci?: string;
        dosage?: string;
    };
    /** Prix de vente unitaire défini par l'officine */
    sale_price?: number | string;
    unit_price?: number | string;
    price?: number | string;
    quantity: number | string;
    /** Quantité disponible en stock (peut différer de la quantité demandée) */
    quantity_available?: number | string;
    line_total?: number | string;
    total_price?: number | string;
    [key: string]: unknown;
}

export interface PatientOfficine {
    id?: string;
    name?: string;
    telephone?: string;
    adresse?: {
        city?: string;
        rue?: string;
        quater?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface PatientOrder {
    id: string;
    status: string;
    payment_status?: string;
    total_amount?: number | string;
    currency?: string;
    created_at?: string;
    officine?: PatientOfficine;
    delivery_fee?: number | string;
    patient?: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface PaymentPayload {
    order_id: string;
    payment_method: 'MOMO' | 'CASH' | 'OM';
    phone_number?: string;
}

export interface PaymentResponse {
    success?: boolean;
    message?: string;
    transaction_id?: string;
    [key: string]: unknown;
}
