// src/components/Step2ReviewPayment.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { PaymentSummary, Bank } from '../types/invoice';
import { DollarSign, FileText, AlertTriangle, ArrowLeft, ArrowRight, Building2, Calendar, Banknote, QrCode } from 'lucide-react';
import { useInvoiceContext } from "../context/InvoiceContext";
import { validateReference} from "../api/apiService";
import BankDetailsDisplay from "./BankDetailsDisplay";

interface Step2Props {
    summary: PaymentSummary;
}

export const Step2ReviewPayment: React.FC<Step2Props> = ({
    summary,
}) => {
    const {setReferenceNumber, selectedBank, bankDetails, setIsPushReferenceValidating, pushReferenceValidationResult, startPushReferenceValidation, isPushReferenceValidating,cedula, telefono,setTelefono,clientData, setCurrentStep, isManualReference, setIsManualReference } = useInvoiceContext();
    const [localReferenceNumber, setLocalReferenceNumber] = useState('');
    const [referenceValidationMessage] = useState('');
    const { apiToken } = useInvoiceContext();

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'VES',
            minimumFractionDigits: 2
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

     useEffect(() => {
        if (!selectedBank) {
            alert("Por favor, seleccione un banco.");
        }
    }, [selectedBank]);
    // Effect to set telefono state when clientData changes

    useEffect(() => {
        if (clientData && clientData.cliente && clientData.cliente.telefono) {
            setTelefono(clientData.cliente.telefono);
        }
    }, [clientData, setTelefono]);

    //useEffect to start automatic validation, cedula or telefono changes
     useEffect(() => {
       // Conditionally trigger startPushReferenceValidation
         if (selectedBank && cedula && telefono) {
           startPushReferenceValidation();
         }
    }, [selectedBank, cedula, telefono, startPushReferenceValidation, isManualReference]);

    // Function to handle manual reference validation
    const validateManualReference = useCallback(async () => {
          if (!selectedBank) {
                alert("Por favor, seleccione un banco.");
                return;
            }

            if (!localReferenceNumber) {
                alert("Por favor, ingrese el número de referencia.");
                return;
            }
            //console.log('Calling validateReference');

            const reference = localReferenceNumber;
            const monto = summary.totalAmount.toString();
            const banco = selectedBank.bank_code;
            const fecha = new Date().toISOString().slice(0, 10);

            try {
                const validationResult = await validateReference(reference, monto, banco, fecha, apiToken);
                if (validationResult.status) {
                    setReferenceNumber(reference);
                    setIsPushReferenceValidating(false)
                    setCurrentStep(4);
                } else {
                    alert(validationResult.message || 'Referencia inválida.');
                }
            } catch (error: any) {
                console.error("Error validating reference:", error);
                alert(`Error al validar la referencia: ${error.message}`);
            }

    }, [localReferenceNumber, summary.totalAmount, selectedBank, apiToken, setIsPushReferenceValidating, setReferenceNumber, setCurrentStep,validateReference]);

    const handleBack = useCallback(() => {
        setCurrentStep(1);
    }, [setCurrentStep]);

    const handleManualReference = useCallback(() => {
        setIsPushReferenceValidating(false);
        setIsManualReference(true); //Set to True the manual reference
    }, [setIsPushReferenceValidating, setIsManualReference]);

    return (
        <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Paso 3: Revisar Pago
                </h3>
                <p className="text-gray-600">
                    Revisa cuidadosamente las deudas seleccionadas, los detalles del banco y el monto total antes de proceder. Ingrese el número de referencia del pago.
                </p>
            </div>

             <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-900">
                        Detalle de Deudas Seleccionadas
                    </h4>
                </div>

                <div className="divide-y divide-gray-200">
                    {summary.selectedInvoices.map((invoice) => (
                        <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h5 className="text-lg font-semibold text-gray-900">
                                            {invoice.invoiceNumber}
                                        </h5>
                                        <span className={`
                      inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                      ${invoice.status === 'overdue'
                                                ? 'bg-red-100 text-red-800'
                                                : 'bg-green-100 text-green-800'
                                            }
                    `}>
                                            {invoice.status === 'overdue' ? 'Vencida' : 'Pendiente'}
                                        </span>
                                    </div>

                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-2">
                                        <div className="flex items-center space-x-1">
                                            <Building2 className="w-4 h-4" />
                                            <span>{invoice.supplier}</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>Vence: {formatDate(invoice.dueDate)}</span>
                                        </div>
                                    </div>

                                    <p className="text-sm text-gray-700">{invoice.description}</p>
                                </div>

                                <div className="text-right ml-6">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {formatCurrency(invoice.amount)}
                                    </div>
                                    <div className="text-sm text-gray-500">{invoice.category}</div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-700">Total a Pagar:</span>
                        <span className="text-3xl font-bold text-green-600">
                            {formatCurrency(summary.totalAmount)}
                        </span>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                 {selectedBank && bankDetails ? (
                    <>
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            Banco Seleccionado: {selectedBank.name}
                        </h4>
                        <BankDetailsDisplay bankDetails={bankDetails} />

                        {/*<div className="mb-4">
                            <label htmlFor="referenceNumber" className="block text-gray-700 text-sm font-bold mb-2">
                                Número de Referencia del Pago:
                            </label>
                            <input
                                type="text"
                                id="referenceNumber"
                                value={localReferenceNumber}
                                onChange={(e) => setLocalReferenceNumber(e.target.value)}
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Ingresa el número de referencia"
                            />
                            {referenceValidationMessage && (
                                <p className="text-red-500 text-sm mt-1">{referenceValidationMessage}</p>
                            )}
                        </div>
                        */}
                    </>
                     ) : (
                         <p>Seleccione un banco para ver los detalles.</p>
                     )}
                </div>

            <div className="flex justify-between pt-6">
                <button
                    onClick={handleBack}
                    className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Volver a Selección</span>
                </button>
                {/*
               <div>
                  <button
                        onClick={validateManualReference}
                        className="flex items-center space-x-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow-lg hover:shadow-xl transition-all duration-200"
                   >
                     <span>Confirmar Pago</span>
                      <ArrowRight className="w-5 h-5" />
                   </button>

               </div>
                */}
            </div>
             
        </div>
    );
};

export default Step2ReviewPayment;