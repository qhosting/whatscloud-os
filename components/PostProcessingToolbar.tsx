import React from 'react';
import { Filter, Star, Mail, ArrowUpDown, ChevronDown } from 'lucide-react';

export interface ViewFilters {
  minRating: number;
  requireEmail: boolean;
  sortBy: 'relevance' | 'rating' | 'reviews';
}

interface PostProcessingToolbarProps {
  filters: ViewFilters;
  setFilters: (f: ViewFilters) => void;
  totalResults: number;
  visibleResults: number;
}

export const PostProcessingToolbar: React.FC<PostProcessingToolbarProps> = ({ 
    filters, 
    setFilters, 
    totalResults, 
    visibleResults 
}) => {
  
  return (
    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in duration-500">
       
       {/* LEFT: FILTERS */}
       <div className="flex items-center gap-4 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-semibold pr-2 border-r border-slate-200">
             <Filter size={16} />
             <span>Filtros:</span>
          </div>

          {/* RATING SLIDER */}
          <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
             <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                Min <Star size={12} className="text-amber-500 fill-amber-500" /> {filters.minRating}+
             </span>
             <input 
               type="range" 
               min="0" max="5" step="0.5" 
               value={filters.minRating}
               onChange={(e) => setFilters({...filters, minRating: parseFloat(e.target.value)})}
               className="w-20 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-wc-blue"
             />
          </div>

          {/* EMAIL TOGGLE */}
          <button 
             onClick={() => setFilters({...filters, requireEmail: !filters.requireEmail})}
             className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${filters.requireEmail ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
          >
             <Mail size={14} />
             Solo con Email
          </button>
       </div>

       {/* RIGHT: SORT & COUNTER */}
       <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          
          <div className="flex items-center gap-2">
             <span className="text-xs text-slate-400 uppercase font-bold">Ordenar:</span>
             <div className="relative group">
                <button className="flex items-center gap-1 text-xs font-bold text-slate-700 hover:text-wc-blue transition-colors">
                   {filters.sortBy === 'relevance' && 'Relevancia'}
                   {filters.sortBy === 'rating' && 'Mejor Calificados'}
                   {filters.sortBy === 'reviews' && 'Más Reseñas'}
                   <ChevronDown size={12} />
                </button>
                {/* Dropdown Logic would go here, implemented as simple cycle for demo */}
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-xl border border-slate-100 hidden group-hover:block z-10">
                   <div 
                    className="p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-600"
                    onClick={() => setFilters({...filters, sortBy: 'relevance'})}
                   >Relevancia</div>
                   <div 
                    className="p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-600"
                    onClick={() => setFilters({...filters, sortBy: 'rating'})}
                   >Mejor Rating</div>
                   <div 
                    className="p-2 hover:bg-slate-50 cursor-pointer text-xs text-slate-600"
                    onClick={() => setFilters({...filters, sortBy: 'reviews'})}
                   >Más Reseñas</div>
                </div>
             </div>
          </div>

          <div className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">
             {visibleResults} / {totalResults}
          </div>
       </div>

    </div>
  );
};