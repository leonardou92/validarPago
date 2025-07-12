import { Bank } from '../types/invoice';

export const availableBanks: Bank[] = [
  {
    id: 'bdv',
    name: 'Banco de Venezuela',
    shortName: 'BDV',
    logo: '🏦',
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'bnc',
    name: 'Banco Nacional de Crédito',
    shortName: 'BNC',
    logo: '🏛️',
    color: 'from-blue-500 to-blue-600'
  }
];