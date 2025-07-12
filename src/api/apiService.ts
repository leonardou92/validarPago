// src/api/apiService.ts
import { Bank, ClienteResponse, Invoice, PushReferenceValidationResponse, PaymentCreationResult } from '../types/invoice';

const baseURL = import.meta.env.VITE_API_URL;

const bustCache = () => `&_cache=${Date.now()}`; // Helper function

export const getBanksFromApi = async (cedula: string, apiToken: string): Promise<Bank[]> => {
    try {
        const response = await fetch(`${baseURL}?action=getConfig&cedula=${cedula}${bustCache()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.status) {
            console.error(`API request failed with status: ${response.status}`);
            throw new Error(`API request failed with status: ${response.status}`);
        }

        const data = await response.json();

        if (data.status === true && data.config && Array.isArray(data.config)) {
            return data.config.map((apiBank: any) => ({
                id: apiBank.id_banco,
                name: (apiBank.message ?? '').split('\n')[0],
                shortName: apiBank.shortName,
                logo: '🏦',
                color: 'from-green-500 to-green-600',
                message: apiBank.message,
                qr_image: apiBank.qr_image,
                bank_code: apiBank.bank_code,
                payment_method_id: apiBank.payment_method_id
            }));
        } else {
            console.error('API returned status false or invalid config:', data);
            throw new Error(data.message || 'API returned status false or invalid config');
        }
    } catch (error: any) {
        console.error('Error fetching banks:', error);
        throw new Error(`Error fetching banks: ${error.message}`);
    }
};

export const searchClient = async (cedula: string, apiToken: string): Promise<ClienteResponse> => {
    try {
        const response = await fetch(`${baseURL}?action=searchClient&cedula=${cedula}${bustCache()}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.status) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error("Error fetching client:", error);
        throw new Error(`Error fetching client: ${error.message}`);
    }
};


export const fetchInvoicesFromApi = async (cedula: string, apiToken: string): Promise<Invoice[]> => {
    try {
        const response = await fetch(`${baseURL}?action=getInvoice&cedula=${cedula}${bustCache()}`,{
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });


        const data = await response.json();

           if (!data.facturas){
             console.error(`API request returns not facturas`);
               throw new Error(`API request returns no facturas`);
           }

            return data.facturas.map((apiInvoice: any) => {
                const amount = parseFloat(apiInvoice.amount);
                const tasaCambio = parseFloat(apiInvoice.tasa_cambio);
                return {
                    id: apiInvoice.id.toString(), // Ensure ID is a string
                    invoiceNumber: apiInvoice.invoiceNumber,
                    dueDate: apiInvoice.dueDate,
                    amount: amount,
                    description: apiInvoice.description,
                    supplier: '', // You might need to adjust this
                    category: 'General', // You might need to adjust this
                    tasaCambio: tasaCambio
                };
            });

    } catch (error: any) {
        console.error("Error fetching invoices:", error);
        throw new Error(`Error fetching invoices: ${error.message}. Please check your internet connection and try again.`);
    }
};

export const validateReference = async (
    reference: string,
    monto: string,
    banco: string,
    fecha: string,
    apiToken: string
): Promise<{ status: boolean; message: string }> => {
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validateReference',
                reference: reference,
                monto: monto,
                banco: banco,
                fecha: fecha
            }),
        });

        if (!response.status) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error validating reference:', error);
        return { status: false, message: `Error validating reference: ${error.message}` };
    }
};

export const validatePushReference = async (
    monto: string,
    banco: string,
    fecha: string,
    cedula: string,
    telefono: string,
    apiToken: string
): Promise<PushReferenceValidationResponse> => {
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'validatePushReference',
                monto: monto,
                banco: banco,
                fecha: fecha,
                cedula: cedula,
                telefono: telefono
            }),
        });

        if (!response.status) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error validating push reference:', error);
        return { status: false, message: `Error validating push reference: ${error.message}` };
    }
};

// New function to create the push payment
export const createPushPayment = async (
    monto: number,
    idFormaPago: string,
    fecha: string,
    cedula: string,
    idCliente: number,
    tasaCambio: number,
    idImportacion: number,
    invoiceIds: number[],
    apiToken: string
): Promise<PaymentCreationResult> => {
    try {
        const response = await fetch(baseURL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                action: 'createPushPayment',
                monto: monto,
                idFormaPago: idFormaPago,
                fecha: fecha,
                cedula: cedula,
                idCliente: idCliente,
                tasaCambio: tasaCambio,
                idImportacion: idImportacion,
                invoiceIds: invoiceIds
            }),
        });

        if (!response.status) {
            throw new Error(`API request failed with status: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error creating push payment:', error);
        return { status: false, message: `Error creating push payment: ${error.message}` };
    }
};