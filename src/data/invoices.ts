// src/data/invoices.ts
import { Invoice } from '../types/invoice';

export const mockInvoices: Invoice[] = [
  {
    id: '1',
    invoiceNumber: 'INV-2024-001',
    supplier: 'Proveedor Tecnológico S.A.',
    dueDate: '2024-01-15',
    amount: 15420.50,
    status: 'overdue',
    description: 'Equipos de cómputo y software',
    category: 'Tecnología'
  },
  {
    id: '2',
    invoiceNumber: 'INV-2024-002',
    supplier: 'Materiales Industriales Ltda.',
    dueDate: '2024-01-20',
    amount: 8750.25,
    status: 'pending',
    description: 'Materiales de construcción',
    category: 'Materiales'
  },
  {
    id: '3',
    invoiceNumber: 'INV-2024-003',
    supplier: 'Servicios Profesionales Inc.',
    dueDate: '2024-01-25',
    amount: 12300.00,
    status: 'pending',
    description: 'Consultoría y servicios profesionales',
    category: 'Servicios'
  },
  {
    id: '4',
    invoiceNumber: 'INV-2024-004',
    supplier: 'Distribuidora ABC',
    dueDate: '2024-01-10',
    amount: 5680.75,
    status: 'overdue',
    description: 'Productos para oficina',
    category: 'Oficina'
  },
  {
    id: '5',
    invoiceNumber: 'INV-2024-005',
    supplier: 'Transporte y Logística',
    dueDate: '2024-01-30',
    amount: 3250.00,
    status: 'pending',
    description: 'Servicios de transporte',
    category: 'Logística'
  },
  {
    id: '6',
    invoiceNumber: 'INV-2024-006',
    supplier: 'Energía Renovable S.A.',
    dueDate: '2024-02-05',
    amount: 18500.00,
    status: 'pending',
    description: 'Instalación de paneles solares',
    category: 'Energía'
  },
  {
    id: '7',
    invoiceNumber: 'INV-2024-007',
    supplier: 'Mantenimiento Integral',
    dueDate: '2024-01-18',
    amount: 4200.30,
    status: 'overdue',
    description: 'Mantenimiento de equipos',
    category: 'Mantenimiento'
  },
  {
    id: '8',
    invoiceNumber: 'INV-2024-008',
    supplier: 'Telecomunicaciones Global',
    dueDate: '2024-02-01',
    amount: 9850.60,
    status: 'pending',
    description: 'Servicios de telecomunicaciones',
    category: 'Telecomunicaciones'
  }
];