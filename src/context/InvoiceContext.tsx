// src/context/InvoiceContext.tsx
import React, {
    createContext,
    useState,
    useContext,
    useCallback,
    useMemo,
    useEffect,
    useRef
} from 'react';
import { Invoice, Bank, PaymentSummary, ClienteResponse, PushReferenceValidationResponse, PaymentCreationResult } from '../types/invoice';
import { fetchInvoicesFromApi, getBanksFromApi, validatePushReference, createPushPayment } from '../api/apiService';

export interface InvoiceContextProps {
    currentStep: number;
    setCurrentStep: (step: number) => void;
    selectedBank: Bank | null;
    invoiceContext: InvoiceContextProps | undefined,
    hasInvoices : boolean,
    setSelectedBank: (bank: Bank | null) => void;
    cedula: string;
    setCedula: (cedula: string) => void;
    availableBanks: Bank[];
    setAvailableBanks: (banks: Bank[]) => void;
    banksLoaded: boolean;
    setBanksLoaded: (loaded: boolean) => void;
    apiError: string | null;
    setApiError: (error: string | null) => void;
    bankDetails: { message: string; qr_image?: string } | null;
    setBankDetails: (details: { message: string; qr_image?: string } | null) => void;
    selectedInvoiceIds: Set<string>;
    setSelectedInvoiceIds: (ids: Set<string>) => void;
    paymentSummary: PaymentSummary;
    setPaymentSummary: (summary: PaymentSummary) => void;
    clientData: ClienteResponse | null;
    setClientData: (data: ClienteResponse | null) => void;
    updatePaymentSummary: () => void;
    handleInvoiceSelection: (invoiceId: string, isSelected: boolean) => void;
    selectAllInvoices: () => void;
    selectOverdueInvoices: () => void;
    clearSelection: () => void;
    fetchInvoices: (cedula: string, apiToken: string) => Promise<void>;
    invoices: Invoice[];
    setInvoices: (invoices: Invoice[]) => void;
    isLoadingInvoices: boolean; // Add loading state
    fetchBankDetails: (cedula: string, apiToken: string) => Promise<void>;
    isBankDetailsLoading: boolean;
    referenceNumber: string;
    setReferenceNumber: (referenceNumber: string) => void;
    apiToken: string;
    handleBankSelection: (bank: Bank) => void;
    fetchAvailableBanks: (cedula: string, apiToken: string) => Promise<void>;
    isPushReferenceValidating: boolean;
    setIsPushReferenceValidating: (validating: boolean) => void;
    pushReferenceValidationResult: PushReferenceValidationResponse | null;
    setPushReferenceValidationResult: (result: PushReferenceValidationResponse | null) => void;
    startPushReferenceValidation: () => Promise<void>;
    telefono: string;
    setTelefono: (telefono: string) => void;
    createPushPaymentAndProceed: () => Promise<void>;
    paymentCreationResult: PaymentCreationResult | null;
    setShowModalNoDebts : (debts:boolean) => void,
    isManualReference: boolean;
    setIsManualReference: (isManualReference: boolean) => void;
    handleStartOver: () => void;
    handleBack: () => void;
}

const InvoiceContext = createContext<InvoiceContextProps | undefined>(undefined);

export const useInvoiceContext = () => {
    const context = useContext(InvoiceContext);
    if (!context) {
        throw new Error('useInvoiceContext must be used within an InvoiceProvider');
    }
    return context;
};

interface InvoiceProviderProps {
    children: React.ReactNode;
}

export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({ children }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
    const [cedula, setCedula] = useState('');
    const [availableBanks, setAvailableBanks] = useState<Bank[]>([]);
    const [banksLoaded, setBanksLoaded] = useState(false);
    const [apiError, setApiError] = useState<string | null>(null);
    const [bankDetails, setBankDetails] = useState<{ message: string; qr_image?: string } | null>(null);
    const [selectedInvoiceIds, setSelectedInvoiceIds] = useState<Set<string>>(new Set());
    const [clientData, setClientData] = useState<ClienteResponse | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoadingInvoices, setIsLoadingInvoices] = useState(false); // Loading state
    const [hasInvoices, setHasInvoices] = useState(true)
    const [showModalNoDebts, setShowModalNoDebts] = useState(false)

    const [paymentSummary, setPaymentSummary] = useState<PaymentSummary>(
        useMemo(() => ({
            selectedInvoices: [],
            totalAmount: 0,
            overdueCount: 0,
            pendingCount: 0
        }), [])
    );
    const [isBankDetailsLoading, setIsBankDetailsLoading] = useState(false);
    const [referenceNumber, setReferenceNumber] = useState('');
    const apiToken = import.meta.env.VITE_API_TOKEN;
    const [isPushReferenceValidating, setIsPushReferenceValidating] = useState(false);
    const [pushReferenceValidationResult, setPushReferenceValidationResult] = useState<PushReferenceValidationResponse | null>(null);
    const [telefono, setTelefono] = useState('');
    const [paymentCreationResult, setPaymentCreationResult] = useState<PaymentCreationResult | null>(null);
    const [isManualReference, setIsManualReference] = useState(false);

    const validationInterval = useRef<ReturnType<typeof setInterval> | null>(null); // useRef for the interval
    const hasPaymentBeenAttempted = useRef(false);  // <-- NEW FLAG
    const hasPushPaymentBeenCreated = useRef(false); //NEW FLAG

    const updatePaymentSummary = useCallback(() => {
        const selectedInvoices = invoices.filter(invoice => selectedInvoiceIds.has(invoice.id));

        const totalAmount = selectedInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);
        const overdueCount = selectedInvoices.filter(invoice => new Date(invoice.dueDate) < new Date()).length;
        const pendingCount = selectedInvoices.length - overdueCount;

        setPaymentSummary({
            selectedInvoices,
            totalAmount,
            overdueCount,
            pendingCount
        });
    }, [selectedInvoiceIds, setPaymentSummary, invoices]);

    const handleInvoiceSelection = useCallback((invoiceId: string, isSelected: boolean) => {
        setSelectedInvoiceIds(prev => {
            const newSet = new Set(prev);
            if (isSelected) {
                newSet.add(invoiceId);
            } else {
                newSet.delete(invoiceId);
            }
            return newSet;
        });
    }, [setSelectedInvoiceIds]);

    const selectAllInvoices = useCallback(() => {
        setSelectedInvoiceIds(new Set(invoices.map(invoice => invoice.id)));
    }, [invoices, setSelectedInvoiceIds]);

    const selectOverdueInvoices = useCallback(() => {
        const overdueIds = invoices
            .filter(invoice => new Date(invoice.dueDate) < new Date())
            .map(invoice => invoice.id);
        setSelectedInvoiceIds(new Set(overdueIds));
    }, [invoices, setSelectedInvoiceIds]);

    const clearSelection = useCallback(() => {
        setSelectedInvoiceIds(new Set());
    }, [setSelectedInvoiceIds]);

    const fetchInvoices = useCallback(async (cedula: string, apiToken: string) => {
        setInvoices([]); // Clear invoices before fetching!
        setIsLoadingInvoices(true);
        try {
            const invoices = await fetchInvoicesFromApi(cedula, apiToken);
            setInvoices(invoices);
            setApiError(null);
        } catch (error: any) {
            setInvoices([]);
            setApiError(error.message || 'Error fetching invoices');
            console.error("Error fetching invoices:", error);
        } finally {
            setIsLoadingInvoices(false);
        }
    }, [setInvoices, setApiError, setIsLoadingInvoices]);

    const fetchBankDetails = useCallback(async (cedula: string, apiToken: string) => {
        setIsBankDetailsLoading(true);
        try {
            const banks = await getBanksFromApi(cedula, apiToken);
            if (banks && banks.length > 0) {
                setBankDetails({ message: banks[0].message || '', qr_image: banks[0].qr_image });
                setApiError(null);
            } else {
                setBankDetails({ message: "No bank details found.", qr_image: "" });
                setApiError("No bank details found.");
            }
        } catch (error: any) {
            setApiError(error.message || 'Error fetching bank details');
            setBankDetails(null);
            console.error("Error fetching bank details:", error);
        } finally {
            setIsBankDetailsLoading(false);
        }
    }, [setBankDetails, setApiError]);

    const handleBankSelection = useCallback((bank: Bank) => {
        ////console.log("handleBankSelection triggered with bank:", bank);
        ////console.log("Selected bank ID: ", bank.id);

        setSelectedBank(bank);
        setBankDetails({ message: bank.message || '', qr_image: bank.qr_image });
        setCurrentStep(3);

    }, [setSelectedBank, setCurrentStep, setBankDetails]);

    const fetchAvailableBanks = useCallback(async (cedula: string, apiToken: string) => {
        setBanksLoaded(false);
        try {
            const banksFromApiResult = await getBanksFromApi(cedula, apiToken);
            setAvailableBanks(banksFromApiResult);
            ////console.log("Available Banks:", banksFromApiResult);
            setBanksLoaded(true);
            setApiError(null);
        } catch (error: any) {
            console.error("Error fetching banks:", error);
            setApiError(error.message || "Error al obtener los bancos.");
            setAvailableBanks([]);
            setBanksLoaded(false);
            setSelectedBank(null);
        }
    }, [setAvailableBanks, setApiError, setBanksLoaded, setSelectedBank]);

   const startPushReferenceValidation = useCallback(async () => {
          ////console.log("startPushReferenceValidation triggered");

          if (hasPaymentBeenAttempted.current) {
             ////console.log("Payment has been attempted, skipping Push Reference validation");
             return;
          }

          if (isManualReference) {
              ////console.log("Manual reference is true, not validating Push Reference");
              return;
          }

          if (!selectedBank || !cedula || !telefono) {
              console.warn("Missing required data for push reference validation.");
              return;
          }

          setIsPushReferenceValidating(true);
          setPushReferenceValidationResult(null);

          try {
              const monto = paymentSummary.totalAmount.toString();
              const banco = selectedBank.bank_code;

              // Create a Date object for the current date in the local timezone
              const now = new Date();
              const year = now.getFullYear();
              const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
              const day = String(now.getDate()).padStart(2, '0');
              const fecha = `${year}-${month}-${day}`;

              const validationResult = await validatePushReference(monto, banco, fecha, cedula, telefono, apiToken);
              setPushReferenceValidationResult(validationResult);
              //console.log("Push reference validation result:", validationResult);
          } catch (error: any) {
              console.error("Error in push reference validation:", error);
              setPushReferenceValidationResult({ status: false, message: `Validation failed: ${error.message}` });
          }
      }, [selectedBank, cedula, telefono, paymentSummary.totalAmount, setPushReferenceValidationResult, setIsPushReferenceValidating, apiToken, isManualReference]);

    useEffect(() => {
         ////console.log("useEffect for push reference validation triggered");

         // Clear any existing interval first
         if (validationInterval.current) {
             clearInterval(validationInterval.current);
             validationInterval.current = null;
         }

        if (isPushReferenceValidating && currentStep === 3 && !isManualReference && !hasPaymentBeenAttempted.current) {
            validationInterval.current = setInterval(async () => {
                ////console.log("Push reference validation interval running...");
                if (selectedBank && cedula && telefono) {
                    ////console.log("All required data present, attempting push reference validation...");
                    try {
                        const monto = paymentSummary.totalAmount.toString();
                        const banco = selectedBank.bank_code;

                        // Get the current date in the local timezone
                        const now = new Date();
                        const year = now.getFullYear();
                        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
                        const day = String(now.getDate()).padStart(2, '0');
                        const fecha = `${year}-${month}-${day}`;

                        const validationResult = await validatePushReference(monto, banco, fecha, cedula, telefono, apiToken);
                        ////console.log("Push reference validation result:", validationResult);
                        setPushReferenceValidationResult(validationResult);

                    } catch (error: any) {
                        console.error("Error during push reference validation:", error);
                        setIsPushReferenceValidating(false);  // <-- STOP VALIDATION HERE
                         setPushReferenceValidationResult({ status: false, message: `Validation failed: ${error.message}` });
                         if (validationInterval.current) {
                             clearInterval(validationInterval.current);
                             validationInterval.current = null;
                         }
                        ////console.log("Push reference validation failed with error, stopping interval");
                    }
                } else {
                    console.warn("Missing data for push reference validation");
                    setIsPushReferenceValidating(false);  // <-- STOP VALIDATION HERE
                    setPushReferenceValidationResult({ status: false, message: "Missing data for push reference validation" });

                    if (validationInterval.current) {
                        clearInterval(validationInterval.current);
                        validationInterval.current = null;
                    }

                    //console.log("Missing data, stopping push reference validation interval");
                }
            }, 2000);
        }
         return () => {
               //console.log("useEffect cleanup triggered");
               if (validationInterval.current) {
                   clearInterval(validationInterval.current);
                   validationInterval.current = null;
                   //console.log("Clearing push reference validation interval");
               }
           };

    }, [isPushReferenceValidating, selectedBank, cedula, telefono, paymentSummary.totalAmount, apiToken, setPushReferenceValidationResult, setIsPushReferenceValidating, currentStep, isManualReference]);

   // useEffect to move to step 5 *after* validation succeeds and only if we haven't created the payment yet
   useEffect(() => {
       if (pushReferenceValidationResult && pushReferenceValidationResult.status && pushReferenceValidationResult.id && !hasPushPaymentBeenCreated.current) {
           setIsPushReferenceValidating(false);
           setCurrentStep(5); // Move to validating screen first
           //console.log("Moving to validating screen (Step 5) after push reference validation.");

           // **Crucial Delay:** Wait 5 seconds *before* creating the payment and moving to step 6
           setTimeout(() => {
               //console.log("Timeout complete, now creating push payment...");
               createPushPaymentAndProceed();
           }, 3000);
       } else if (pushReferenceValidationResult && !pushReferenceValidationResult.status) {
           //console.log("pushReferenceValidationResult FAIL");
       }
   }, [pushReferenceValidationResult, createPushPayment, setCurrentStep]);

     const createPushPaymentAndProceed = useCallback(async () => {
        //console.log("createPushPaymentAndProceed triggered");

        hasPaymentBeenAttempted.current = true;
        hasPushPaymentBeenCreated.current = true;

        setIsPushReferenceValidating(false);

        if (validationInterval.current) {
            clearInterval(validationInterval.current);
            validationInterval.current = null;
        }

        if (!pushReferenceValidationResult?.id) {
            console.error("idImportacion is missing or validation failed. Cannot proceed.");
            setApiError("idImportacion is missing or validation failed. Cannot proceed.");
            setPaymentCreationResult({ status: false, message: "idImportacion is missing or validation failed." });
            return;
        }

        if (!clientData?.cliente?.id) {
            console.error("Client ID is missing.");
            setApiError("Cliente ID is missing. Please try again.");
            setPaymentCreationResult({ status: false, message: "Cliente ID is missing." });
            return;
        }

        if (!selectedBank?.id) {
            console.error("Selected Bank ID is missing.");
            setApiError("Cliente ID is missing. Please select a bank.");
            setPaymentCreationResult({ status: false, message: "Selected Bank ID is missing." });
            return;
        }

        setPaymentCreationResult(null);
        try {

            if (!clientData?.cliente?.id) {
                console.error("Client ID is missing");
                setPaymentCreationResult({ status: false, message: "Client ID is missing" });
                return;
            }

            const monto = paymentSummary.totalAmount;

            if (!availableBanks || availableBanks.length === 0) {
                console.error("Available banks are empty!  Cannot find payment method.");
                setApiError("Available banks are not loaded.  Please try again.");
                setPaymentCreationResult({ status: false, message: "Available banks are not loaded." });
                return;
            }

            const paymentMethod = availableBanks.find(bank => bank.id === selectedBank.id);

            if (!paymentMethod) {
                console.error("Payment method not found for selected bank!");
                setApiError("Payment method not found. Please select a different bank.");
                setPaymentCreationResult({ status: false, message: "Payment method not found." });
                return;
            }

            if (!paymentMethod?.payment_method_id) {
                console.error("payment_method_id is missing for selected bank.  This is critical!");
                setPaymentCreationResult({ status: false, message: "payment_method_id is missing for selected bank." });
                return;
            }

            const idFormaPago = paymentMethod.payment_method_id;
            //Get the current data and format it as YYYY-MM-DD
            const now = new Date()
            const year = now.getFullYear()
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const fecha = `${year}-${month}-${day}`

            const cedula = clientData.cliente.rif_fiscal;
            const idCliente = clientData.cliente.id;

            // Get tasaCambio from invoices
            const tasaCambio = paymentSummary.selectedInvoices.length > 0 ? paymentSummary.selectedInvoices[0].tasaCambio : 0;
            const idImportacion = pushReferenceValidationResult.id;

            // Collect invoice IDs
            const invoiceIds = paymentSummary.selectedInvoices.map(invoice => parseInt(invoice.id));

            //console.log("About to createPushPayment...");
            //console.log("  monto:", monto);
            //console.log("  idFormaPago:", idFormaPago);
            //console.log("  fecha:", fecha);
            //console.log("  cedula:", cedula);
            //console.log("  idCliente:", idCliente);
            //console.log("  tasaCambio:", tasaCambio);
            //console.log("  idImportacion:", idImportacion);
            //console.log(" invoiceIds:", invoiceIds);
            //console.log("  apiToken:", apiToken);
            //console.log("  Selected Bank (right before createPushPayment):", selectedBank);
            //console.log("  Payment Method (right before createPushPayment):", paymentMethod);

            const paymentResult = await createPushPayment(monto, idFormaPago, fecha, cedula, idCliente, tasaCambio, idImportacion, invoiceIds, apiToken);

            //console.log("createPushPayment API Response:", paymentResult);
            setPaymentCreationResult(paymentResult);

            if (paymentResult.status) {
                //console.log("Payment created successfully, moving to Step 4");
            } else {
                console.error("Payment creation failed:", paymentResult.message);
                setApiError(paymentResult.message || "Error creating push payment.");
                setCurrentStep(3);

                setIsPushReferenceValidating(false);
                setPushReferenceValidationResult(null);

                if (validationInterval.current) {
                    clearInterval(validationInterval.current);
                    validationInterval.current = null;
                }
            }

        } catch (error: any) {
            console.error("Error creating push payment:", error);
            setApiError(error.message || "Error creating push payment.");
            setPaymentCreationResult({ status: false, message: error.message || "Error creating push payment." });
            setCurrentStep(4);
        }
    }, [paymentSummary, clientData, apiToken, setCurrentStep, setPaymentCreationResult, pushReferenceValidationResult, availableBanks, selectedBank, setIsPushReferenceValidating, setPushReferenceValidationResult]);

    const handleStartOver = useCallback(() => {
        setCurrentStep(0);
        setSelectedBank(null);
        setCedula('');
        setAvailableBanks([]);
        setBanksLoaded(false);
        setApiError(null);
        setBankDetails(null);
        setClientData(null);
        setSelectedInvoiceIds(new Set());
        setPaymentSummary({
            selectedInvoices: [],
            totalAmount: 0,
            overdueCount: 0,
            pendingCount: 0
        });
        setIsPushReferenceValidating(false);
        setPushReferenceValidationResult(null);
        setReferenceNumber('');
        setIsManualReference(false);
        setPaymentCreationResult(null);
        hasPaymentBeenAttempted.current = false;
        hasPushPaymentBeenCreated.current = false;
        setTelefono('');
    }, [setAvailableBanks, setApiError, setBankDetails, setBanksLoaded, setCedula, setCurrentStep, setSelectedBank, setClientData, setSelectedInvoiceIds, setPaymentSummary, setIsPushReferenceValidating, setPushReferenceValidationResult, setReferenceNumber, setIsManualReference, setPaymentCreationResult, setTelefono]);

    const handleBack = useCallback(() => {
        setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
        if (currentStep === 1) {
            setCedula(''); // Clear the cedula when going back to step 0
        }
    }, [setCedula, setCurrentStep, currentStep]);

    const value: InvoiceContextProps = {
        currentStep,
        setCurrentStep,
        selectedBank,
        invoiceContext: undefined,
        hasInvoices: true,
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
        updatePaymentSummary,
        handleInvoiceSelection,
        selectAllInvoices,
        selectOverdueInvoices,
        clearSelection,
        fetchInvoices,
        invoices,
        isLoadingInvoices,
        fetchBankDetails,
        isBankDetailsLoading,
        referenceNumber,
        setReferenceNumber,
        apiToken,
        handleBankSelection,
        fetchAvailableBanks,
        isPushReferenceValidating,
        setIsPushReferenceValidating,
        pushReferenceValidationResult,
        setPushReferenceValidationResult,
        startPushReferenceValidation,
        telefono,
        setTelefono,
        createPushPaymentAndProceed,
        paymentCreationResult,
        setShowModalNoDebts,
        isManualReference,
        setIsManualReference,
        handleStartOver,
        handleBack,
        setInvoices
    };

    return (
        <InvoiceContext.Provider value={value}>
            {children}
        </InvoiceContext.Provider>
    );
}