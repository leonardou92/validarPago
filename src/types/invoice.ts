// src/types/invoice.ts
export interface Invoice {
    id: string;  // Ensure this is a string
    invoiceNumber: string;
    supplier: string;  // Assuming you still need this, even if not directly in the API response
    dueDate: string;
    amount: number; // Ensure this is a number
    description: string;
    category: string; // Assuming you still need this
    tasaCambio: number;
    status: string; // Add this line, or use an enum if you have specific statuses
}

export interface PaymentSummary {
    selectedInvoices: Invoice[];
    totalAmount: number;
    overdueCount: number;
    pendingCount: number;
}

export interface Bank {
    id: string;
    name: string;
    shortName: string;
    logo: string;
    color: string;
    message?: string;  // Optional: Bank details message
    qr_image?: string; // Optional: QR code image URL or base64
    bank_code: string; // Add bank_code
    payment_method_id?: string;
}

export type Step = 'bank' | 'select' | 'review' | 'confirm' | 'complete';

export interface Step1SelectInvoicesProps {
    invoices: Invoice[];
    selectedInvoiceIds: string[];
    searchTerm: string;
    statusFilter: string;
    sortBy: "dueDate" | "amount" | "supplier";
    sortOrder: 'asc' | 'desc';
    onInvoiceSelection: (invoiceId: string, isSelected: boolean) => void;
    onSelectAll: () => void;
    onSelectOverdue: () => void;
    onClearSelection: () => void;
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onSortChange: (sortBy: "dueDate" | "amount" | "supplier") => void;
    onSortOrderChange: (order: 'asc' | 'desc') => void;
    onNext: () => void;
}

export interface Cliente {
    id: number;
    rif_fiscal: string; // Cédula/  RIF
    nombre: string;
    email: string;
    telefono: string;
}

export interface ClienteResponse {
    status: boolean;
    message: string;
    cliente?: Cliente;
}

export interface PushReferenceValidationResponse {
    status: boolean;
    message: string;
    id?: number; // Optional ID property
}

export interface PaymentCreationResult {
    status: boolean;
    message: string;
    reference?: string;
}