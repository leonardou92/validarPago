// src/components/Step0BankSelection.tsx
import React from 'react';
import { Bank } from '../types/invoice';
import { Building2, ArrowRight, CreditCard } from 'lucide-react';
import {useInvoiceContext} from "../context/InvoiceContext";

interface Step0Props {
  //banks: Bank[]; // REMOVED
  //selectedBank: Bank | null; // REMOVED
  //onBankSelect: (bank: Bank) => void; // REMOVED
  //onNext: () => void; // REMOVED
}

export const Step0BankSelection: React.FC<Step0Props> = () => {
  const { availableBanks, handleBankSelection } = useInvoiceContext();

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Seleccionar Banco
        </h3>
        <p className="text-gray-600">
          Elige el banco desde el cual realizarás los pagos de las facturas.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-purple-100 p-3 rounded-full">
            <Building2 className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900">
              Bancos Disponibles
            </h4>
            <p className="text-sm text-gray-600">
              Selecciona tu banco para continuar con el proceso de pago
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {availableBanks && availableBanks.map((bank) => (
            <div
              key={bank.payment_method_id}
              onClick={() => {
                //console.log("Bank Selected:", bank);
                //console.log("Bank ID Selected:", bank.payment_method_id);
                //console.log("Bank payment_method_id:", bank.payment_method_id);  // <-- Add this line
                handleBankSelection(bank);
              }}
              className={`
                relative p-6 rounded-xl border-2 cursor-pointer transition-all duration-300
                border-gray-200 bg-white hover:border-purple-300 hover:shadow-md
              `}
            >
              <div className="flex items-center space-x-4">
                <div className={`
                  w-16 h-16 rounded-full flex items-center justify-center text-3xl
                  bg-gradient-to-br ${bank.color} shadow-lg
                `}>
                  {bank.logo}
                </div>

                <div className="flex-1">
                  <h5 className="text-xl font-bold text-gray-900 mb-1">
                    {bank.name}
                  </h5>
                  <p className="text-sm text-gray-600 mb-2">
                    {bank.shortName}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Step0BankSelection;