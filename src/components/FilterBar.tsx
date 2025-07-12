// src/components/FilterBar.tsx
import React, { memo } from 'react';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  sortBy: "dueDate" | "amount" | "supplier";
  onSortChange: (sortBy: "dueDate" | "amount" | "supplier") => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
}

const FilterBarComponent: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar por número de factura, proveedor o descripción..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4"> {/* Modified: Added flex-col on small screens */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilterChange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="">Todos los estados</option>
              <option value="pending">Pendientes</option>
              <option value="overdue">Vencidas</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={sortBy}
              onChange={(e) => {
                const value = e.target.value as "dueDate" | "amount" | "supplier";
                onSortChange(value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            >
              <option value="dueDate">Fecha de vencimiento</option>
              <option value="amount">Monto</option>
              <option value="supplier">Proveedor</option>
            </select>
            
            <button
              onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {sortOrder === 'asc' ? <SortAsc className="w-5 h-5" /> : <SortDesc className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const FilterBar = memo(FilterBarComponent, (prevProps, nextProps) => {
  return (
    prevProps.searchTerm === nextProps.searchTerm &&
    prevProps.statusFilter === nextProps.statusFilter &&
    prevProps.sortBy === nextProps.sortBy &&
    prevProps.sortOrder === nextProps.sortOrder
  );
});