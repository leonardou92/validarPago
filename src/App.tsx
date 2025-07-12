// src/App.tsx
import React, { useCallback, useState, useMemo, useEffect, useRef } from 'react';
import { useInvoiceContext } from './context/InvoiceContext';
import { useInvoiceManager } from './hooks/useInvoiceManager';
import { Banknote } from 'lucide-react';
import { Step1SelectDeudas } from './components/Step1SelectDeudas';
import { Step0BankSelection } from "./components/Step0BankSelection";
import { Step2ReviewPayment } from './components/Step2ReviewPayment';  // <---- ENSURE THIS IS CORRECT (Named or Default import)
import { Step3ConfirmPayment } from './components/Step3ConfirmPayment';
import { Step4Complete } from './components/Step4Complete';
import { InvoiceProvider } from './context/InvoiceContext';
import { searchClient, fetchInvoicesFromApi } from "./api/apiService";
import type { Bank } from './types/invoice';
import { Step5Validating } from './components/Step5Validating';
import {ArrowLeft} from "lucide-react";
import Modal from "./components/Modal"; // Import the Modal component

function App() {
    const key = useMemo(() => Math.random(), [])

    return (
        <InvoiceProvider key={key}>
            <AppContent />
        </InvoiceProvider>
    );
}

function AppContent() {
    const {
        currentStep,
        setCurrentStep,
        selectedBank,
        invoiceContext,
        hasInvoices,
        setSelectedBank,
        cedula,
        setCedula,
        availableBanks,
        setAvailableBanks,
        banksLoaded,
        setBanksLoaded,
        apiError,
        setApiError,
        bankDetails,
        setBankDetails,
        selectedInvoiceIds,
        setSelectedInvoiceIds,
        paymentSummary,
        setPaymentSummary,
        clientData,
        setClientData,
        setShowModalNoDebts,
        updatePaymentSummary,
        fetchInvoices,
        invoices,
        setInvoices, // <-- Add this line
        isLoadingInvoices,
        isBankDetailsLoading,
        pushReferenceValidationResult,
        paymentCreationResult,
        handleStartOver,
        handleBack,
    } = useInvoiceContext();

    const {
        filteredAndSortedInvoices,
        searchTerm,
        statusFilter,
        sortBy,
        sortOrder,
        handleInvoiceSelection,
        setSearchTerm,
        setStatusFilter,
        setSortBy,
        setSortOrder,
    } = useInvoiceManager(invoices);

    const [cedulaType, setCedulaType] = useState('V');
    const [cedulaNumber, setCedulaNumber] = useState('');
    const [localCedula, setLocalCedula] = useState('');
    const [isCedulaRequiredModalOpen, setIsCedulaRequiredModalOpen] = useState(false); // Modal state
    const [showModal, setShowModal] = useState(false)

    //MODAL MESSAGE
    const [modalMessage, setModalMessage] = useState('')
    const [modalTitle, setModalTitle] = useState('')
    const [isNoDebtsModalOpen, setIsNoDebtsModalOpen] = useState(false); // No debts Modal state
    const [isClientNotFoundModalOpen, setIsClientNotFoundModalOpen] = useState(false); // Client not found Modal state

    const hasSelectedInvoices = selectedInvoiceIds.size > 0;

    const handleNext = useCallback(() => {
        const hasSelected = selectedInvoiceIds.size > 0

        if (currentStep === 1 && !hasSelected) {
            alert("Por favor, seleccione al menos una deuda antes de continuar.");
            return;
        }
        setCurrentStep(Math.min(currentStep + 1, 4));

    }, [currentStep, setCurrentStep, selectedInvoiceIds]);

    const handleConfirmPayment = useCallback(() => {
        setCurrentStep(4);
    }, [setCurrentStep]);

    const handleCedulaNumberChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        // Allow only numbers
        if (/^\d*$/.test(value)) {
            setCedulaNumber(value);
        }
    }, [setCedulaNumber]);


    // Helper function to promisify setCedula
    const updateCedula = (newCedula: string): Promise<void> => {
        return new Promise((resolve) => {
            setCedula(newCedula);
            resolve();
        });
    };

    const handleSearchBanks = useCallback(async () => {
        //setInvoices([]); // Remove this line
        if (cedulaType && cedulaNumber) {
            const fullCedula = cedulaType + cedulaNumber;
            await updateCedula(fullCedula); //AWAIT

            //setCedula(fullCedula); //Replaced setCedula with updateCedula!
            setLocalCedula(fullCedula)

            setApiError(null);
            try {
                const apiUrl = import.meta.env.VITE_API_URL;
                const apiToken = import.meta.env.VITE_API_TOKEN;

                const clientResponse = await searchClient(fullCedula, apiToken);

                if (clientResponse.status && clientResponse.cliente) {
                    setClientData(clientResponse);
                    const clientId = clientResponse.cliente.id.toString();
                    const invoices = await fetchInvoicesFromApi(fullCedula, apiToken);
                    setInvoices(invoices);


                    // Check if there are no debts after fetching invoices
                    if (invoices.length === 0) {
                        setShowModal(true);
                        setModalTitle('¡Felicidades!');
                        setModalMessage('No encontramos deudas pendientes. ¡Gracias por estar al día con tus pagos!');
                        return;
                    }

                    // If invoices exist, proceed to step 1
                    setCurrentStep(1);
                    //console.log('step1');
                } else {
                    // Customer not found
                    setIsClientNotFoundModalOpen(true);
                    //setApiError(clientResponse.message || "Cliente no encontrado.");
                    setAvailableBanks([]);
                    setBanksLoaded(false);
                    setSelectedBank(null);
                }
            } catch (error: any) {
                console.error("Error fetching banks:", error);
                setApiError(error.message || "Error al obtener los bancos.");
                setAvailableBanks([]);
                setBanksLoaded(false);
                setSelectedBank(null);
            }
        } else {
             setIsCedulaRequiredModalOpen(true)
        }
    }, [cedulaType, cedulaNumber, setAvailableBanks, setApiError, setBanksLoaded, setCurrentStep, setSelectedBank, setClientData, fetchInvoices, setCedula, setShowModal, setModalTitle, setModalMessage, invoices]);

    useEffect(() => {
        if (pushReferenceValidationResult && pushReferenceValidationResult.status) {
            setCurrentStep(5);
        }
    }, [pushReferenceValidationResult, setCurrentStep]);

        useEffect(() => {
        if (paymentCreationResult && paymentCreationResult.status) {
           setCurrentStep(6);
        }
    }, [paymentCreationResult, setCurrentStep]);

    let content;

    const renderBackButton = () => {
        if (currentStep > 0 && currentStep < 3 || currentStep === 4) {
            return (
                <div className="flex justify-start pt-2">

                    <button
                        onClick={() => {
                          handleBack();
                          setCedulaType('V');
                          setCedulaNumber('');
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors mt-4"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Volver</span>
                    </button>
                    </div>
            );
        }
        return null;
    };

    switch (currentStep) {
        case 0:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <div className="mb-4 md:mb-6">
                        <label htmlFor="cedula" className="block text-gray-700 text-sm font-bold mb-2">
                             Cédula:
                        </label>
                        <div className="flex flex-col md:flex-row  space-y-2 md:space-y-0 md:space-x-2">
                            <select
                                value={cedulaType}
                                onChange={(e) => setCedulaType(e.target.value)}
                                className="shadow appearance-none border rounded w-1/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                <option value="V">V</option>
                                <option value="E">E</option>
                                <option value="J">J</option>
                                <option value="G">G</option>
                            </select>
                            <input
                                type="text"
                                id="cedula"
                                value={cedulaNumber}
                                onChange={handleCedulaNumberChange}
                                className="shadow appearance-none border rounded w-3/4 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                placeholder="Ingresa tu cédula"
                            />
                            <button
                                onClick={handleSearchBanks}
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-gray-500"
                                type="button"
                            >
                                Buscar
                            </button>
                        </div>

                        {apiError && (
                            <div className="mt-4 text-red-500">
                                Error: {apiError}
                            </div>
                        )}
                    </div>

                </div>
            );
            break;
        case 1:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <Step1SelectDeudas
                        key={cedula} //Force Re-render
                        invoices={filteredAndSortedInvoices}
                        searchTerm={searchTerm}
                        statusFilter={statusFilter}
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        onSearchChange={setSearchTerm}
                        onStatusFilterChange={setStatusFilter}
                        onSortChange={setSortBy as (sortBy: "dueDate" | "amount" | "supplier") => void}
                        onSortOrderChange={setSortOrder}
                    />

                </div>
            );
            break;
        case 2:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    {banksLoaded && availableBanks.length > 0 ? (
                        <Step0BankSelection />
                    ) : (
                        <p>Cargando bancos disponibles...</p>
                    )}

                </div>
            );
            break;
        case 3:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <Step2ReviewPayment  //  <---- Make SURE THIS IS THE CORRECT IMPORT
                        summary={paymentSummary}
                    />
                </div>
            );
            break;
        case 4:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <Step3ConfirmPayment
                        summary={paymentSummary}
                    />

                </div>
            );
            break;
        case 5:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <Step5Validating />

                </div>
            );
            break;
         case 6:
                content = (
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <Step4Complete
                        summary={paymentSummary}
                        onStartOver={() => {
                            handleStartOver();
                             setCedulaType('V');
                             setCedulaNumber('');
                        }}
                    />
                  </div>
                 );
              break;
        default:
            content = (
                <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 md:p-8">
                    <p>Página no encontrada</p>
                </div>
            );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center">
             {/* Required Cedula Modal */}
            <Modal
                isOpen={isCedulaRequiredModalOpen}
                onClose={() => setIsCedulaRequiredModalOpen(false)}
                title="Cedula Requerida"
                message="Por favor, ingrese su número de cédula para continuar."
            />
            {showModal && (

                <Modal

                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    title={modalTitle}
                    message={modalMessage}
                />
            )}
            <Modal
                isOpen={isNoDebtsModalOpen}
                onClose={() => setIsNoDebtsModalOpen(false)}
                title="¡Felicidades!"
                message="No encontramos deudas pendientes. ¡Gracias por estar al día con tus pagos!"
            />
             {/* Client Not Found Modal */}
             <Modal
                isOpen={isClientNotFoundModalOpen}
                onClose={() => setIsClientNotFoundModalOpen(false)}
                title="Cliente No Encontrado"
                message="No se encontró información para la cédula ingresada. Por favor, verifique el número e intente nuevamente."
            />

            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center space-x-3 mb-4">
                        <div className="bg-blue-600 p-3 rounded-full">
                            <Banknote className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Sistema de Pagos de Deudas
                        </h1>
                    </div>
                </div>

                {content}
                {renderBackButton()}
            </div>
        </div>
    );
}

export default App;