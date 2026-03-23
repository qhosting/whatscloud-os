import React, { useState } from 'react';
import { SearchFilters } from '../types';
import { Search, Sparkles, Wand2, Lightbulb } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface FilterPanelProps {
  filters: SearchFilters;
  setFilters: React.Dispatch<React.SetStateAction<SearchFilters>>;
  onSearch: () => void;
  isLoading: boolean;
  isCompact?: boolean;
  businessProfile?: any;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({ filters, setFilters, onSearch, isLoading, isCompact, businessProfile }) => {
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSuggest = async () => {
    if (!businessProfile?.businessNiche) {
        alert("Primero configura tu Perfil de Negocio en el Dashboard para recibir sugerencias inteligentes.");
        return;
    }
    setIsSuggesting(true);
    try {
        const results = await geminiService.suggestSearchQueries(businessProfile);
        setSuggestions(results);
    } catch (e) {
        console.error(e);
    } finally {
        setIsSuggesting(false);
    }
  };

  const applySuggestion = (s: any) => {
    setFilters(prev => ({ ...prev, niche: s.niche, city: s.city }));
    setSuggestions([]);
  };

  return (
    <div className={`bg-white transition-all duration-500 relative z-10 ${isCompact ? 'p-3 rounded-xl border border-slate-200 shadow-sm mb-4' : 'p-6 rounded-2xl shadow-sm border border-slate-100 mb-6'}`}>
      <div className={`flex flex-col ${isCompact ? 'lg:flex-row items-center gap-3' : 'gap-4'}`}>
        
        <div className={`grid w-full ${isCompact ? 'grid-cols-2 md:grid-cols-5 gap-2 flex-1' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4'}`}>
          <div className={`${isCompact ? 'col-span-2 md:col-span-1' : 'lg:col-span-1'}`}>
            {!isCompact && (
                <div className="flex justify-between items-end mb-1">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest leading-none">Nicho / Rubro</label>
                    <button 
                        onClick={handleSuggest}
                        disabled={isSuggesting}
                        className="text-[9px] font-black text-wc-blue flex items-center gap-1 hover:underline disabled:opacity-50"
                    >
                        {isSuggesting ? <span className="animate-spin">◌</span> : <Sparkles size={10} />} SUGERIR CON AI
                    </button>
                </div>
            )}
            <div className="relative">
              <Search className={`absolute left-3 ${isCompact ? 'top-2.5' : 'top-3'} text-wc-purple`} size={16} />
              <input 
                type="text" name="niche" value={filters.niche} onChange={handleChange} placeholder={isCompact ? "Nicho..." : "Ej: Dentistas, Pizzería"}
                className={`w-full pl-9 pr-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-purple focus:ring-2 focus:ring-wc-purple/20 outline-none font-medium transition-all`}
              />
            </div>
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">País</label>}
            <input type="text" name="country" value={filters.country} onChange={handleChange} placeholder="País" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Estado</label>}
            <input type="text" name="state" value={filters.state} onChange={handleChange} placeholder="Estado" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Municipio</label>}
            <input type="text" name="city" value={filters.city} onChange={handleChange} placeholder="Ciudad" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm'} border border-slate-200 focus:border-wc-blue outline-none bg-slate-50 focus:bg-white transition-all`} />
          </div>
          <div>
            {!isCompact && <label className="block text-xs font-black text-slate-500 mb-1 uppercase tracking-widest">Cantidad</label>}
            <input type="number" name="limit" value={filters.limit} onChange={handleChange} min="1" max="100" placeholder="Max" className={`w-full px-3 ${isCompact ? 'py-2 rounded-lg text-xs' : 'py-2.5 rounded-xl text-sm font-medium'} border border-slate-200 focus:border-wc-blue outline-none transition-all`} />
          </div>
        </div>

        <div className={`flex sm:flex-row justify-end items-end gap-2 ${isCompact ? 'w-full lg:w-auto shrink-0' : 'mt-4 w-full'}`}>
          {isCompact && (
              <button 
                  onClick={handleSuggest}
                  disabled={isSuggesting}
                  className="bg-slate-100 p-2 rounded-lg text-slate-600 hover:bg-wc-blue/10 hover:text-wc-blue transition-all disabled:opacity-50"
                  title="Sugerir con AI"
              >
                  {isSuggesting ? <span className="animate-spin block">◌</span> : <Sparkles size={16} />}
              </button>
          )}
          <button
            onClick={onSearch}
            disabled={isLoading || !filters.niche}
            className={`
              w-full sm:w-auto font-black text-white flex items-center justify-center transition-all transform active:scale-95
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

      {/* SUGGESTIONS POPUP */}
      {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5"><Wand2 size={12} className="text-wc-blue" /> Sugerencias Estratégicas AI</h4>
                  <button onClick={() => setSuggestions([])} className="text-slate-400 hover:text-slate-600 font-bold text-xs">X</button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {suggestions.map((s, idx) => (
                      <button 
                        key={idx}
                        onClick={() => applySuggestion(s)}
                        className="text-left p-3 rounded-xl border border-slate-100 hover:border-wc-blue hover:bg-wc-blue/5 transition-all group"
                      >
                          <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-black text-slate-900 group-hover:text-wc-blue">{s.niche}</span>
                              <span className="text-[10px] text-slate-400 font-bold px-1.5 py-0.5 bg-slate-50 rounded italic">{s.city}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-tight flex items-start gap-1">
                              <Lightbulb size={10} className="shrink-0 text-yellow-500 mt-0.5" />
                              {s.reason}
                          </p>
                      </button>
                  ))}
              </div>
          </div>
      )}
    </div>
  );
};