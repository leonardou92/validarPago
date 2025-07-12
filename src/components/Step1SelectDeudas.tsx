// src/components/Step1SelectDeudas.tsx
import React, { memo, useCallback } from 'react';
import { Invoice } from '../types/invoice';
import { InvoiceCard } from './InvoiceCard';
import { FilterBar } from './FilterBar';
import { FileText, CheckSquare, XSquare, AlertTriangle } from 'lucide-react';
import { useInvoiceContext } from '../context/InvoiceContext'; // Import the context

interface Step1Props {
    invoices: Invoice[];
    searchTerm: string;
    statusFilter: string;
    sortBy: "dueDate" | "amount" | "supplier";
    sortOrder: 'asc' | 'desc';
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onSortChange: (sortBy: "dueDate" | "amount" | "supplier") => void;
    onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const Step1SelectDeudasComponent: React.FC<Step1Props> = ({
    invoices,
    searchTerm,
    statusFilter,
    sortBy,
    sortOrder,
    onSearchChange,
    onStatusFilterChange,
    onSortChange,
    onSortOrderChange,
}) => {
    const { selectedInvoiceIds, handleInvoiceSelection, selectAllInvoices, selectOverdueInvoices, clearSelection, updatePaymentSummary, fetchBankDetails, setCurrentStep, fetchAvailableBanks, cedula, apiToken, clientData } = useInvoiceContext(); // Get context values
    const hasSelection = selectedInvoiceIds.size > 0;

    const handleInvoiceSelectionWrapper = useCallback(
        (invoiceId: string, isSelected: boolean) => {
            handleInvoiceSelection(invoiceId, isSelected);
            updatePaymentSummary(); // Update the payment summary after selection changes
        },
        [handleInvoiceSelection, updatePaymentSummary]
    );

    const handleSelectAllWrapper = useCallback(() => {
        selectAllInvoices();
        updatePaymentSummary();
    }, [selectAllInvoices, updatePaymentSummary]);

    const handleSelectOverdueWrapper = useCallback(() => {
        selectOverdueInvoices();
        updatePaymentSummary();
    }, [selectOverdueInvoices, updatePaymentSummary]);

    const handleClearSelectionWrapper = useCallback(() => {
        clearSelection();
        updatePaymentSummary();
    }, [clearSelection, updatePaymentSummary]);

    const handleNext = useCallback(async () => {
        if (!hasSelection) {
            alert("Por favor, seleccione al menos una deuda antes de continuar.");
            return;
        }

        updatePaymentSummary(); // UPDATE PAYMENT SUMMARY BEFORE FETCHING BANK DETAILS

        try {
            // await fetchBankDetails(cedula, apiToken); // Fetch bank details
            await fetchAvailableBanks(cedula, apiToken); // Load the available banks
            setCurrentStep(2);
            // setCurrentStep(3); // Move to Step 3 after fetching details
        } catch (error: any) {
            alert(`Error fetching bank details: ${error.message}`);
            // Handle error as needed (e.g., display error message)
        }
    }, [hasSelection, setCurrentStep, cedula, apiToken, updatePaymentSummary, fetchAvailableBanks]); // ADD updatePaymentSummary

    const clientName = clientData?.cliente?.nombre || 'N/A';
    const clientCedula = clientData?.cliente?.rif_fiscal || 'N/A';
    const clientPhone = clientData?.cliente?.telefono || 'N/A';
    const clientEmail = clientData?.cliente?.email || 'N/A';

    return (
        <div className="space-y-6">
            {/* Client Information Section */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 md:px-6 md:py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">
                        Información del Cliente
                    </h4>
                </div>
                <div className="p-4 md:p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="block font-medium text-gray-700">Nombre:</span>
                            <span className="block text-gray-600">{clientName}</span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-700">Cédula/RIF:</span>
                            <span className="block text-gray-600">{clientCedula}</span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-700">Teléfono:</span>
                            <span className="block text-gray-600">{clientPhone}</span>
                        </div>
                        <div>
                            <span className="block font-medium text-gray-700">Email:</span>
                            <span className="block text-gray-600">{clientEmail}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-200">
                <h3 className="text-xl font-semibold text-gray-900 mb-2 md:mb-3">
                    Paso 1: Seleccionar Deudas
                </h3>
                <p className="text-gray-600 leading-relaxed text-sm">
                    Elige las deudas a pagar. Puedes usar los filtros para encontrar deudas específicas.
                </p>
            </div>

            <FilterBar
                searchTerm={searchTerm}
                onSearchChange={onSearchChange}
                statusFilter={statusFilter}
                onStatusFilterChange={onStatusFilterChange}
                sortBy={sortBy}
                onSortChange={onSortChange}
                sortOrder={sortOrder}
                onSortOrderChange={onSortOrderChange}
            />

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={handleSelectAllWrapper}
                    className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 shadow-sm"
                >
                    <CheckSquare className="w-4 h-4" />
                    <span>Todas</span>
                </button>

                <button
                    onClick={handleClearSelectionWrapper}
                    className="flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium focus:outline-none focus:ring-gray-500 focus:ring-opacity-50 shadow-sm"
                >
                    <XSquare className="w-4 h-4" />
                    <span>Limpiar</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {invoices.map((invoice) => (
                    <InvoiceCard
                        key={invoice.id}
                        invoice={invoice}
                        isSelected={selectedInvoiceIds.has(invoice.id)}
                        onSelectionChange={handleInvoiceSelectionWrapper}
                    />
                ))}
            </div>

            <div className="flex justify-between items-center pt-4">
                <button
                    onClick={handleNext}
                    disabled={!hasSelection}
                    className={`
            px-5 py-2 rounded-lg font-semibold transition-all duration-200 text-sm
            ${hasSelection
                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
          `}
                >
                    Continuar ({selectedInvoiceIds.size} seleccionadas)
                </button>
            </div>
        </div>
    );
};

export const Step1SelectDeudas = memo(Step1SelectDeudasComponent, (prevProps, nextProps) => {
    // Compare the props that affect rendering
    return (
        prevProps.invoices === nextProps.invoices &&
        prevProps.searchTerm === nextProps.searchTerm &&
        prevProps.statusFilter === nextProps.statusFilter &&
        prevProps.sortBy === nextProps.sortBy &&
        prevProps.sortOrder === nextProps.sortOrder
    );
});