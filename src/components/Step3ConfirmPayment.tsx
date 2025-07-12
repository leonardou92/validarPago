// src/components/Step3ConfirmPayment.tsx
import React, { useState, useCallback } from 'react';
import { PaymentSummary } from '../types/invoice';
import { CreditCard, ArrowLeft, Lock, Shield, CheckCircle } from 'lucide-react';
import { useInvoiceContext } from "../context/InvoiceContext";

interface Step3Props {
    summary: PaymentSummary;
}

export const Step3ConfirmPayment: React.FC<Step3Props> = ({
    summary,
}) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const { referenceNumber, setCurrentStep, createPushPaymentAndProceed, selectedBank } = useInvoiceContext();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'VES',
            minimumFractionDigits: 2
        }).format(amount);

    };

    const handleConfirm = useCallback(async () => {
       if(!selectedBank) {
           alert("Debe seleccionar un banco antes de confirmar el pago")
           return
       }

        setIsProcessing(true);
        //await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing time

       //Start the payment process using createPushPaymentAndProceed from InvoiceContext.
       await createPushPaymentAndProceed();

        setIsProcessing(false);
        //onConfirm(); //This is no longer needed here because createPushPaymentAndProceed already calls setCurrentStep
    }, [createPushPaymentAndProceed, setIsProcessing, selectedBank]);

    const handleBack = useCallback(() => {
        setCurrentStep(2);
    }, [setCurrentStep]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Paso 3: Confirmar Pago
                </h3>
                <p className="text-gray-600">
                    Último paso antes de procesar el pago. Verifica que toda la información sea correcta.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h4 className="text-xl font-bold text-white flex items-center space-x-2">
                        <CreditCard className="w-6 h-6" />
                        <span>Resumen Final del Pago</span>
                    </h4>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-2 gap-6 mb-6">
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-blue-600 mb-1">
                                    {summary.selectedInvoices.length}
                                </div>
                                <div className="text-sm font-medium text-blue-900">
                                    Deudas a Pagar
                                </div>
                            </div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-green-600 mb-1">
                                    {formatCurrency(summary.totalAmount)}
                                </div>
                                <div className="text-sm font-medium text-green-900">
                                    Monto Total
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Deudas Incluidas:</h5>
                        <div className="space-y-2 max-h-32 overflow-y-auto">
                            {summary.selectedInvoices.map((invoice) => (
                                <div key={invoice.id} className="flex justify-between items-center text-sm">
                                    <span className="text-gray-700">{invoice.invoiceNumber}</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(invoice.amount)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                        <div className="flex items-start space-x-3">
                            <Shield className="w-5 h-5 text-yellow-600 mt-0.5" />
                            <div>
                                <h6 className="font-medium text-yellow-900 mb-1">
                                    Información Importante
                                </h6>
                                <ul className="text-sm text-yellow-800 space-y-1">
                                    <li>• El pago se procesará inmediatamente</li>
                                    <li>• Recibirás una confirmación por email</li>
                                    <li>• Las deudas se marcarán como pagadas</li>
                                    <li>• Esta acción no se puede deshacer</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 mb-6">
                        <Lock className="w-4 h-4" />
                        <span>Transacción segura y encriptada</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={handleBack}
                    disabled={isProcessing}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Volver al Resumen</span>
                </button>

                <button
                    onClick={handleConfirm}
                    disabled={isProcessing}
                    className={`
            flex items-center space-x-2 px-8 py-3 rounded-lg font-semibold transition-all duration-200
            ${isProcessing
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl'
                        } text-white
          `}
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Procesando...</span>
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Procesar Pago</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};