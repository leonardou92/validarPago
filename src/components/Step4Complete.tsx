// src/components/Step4Complete.tsx
import React from 'react';
import { PaymentSummary } from '../types/invoice';
import { CheckCircle, Download, Home, Mail } from 'lucide-react';
import { useInvoiceContext } from '../context/InvoiceContext';  // Import the context

interface Step4Props {
    summary: PaymentSummary;
    onStartOver: () => void;
}

export const Step4Complete: React.FC<Step4Props> = ({
    summary,
    onStartOver
}) => {
    const { paymentCreationResult, clientData } = useInvoiceContext();  // Get the payment creation result and clientData

    const formatCurrency = (amount: number) => {
        const formattedAmount = new Intl.NumberFormat('es-VE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return `Bs. ${formattedAmount}`;
    };

    const transactionId = `TXN-${Date.now()}`;
    const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    return (
        <div className="space-y-6">
            {paymentCreationResult === null ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200 print:bg-white print:border-black print:rounded-none">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            {/* Show a loading indicator while the payment is being created */}
                            <CheckCircle className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            Procesando Pago...
                        </h3>
                        <p className="text-gray-600 text-lg">
                            Estamos procesando tu pago. Por favor espera un momento.
                        </p>
                    </div>
                </div>
            ) : paymentCreationResult.status ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 print:bg-white print:border-black print:rounded-none">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            ¡Pago Procesado Exitosamente!
                        </h3>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200 print:bg-white print:border-black print:rounded-none">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            Error al Procesar el Pago
                        </h3>
                        <p className="text-gray-600 text-lg">
                            {paymentCreationResult.message}
                        </p>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden print:shadow-none print:border-black print:rounded-none">
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 print:bg-gray-300">
                    <h4 className="text-xl font-bold text-white print:text-black">
                        Detalles de la Transacción
                    </h4>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Información del Pago</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Fecha y Hora:</span>
                                    <span className="text-gray-900">{currentDate}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Estado:</span>
                                    <span className="text-green-600 font-medium">Completado</span>
                                </div>
                                {paymentCreationResult && paymentCreationResult.reference && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Referencia:</span>
                                        <span className="text-gray-900">{paymentCreationResult.reference}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                         <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Información del Cliente</h5>
                            <div className="space-y-2 text-sm">
                                {clientData && clientData.cliente ? (
                                    <>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Nombre:</span>
                                            <span className="text-gray-900">{clientData.cliente.nombre}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Cédula/RIF:</span>
                                            <span className="text-gray-900">{clientData.cliente.rif_fiscal}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Email:</span>
                                            <span className="text-gray-900">{clientData.cliente.email}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600">Teléfono:</span>
                                            <span className="text-gray-900">{clientData.cliente.telefono}</span>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-gray-500">No hay información del cliente disponible.</p>
                                )}
                            </div>
                         </div>

                        <div>
                            <h5 className="font-semibold text-gray-700 mb-2">Resumen del Pago</h5>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Deudas Pagadas:</span>
                                    <span className="text-gray-900">{summary.selectedInvoices.length}</span>
                                </div>

                                <div className="flex justify-between font-semibold">
                                    <span className="text-gray-700">Monto Total:</span>
                                    <span className="text-green-600 text-lg">
                                        {formatCurrency(summary.totalAmount)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                  

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
                        <div className="flex items-start space-x-3">
                            <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                            <div>
                                <h6 className="font-medium text-blue-900 mb-1">
                                    Confirmación Enviada
                                </h6>
                                <p className="text-sm text-blue-800">
                                    Se ha enviado un comprobante de pago a tu correo electrónico con todos los detalles de la transacción.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6 print:hidden">
                <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Download className="w-5 h-5" />
                    <span>Descargar Comprobante</span>
                </button>

                <button
                    onClick={onStartOver}
                    className="flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <Home className="w-5 h-5" />
                    <span>Procesar Más Pagos</span>
                </button>
            </div>
        </div>
    );
};