import React, { memo } from 'react';
import { PaymentSummary } from '../types/invoice';
import { DollarSign, FileText, AlertTriangle, CheckCircle, CreditCard } from 'lucide-react';

interface PaymentSummaryProps {
    summary: PaymentSummary;
    onProcessPayment: () => void;
}

const PaymentSummaryComponentInner: React.FC<PaymentSummaryProps> = ({
    summary,
    onProcessPayment
}) => {
    const formatCurrency = (amount: number) => {
         const formattedAmount = new Intl.NumberFormat('es-VE', { //es-VE
            style: 'decimal', // Use decimal style to avoid symbol
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return `Bs. ${formattedAmount}`; // Prepend "Bs."
    };

    const hasSelectedInvoices = summary.selectedInvoices.length > 0;

    return (
        <div className="sticky top-6 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                    <DollarSign className="w-6 h-6" />
                    <span>Resumen de Pagos</span>
                </h2>
            </div>

            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <FileText className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Seleccionadas</span>
                        </div>
                        <div className="text-2xl font-bold text-blue-600">
                            {summary.selectedInvoices.length}
                        </div>
                    </div>

                    <div className="bg-red-50 rounded-lg p-4 text-center">
                        <div className="flex items-center justify-center space-x-2 mb-2">
                            <AlertTriangle className="w-5 h-5 text-red-600" />
                            <span className="text-sm font-medium text-red-900">Vencidas</span>
                        </div>
                        <div className="text-2xl font-bold text-red-600">
                            {summary.overdueCount}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
                        <span className="text-3xl font-bold text-green-600">
                            {formatCurrency(summary.totalAmount)}
                        </span>
                    </div>

                    {hasSelectedInvoices && (
                        <div className="space-y-2 mb-4">
                            <h4 className="font-medium text-gray-700 mb-2">Deudas Seleccionadas:</h4>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                                {summary.selectedInvoices.map((invoice) => (
                                    <div key={invoice.id} className="flex justify-between items-center text-sm bg-gray-50 rounded px-3 py-2">
                                        <span className="text-gray-700">{invoice.invoiceNumber}</span>
                                        <span className="font-medium text-gray-900">
                                            {formatCurrency(invoice.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={onProcessPayment}
                    disabled={!hasSelectedInvoices}
                    className={`
            w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200
            flex items-center justify-center space-x-2
            ${hasSelectedInvoices
                            ? 'bg-green-600 hover:bg-green-700 active:scale-95 shadow-lg hover:shadow-xl'
                            : 'bg-gray-300 cursor-not-allowed'
                        }
          `}
                >
                    <CreditCard className="w-5 h-5" />
                    <span>
                        {hasSelectedInvoices
                            ? `Procesar Pago - ${formatCurrency(summary.totalAmount)}`
                            : 'Selecciona deudas para pagar'
                        }
                    </span>
                </button>

                {hasSelectedInvoices && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center space-x-2 text-green-800">
                            <CheckCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">
                                Listo para procesar {summary.selectedInvoices.length} deuda(s)
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export const PaymentSummaryComponent = memo(PaymentSummaryComponentInner, (prevProps, nextProps) => {
  return (
    prevProps.summary === nextProps.summary
  );
});