// src/components/CompanyInfoDisplay.tsx

import React, { useState, useEffect } from 'react';

interface CompanyData {
    empresa: string;
    descripcion: string;
    logoEmpresa?: string; // Base64 encoded image
    direccion: string;
}

interface CompanyInfoDisplayProps {
    apiUrl: string;
    apiToken: string;
}

const CompanyInfoDisplay: React.FC<CompanyInfoDisplayProps> = ({ apiUrl, apiToken }) => {
    const [companyData, setCompanyData] = useState<CompanyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(apiUrl, {
                    headers: {
                        'Authorization': `Bearer ${apiToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
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
            } catch (e: any) {
                setError(e.message);
                setIsLoading(false);
            }
        };

        fetchData();
    }, [apiUrl, apiToken]);

    const isAddressInLogo = (logoData: string) => {
        return logoData === companyData?.direccion
    };

    if (isLoading) {
        return (
            <div className="bg-white rounded-xl shadow-md p-6">
                <p>Loading company information...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline">{error}</span>
            </div>
        );
    }

    if (!companyData) {
        return <div className="bg-white rounded-xl shadow-md p-6">No company data available.</div>;
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