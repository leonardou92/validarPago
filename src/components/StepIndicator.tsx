import React from 'react';
import { Check, Building2, FileText, Eye, CreditCard, CheckCircle } from 'lucide-react';

interface StepIndicatorProps {
    currentStep: number;
    steps: Array<{
        id: number;
        title: string;
        description: string;
        icon: React.ReactNode;
    }>;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Proceso de Pago de Deudas
            </h2>

            <div className="flex items-center justify-between">
                {steps.map((step, index) => (
                    <React.Fragment key={step.id}>
                        <div className="flex flex-col items-center">
                            <div className={`
                w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300
                ${currentStep > step.id
                                    ? 'bg-green-500 text-white shadow-lg'
                                    : currentStep === step.id
                                        ? 'bg-blue-500 text-white shadow-lg animate-pulse'
                                        : 'bg-gray-200 text-gray-400'
                                }
              `}>
                                {currentStep > step.id ? (
                                    <Check className="w-8 h-8" />
                                ) : (
                                    <div className="w-8 h-8">{step.icon}</div>
                                )}
                            </div>

                            <div className="mt-3 text-center">
                                <h3 className={`
                  font-semibold text-sm
                  ${currentStep >= step.id ? 'text-gray-900' : 'text-gray-500'}
                `}>
                                    {step.title}
                                </h3>
                                <p className={`
                  text-xs mt-1 max-w-24
                  ${currentStep >= step.id ? 'text-gray-600' : 'text-gray-400'}
                `}>
                                    {step.description}
                                </p>
                            </div>
                        </div>

                        {index < steps.length - 1 && (
                            <div className={`
                flex-1 h-1 mx-4 rounded transition-all duration-300
                ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}
              `} />
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    );
};