import React from 'react';
import { SearchFilters } from '../types';
import { Search, Map } from 'lucide-react';

interface FilterPanelProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  isLoading: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, onSearch, isLoading }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Niche Input - Larger */}
        <div className="lg:col-span-1">
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nicho / Rubro</label>
          <div className="relative">
            <Search className="absolute left-3 top-3 text-wc-purple" size={18} />
            <input 
              type="text" 
              name="niche"
              value={filters.niche}
              onChange={handleChange}
              placeholder="Ej: Dentistas, Pizzería"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-purple focus:ring-2 focus:ring-wc-purple/20 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Location Filters */}
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">País</label>
          <input 
            type="text" 
            name="country"
            value={filters.country}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/10 outline-none text-sm bg-slate-50 focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Estado</label>
          <input 
            type="text" 
            name="state"
            value={filters.state}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/10 outline-none text-sm bg-slate-50 focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Municipio</label>
          <input 
            type="text" 
            name="city"
            value={filters.city}
            onChange={handleChange}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-blue focus:ring-2 focus:ring-wc-blue/10 outline-none text-sm bg-slate-50 focus:bg-white transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Colonia</label>
          <div className="relative">
            <Map className="absolute right-3 top-3 text-slate-400" size={16} />
            <input 
              type="text" 
              name="colonia"
              value={filters.colonia}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-wc-green focus:ring-2 focus:ring-wc-green/20 outline-none text-sm font-medium transition-all"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={onSearch}
          disabled={isLoading || !filters.niche}
          className={`
            px-8 py-3 rounded-xl font-bold text-white shadow-lg shadow-wc-blue/30
            flex items-center gap-2 transition-all transform active:scale-95
            ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-wc-gradient hover:opacity-90'}
          `}
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              <span>Extrayendo Leads...</span>
            </>
          ) : (
            <>
              <Search size={18} />
              <span>Buscar Leads</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};