import React, { useMemo } from 'react';
import { Lead } from '../types';
import { TrendingUp, Star, Mail, Award, PieChart } from 'lucide-react';

interface InsightsPanelProps {
  leads: Lead[];
  city: string;
}

export const InsightsPanel: React.FC<InsightsPanelProps> = ({ leads, city }) => {
  const stats = useMemo(() => {
    if (leads.length === 0) return null;

    const total = leads.length;
    const totalRating = leads.reduce((acc, curr) => acc + (curr.rating || 0), 0);
    const avgRating = (totalRating / total).toFixed(1);
    const withEmail = leads.filter(l => l.email).length;
    const emailPercentage = Math.round((withEmail / total) * 100);
    const topRated = leads.filter(l => (l.rating || 0) >= 4.5).length;

    // "Market Opportunity" Logic (Arbitrary for demo)
    // Low ratings = High Opportunity for reputation management services
    // Low email count = High Opportunity for digital transformation
    let opportunityLabel = "Media";
    let opportunityColor = "text-yellow-600 bg-yellow-100";
    
    if (parseFloat(avgRating) < 4.0 || emailPercentage < 30) {
        opportunityLabel = "Alta";
        opportunityColor = "text-green-600 bg-green-100";
    } else if (parseFloat(avgRating) > 4.8) {
        opportunityLabel = "Baja";
        opportunityColor = "text-red-600 bg-red-100";
    }

    return {
      total,
      avgRating,
      emailPercentage,
      topRated,
      opportunityLabel,
      opportunityColor
    };
  }, [leads]);

  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 animate-in slide-in-from-top-4 duration-500">
      
      {/* CARD 1: MARKET QUALITY */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
         <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Calidad Zona</span>
            <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500">
                <Star size={16} fill="currentColor" />
            </div>
         </div>
         <div>
            <div className="text-2xl font-bold text-slate-800">{stats.avgRating}</div>
            <p className="text-xs text-slate-500">Rating Promedio en {city}</p>
         </div>
      </div>

      {/* CARD 2: DATA RICHNESS */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
         <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Digitalización</span>
            <div className="p-1.5 bg-blue-50 rounded-lg text-blue-500">
                <Mail size={16} />
            </div>
         </div>
         <div>
            <div className="text-2xl font-bold text-slate-800">{stats.emailPercentage}%</div>
            <p className="text-xs text-slate-500">Negocios con Email público</p>
         </div>
      </div>

      {/* CARD 3: COMPETITION */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
         <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Competencia</span>
            <div className="p-1.5 bg-purple-50 rounded-lg text-purple-500">
                <Award size={16} />
            </div>
         </div>
         <div>
            <div className="text-2xl font-bold text-slate-800">{stats.topRated}</div>
            <p className="text-xs text-slate-500">Negocios "Top Rated" (+4.5)</p>
         </div>
      </div>

      {/* CARD 4: OPPORTUNITY */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col justify-between">
         <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Oportunidad Venta</span>
            <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500">
                <TrendingUp size={16} />
            </div>
         </div>
         <div>
            <span className={`text-sm font-bold px-2 py-1 rounded-md ${stats.opportunityColor}`}>
                {stats.opportunityLabel}
            </span>
            <p className="text-xs text-slate-500 mt-2">Basado en saturación</p>
         </div>
      </div>

    </div>
  );
};