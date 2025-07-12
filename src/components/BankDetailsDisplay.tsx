// src/components/BankDetailsDisplay.tsx
import React from 'react';

interface BankDetailsDisplayProps {
    bankDetails: { message: string; qr_image?: string } | null;
}

function BankDetailsDisplay({ bankDetails }: BankDetailsDisplayProps) {
    const qrCodeData = bankDetails?.qr_image;
    const imageUrl = qrCodeData ? `data:image/png;base64,${qrCodeData}` : null;

    // Split the message into lines
    const messageLines = bankDetails?.message?.split('\n') || [];

    return (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h5 className="font-semibold text-gray-900 mb-3">Detalles del Banco:</h5>
            <div className="flex flex-col items-center md:flex-row md:items-center">
                
                <div className="text-gray-700 md:text-left flex-grow flex items-center justify-center">
                    <div>
                        {messageLines.map((line, index) => (
                            <p key={index} className="whitespace-pre-line text-center">{line}</p>
                        ))}
                    </div>
                </div>
                {imageUrl && (
                    <div className="md:mr-4 mb-2 md:mb-0 w-full max-w-full md:max-w-[30%]">
                        <img
                            src={imageUrl}
                            alt="Código QR para Pago"
                            className="max-w-full h-auto rounded-md"
                            onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = "https://via.placeholder.com/150?text=Imagen+No+Disponible";
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default BankDetailsDisplay;