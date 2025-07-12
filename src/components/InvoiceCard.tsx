import React from 'react';
import { Invoice } from '../types/invoice';
import { Calendar, Building2, DollarSign, Tag } from 'lucide-react';

interface InvoiceCardProps {
    invoice: Invoice;
    isSelected: boolean;
    onSelectionChange: (invoiceId: string, isSelected: boolean) => void;
}

export const InvoiceCard: React.FC<InvoiceCardProps> = ({
    invoice,
    isSelected,
    onSelectionChange
}) => {
    const formatCurrency = (amount: number) => {
        // return new Intl.NumberFormat('es-ES', { // Changed from es-ES to es-VE
        //     style: 'currency',
        //     currency: 'VES', // or VEF  or just use style decimal and prepend the symbol (VES deprecated)
        //     minimumFractionDigits: 2
        // }).format(amount);

        const formattedAmount = new Intl.NumberFormat('es-VE', {
            style: 'decimal',
            minimumFractionDigits: 2
        }).format(amount);
        return `Bs. ${formattedAmount}`;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-VE', { //es-VE
            year: 'numeric',
            month: 'short', // Short month for compactness
            day: 'numeric'
        });
    };

    const isOverdue = new Date(invoice.dueDate) < new Date();

    const daysUntilDue = Math.ceil(
        (new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <div
            className={`
        relative p-3 rounded-md border transition-all duration-300 cursor-pointer
        ${isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-md scale-[1.01]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
        ${isOverdue ? 'ring-1 ring-red-200' : ''}
      `}
            onClick={() => onSelectionChange(invoice.id, !isSelected)}
        >
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                    <div className={`
            w-4 h-4 rounded border flex items-center justify-center transition-colors
            ${isSelected
                            ? 'bg-blue-500 border-blue-500'
                            : 'border-gray-300 hover:border-blue-400'
                        }
          `}>
                        {isSelected && (
                            <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        )}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 truncate max-w-[120px]">{invoice.invoiceNumber}</h3>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                        {formatCurrency(invoice.amount)}
                    </div>
                </div>
            </div>

            <div className="text-xs text-gray-600">
                Vence: {formatDate(invoice.dueDate)}
                {isOverdue && (
                    <span className="text-red-600 font-medium"> (Vencida)</span>
                )}
            </div>
        </div >
    );
};