// src/components/Modal.tsx
import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 overflow-y-auto h-full w-full flex items-center justify-center z-50">
            <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white transform transition-all duration-300 ease-out scale-0 opacity-0"
                 style={{ animation: 'modalOpen 0.3s ease-out forwards' }}>
                <div className="mt-3 text-center">
                    <div className="flex justify-end">
                        <button onClick={onClose}>
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
                    <div className="mt-2">
                        <p className="text-sm text-gray-500">
                            {message}
                        </p>
                    </div>
                    <div className="items-center px-4 py-3">
                        <button
                            className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                            onClick={onClose}
                        >
                            Aceptar
                        </button>
                    </div>
                </div>
            </div>
            <style>
                {`
                @keyframes modalOpen {
                    from {
                        transform: scale(0);
                        opacity: 0;
                    }
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                `}
            </style>
        </div>
    );
};

export default Modal;