import React from 'react';
import { SearchFilters } from '../types';
import { Search, Map } from 'lucide-react';

interface FilterPanelProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  isLoading: boolean;
  isCompact?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, onSearch, isLoading, isCompact }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className={`bg-white transition-all duration-500 relative z-10 ${isCompact ? 'p-3 rounded-xl border border-slate-200 shadow-sm mb-4' : 'p-6 rounded-2xl shadow-sm border border-slate-100 mb-6'}`}>
      <div className={`flex flex-col ${isCompact ? 'lg:flex-row items-center gap-3' : 'gap-4'}`}>
        
        <div className={`grid w-full ${isCompact ? 'grid-cols-2 md:grid-cols-5 gap-2 flex-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'}`}>
          <div className={`${isCompact ? 'col-span-2 md:col-span-1' : 'lg:col-span-1'}`}>
            {!isCompact && <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Nicho / Rubro</label>}
            <div className="relative">
              <Search className={`absolute left-3 ${isCompact ? 'top-2.5' : 'top-3'} text-wc-purple`} size={16} />
              <input 
                type="text" name="niche" value={filters.niche} onChange={handleChange} placeholder={isCompact ? "Nicho..." : "Ej: Dentistas, Pizzería"}
                className={`w-full pl-9 pr-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-purple focus:ring-2 focus:ring-wc-purple/20 outline-none font-medium transition-all`}
              />
            </div>
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">País</label>}
            <input type="text" name="country" value={filters.country} onChange={handleChange} placeholder="País" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Estado</label>}
            <input type="text" name="state" value={filters.state} onChange={handleChange} placeholder="Estado" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Municipio</label>}
            <input type="text" name="city" value={filters.city} onChange={handleChange} placeholder="Ciudad" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Cantidad</label>}
            <input type="number" name="limit" value={filters.limit} onChange={handleChange} min="1" max="100" placeholder="Max Reqs" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm font-medium'} border border-slate-200 focus:border-wc-blue outline-none transition-all`} />
          </div>
        </div>

        <div className={`flex sm:flex-row justify-end ${isCompact ? 'w-full lg:w-auto shrink-0' : 'mt-4 w-full'}`}>
          <button
            onClick={onSearch}
            disabled={isLoading || !filters.niche}
            className={`
              w-full sm:w-auto font-bold text-white flex items-center justify-center transition-all transform active:scale-95
              ${isCompact ? 'py-2 lg:py-1.5 px-4 rounded-lg text-xs gap-1.5 shadow-sm' : 'px-8 py-3.5 sm:py-3 rounded-xl gap-2 shadow-lg'} shadow-wc-blue/30 
              ${isLoading ? 'bg-slate-300 cursor-not-allowed' : 'bg-wc-gradient hover:opacity-90'}
            `}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
            ) : <Search size={isCompact ? 14 : 18} />}
            <span>{isCompact ? 'Buscar' : 'Buscar Leads'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};