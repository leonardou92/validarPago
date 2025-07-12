// src/hooks/useInvoiceManager.ts
import { useState, useMemo, useCallback } from 'react';
import { Invoice } from '../types/invoice';
import { useInvoiceContext } from '../context/InvoiceContext'; // Import the context

export const useInvoiceManager = (invoices: Invoice[]) => {
    const { selectedInvoiceIds, setSelectedInvoiceIds } = useInvoiceContext(); // Use the context
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortBy, setSortBy] = useState<'dueDate' | 'amount' | 'supplier'>('dueDate');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

    const filteredAndSortedInvoices = useMemo(() => {
        let filtered = invoices.filter(invoice => {
            const matchesSearch = searchTerm === '' ||
                invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
                invoice.description.toLowerCase().includes(searchTerm.toLowerCase());

            const matchesStatus = statusFilter === '' || invoice.status === statusFilter;

            return matchesSearch && matchesStatus;
        });

        return filtered.sort((a, b) => {
            let aValue: string | number;
            let bValue: string | number;

            switch (sortBy) {
                case 'dueDate':
                    aValue = new Date(a.dueDate).getTime();
                    bValue = new Date(b.dueDate).getTime();
                    break;
                case 'amount':
                    aValue = a.amount;
                    bValue = b.amount; // <-- CORRECCIÓN AQUÍ: Era 'a.amount', ahora es 'b.amount'
                    break;
                case 'supplier':
                    aValue = a.supplier.toLowerCase();
                    bValue = b.supplier.toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (sortOrder === 'asc') {
                return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
            } else {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
        });
    }, [invoices, searchTerm, statusFilter, sortBy, sortOrder]); // <-- OPTIMIZACIÓN AQUÍ: Se eliminó 'selectedInvoiceIds' de las dependencias.

    const handleInvoiceSelection = useCallback((invoiceId: string, isSelected: boolean) => {
        const newSet: Set<string> = new Set(selectedInvoiceIds);
        if (isSelected) {
            newSet.add(invoiceId);
        } else {
            newSet.delete(invoiceId);
        }
        setSelectedInvoiceIds(newSet);
    }, [setSelectedInvoiceIds, selectedInvoiceIds]);

    return {
        filteredAndSortedInvoices,
        selectedInvoiceIds,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        handleInvoiceSelection,
        setSearchTerm,
        setStatusFilter,
        setSortBy,
        setSortOrder,
    };
};