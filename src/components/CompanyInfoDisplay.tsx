// src/components/CompanyInfoDisplay.tsx

import React, { useState, useEffect, useCallback } from 'react';
import Modal from './Modal'; // Import the Modal component

interface CompanyData {
    empresa: string;
    descripcion: string;
    logoEmpresa?: string; // Base64 encoded image
    direccion: string;
}

interface CompanyInfoDisplayProps {
    apiUrl: string;
    apiToken: string;
    language: string; // Add language prop
}

const CompanyInfoDisplay: React.FC<CompanyInfoDisplayProps> = ({ apiUrl, apiToken, language }) => {
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showErrorModal, setShowErrorModal] = useState(false);  // New state for the modal

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                    'Accept-Language': language // Send language preference
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}, vuelva a recargar la pagina` );
            }

            const data = await response.json();

            if (data.status && data.empresa) {
                // Assuming API also returns a logo URL (if not, adjust accordingly)
                setCompanyData({
                    empresa: data.empresa,
                    descripcion: data.descripcion,
                    logoEmpresa: data.logoEmpresa || '', // Replace with actual API field if different
                    direccion: data.direccion || ''
                });
            } else {
                throw new Error(data.message || 'Failed to fetch company data.');
            }

            setIsLoading(false);
            setShowErrorModal(false); // Ensure modal is closed on successful fetch
        } catch (e: any) {
            setError(e.message);
            setIsLoading(false);
            setShowErrorModal(true);  // Show the modal on error
        }
    }, [apiUrl, apiToken, language]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const isAddressInLogo = (logoData: string) => {
        return logoData === companyData?.direccion
    };

    const handleRetry = () => {
        setShowErrorModal(false); // Close modal before retrying
        fetchData();
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <p>Cargando información de la empresa...</p>
            </div>
        );
    }

    if (showErrorModal) {
        return (
            <>
                <Modal
                    isOpen={showErrorModal}
                    onClose={() => { }} // Prevent closing directly.
                    title="¡Error al Cargar Datos!"
                    message={`Hubo un problema al obtener la información de la empresa. Por favor, inténtalo de nuevo. Error: ${error || 'Desconocido'}`}
                >
                </Modal>
                <div className="flex justify-center mt-4">
                    <button
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
                        onClick={handleRetry}
                    >
                        Reintentar
                    </button>
                </div>
            </>
        );
    }

    if (!companyData) {
        return <div className="bg-white rounded-xl shadow-md p-6">No hay información de la empresa disponible.</div>;
    }

    return (
        <div className="bg-white rounded-xl shadow-md p-6 flex items-center flex-col">
            <div className="flex-shrink-0 flex flex-col items-center">
                {companyData.logoEmpresa && !isAddressInLogo(companyData.logoEmpresa) ? (
                    <img
                        src={`data:image/png;base64,${companyData.logoEmpresa}`}
                        alt={`${companyData.empresa} Logo`}
                        className="max-w-[120px] max-h-[80px] object-contain shadow-md"
                        onError={(e: any) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = 'https://dummyimage.com/100x100/ccc/fff&text=No+Logo';
                        }}
                    />
                ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                        No Logo
                    </div>
                )}
                <p className="text-gray-700 leading-relaxed italic text-center mt-2">
                    {companyData.descripcion}
                </p>
            </div>
        </div>
    );
};

export default CompanyInfoDisplay;