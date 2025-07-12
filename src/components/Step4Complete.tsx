// src/components/Step4Complete.tsx
import React, { useRef, useState, useEffect } from 'react';
import { PaymentSummary } from '../types/invoice';
import { CheckCircle, Download, Home, Mail } from 'lucide-react';
import { useInvoiceContext } from '../context/InvoiceContext';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';  // Import html2canvas

interface Step4Props {
    summary: PaymentSummary;
    onStartOver: () => void;
}

export const Step4Complete: React.FC<Step4Props> = ({
    summary,
    onStartOver
}) => {
    const { paymentCreationResult, clientData } = useInvoiceContext();
    const componentRef = useRef<HTMLDivElement>(null);
    const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

    const formatCurrency = (amount: number) => {
        const formattedAmount = new Intl.NumberFormat('es-VE', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(amount);
        return `Bs. ${formattedAmount}`;
    };

    const currentDate = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

   const handleDownloadPDF = async () => {
        if (!componentRef.current) return;

        const element = componentRef.current;

        const canvas = await html2canvas(element, {
            useCORS: true,
            scale: 2,
        });
        const data = canvas.toDataURL('image/png');

        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(data);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const marginX = 10;
        const marginY = 10;

        const availableWidth = pdfWidth - 2 * marginX;
        const availableHeight = pdfHeight - 2 * marginY;

        let imageWidth = availableWidth;
        let imageHeight = (imgProps.height * availableWidth) / imgProps.width;

        if (imageHeight > availableHeight) {
            imageHeight = availableHeight;
            imageWidth = (imgProps.width * availableHeight) / imgProps.height;
        }

        const xPos = (pdfWidth - imageWidth) / 2;
        const yPos = (pdfHeight - imageHeight) / 2;

        pdf.addImage(data, 'PNG', xPos, yPos, imageWidth, imageHeight);

        // **Revised: Use a Blob and URL.createObjectURL for better compatibility**
        const pdfOutput = pdf.output('blob');
        const url = URL.createObjectURL(pdfOutput);

        // Create a temporary link element
        const link = document.createElement('a');
        link.href = url;
        link.download = "comprobante_de_pago.pdf"; // Set the file name
        document.body.appendChild(link); // Append to the document

        // Simulate a click on the link
        link.click();

        // Remove the link and revoke the object URL
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };


   return (
     <div className="space-y-6 print:space-y-4" ref={componentRef}>
       {logoDataUrl && (
         <img
           src={logoDataUrl}
           alt="Company Logo"
           className="max-w-[100px] mx-auto"
         />
       )}

       {paymentCreationResult === null ? (
         <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 print:bg-white print:border-black print:rounded-none">
           <div className="text-center">
             <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-10 h-10 text-white animate-spin" />
             </div>
             <h3 className="text-3xl font-bold text-gray-900 mb-2 print:text-black">
               Procesando Pago...
             </h3>
             <p className="text-gray-600 text-lg print:text-black">
               Estamos procesando tu pago. Por favor espera un momento.
             </p>
           </div>
         </div>
       ) : paymentCreationResult.status ? (
         <div className="bg-green-50 border border-green-200 rounded-2xl p-6 print:bg-white print:border-black print:rounded-none">
           <div className="text-center">
             <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-10 h-10 text-white" />
             </div>
             <h3 className="text-3xl font-bold text-gray-900 mb-2 print:text-black">
               ¡Pago Procesado Exitosamente!
             </h3>
           </div>
         </div>
       ) : (
         <div className="bg-red-50 border border-red-200 rounded-2xl p-6 print:bg-white print:border-black print:rounded-none">
           <div className="text-center">
             <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
               <CheckCircle className="w-10 h-10 text-white" />
             </div>
             <h3 className="text-3xl font-bold text-gray-900 mb-2 print:text-black">
               Error al Procesar el Pago
             </h3>
             <p className="text-gray-600 text-lg print:text-black">
               {paymentCreationResult.message}
             </p>
           </div>
         </div>
       )}

       <div className="bg-white rounded-xl border border-gray-200 overflow-hidden print:shadow-none print:border-black print:rounded-none">
         <div className="bg-green-600 px-6 py-4 print:bg-gray-300">
           <h4 className="text-xl font-bold text-white print:text-black">
             Detalles de la Transacción
           </h4>
         </div>

         <div className="p-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
             <div>
               <h5 className="font-semibold text-gray-700 mb-2 print:text-black">Información del Pago</h5>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600 print:text-black">Fecha y Hora:</span>
                   <span className="text-gray-900 print:text-black">{currentDate}</span>
                 </div>
                 <div className="flex justify-between">
                   <span className="text-gray-600 print:text-black">Estado:</span>
                   <span className="text-green-600 font-medium print:text-black">Completado</span>
                 </div>
                 {paymentCreationResult && paymentCreationResult.reference && (
                   <div className="flex justify-between">
                     <span className="text-gray-600 print:text-black">Referencia:</span>
                     <span className="text-gray-900 print:text-black">{paymentCreationResult.reference}</span>
                   </div>
                 )}
               </div>
             </div>

             <div>
               <h5 className="font-semibold text-gray-700 mb-2 print:text-black">Información del Cliente</h5>
               <div className="space-y-2 text-sm">
                 {clientData && clientData.cliente ? (
                   <>
                     <div className="flex justify-between">
                       <span className="text-gray-600 print:text-black">Nombre:</span>
                       <span className="text-gray-900 print:text-black">{clientData.cliente.nombre}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600 print:text-black">Cédula/RIF:</span>
                       <span className="text-gray-900 print:text-black">{clientData.cliente.rif_fiscal}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600 print:text-black">Email:</span>
                       <span className="text-gray-900 print:text-black">{clientData.cliente.email}</span>
                     </div>
                     <div className="flex justify-between">
                       <span className="text-gray-600 print:text-black">Teléfono:</span>
                       <span className="text-gray-900 print:text-black">{clientData.cliente.telefono}</span>
                     </div>
                   </>
                 ) : (
                   <p className="text-gray-500 print:text-black">No hay información del cliente disponible.</p>
                 )}
               </div>
             </div>

             <div>
               <h5 className="font-semibold text-gray-700 mb-2 print:text-black">Resumen del Pago</h5>
               <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                   <span className="text-gray-600 print:text-black">Deudas Pagadas:</span>
                   <span className="text-gray-900 print:text-black">{summary.selectedInvoices.length}</span>
                 </div>

                 <div className="flex justify-between font-semibold">
                   <span className="text-gray-700 print:text-black">Monto Total:</span>
                   <span className="text-green-600 text-lg print:text-black">
                     {formatCurrency(summary.totalAmount)}
                   </span>
                 </div>
               </div>
             </div>
           </div>

            {/*<div className="bg-blue-50 border border-blue-200 rounded-lg p-4 print:hidden">
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
           </div>*/}
         </div>
       </div>

       <div className="flex flex-col sm:flex-row gap-4 pt-6">
         <button
           onClick={handleDownloadPDF}
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