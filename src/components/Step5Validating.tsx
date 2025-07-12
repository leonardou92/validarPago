// src/components/Step5Validating.tsx
import React, { useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import { useInvoiceContext } from '../context/InvoiceContext';

export const Step5Validating: React.FC = () => {
    const { paymentCreationResult, pushReferenceValidationResult, apiError, setCurrentStep } = useInvoiceContext();

   useEffect(() => {
        if (paymentCreationResult && !paymentCreationResult.status) {
            setCurrentStep(5);
       }
    }, [paymentCreationResult, setCurrentStep]);

    return (
        <div className="space-y-6">
            {paymentCreationResult === null ? (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-white animate-spin" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            Validando y Creando el Pago
                        </h3>
                        <p className="text-gray-600 text-lg">
                            Estamos validando el pago automáticamente y creando el registro. Por favor espere...
                        </p>
                        <div className="animate-pulse text-green-500">Validando...</div>
                    </div>
                </div>
            ) : paymentCreationResult.status ? (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            ¡Pago Validado y Creado Exitosamente!
                        </h3>
                         {paymentCreationResult.reference && (
                            <p className="text-gray-600 text-lg">
                                <span>Referencia:</span>
                                <span>{paymentCreationResult.reference}</span>
                            </p>
                         )}
                         
                        <p className="text-gray-600 text-lg">
                            El pago ha sido validado y registrado correctamente.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 border border-red-200">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-2">
                            Error al Validar o Crear el Pago
                        </h3>
        
                    </div>
     
                 </div>
            )}
        </div>
    );
};