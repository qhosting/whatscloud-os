import React, { useState } from 'react';
import { Lead } from '../types';
import { MapPin, Phone, Mail, Building2, CheckCircle, Star, ExternalLink, BrainCircuit, Loader2, PhoneCall, Facebook, Instagram, Linkedin, Globe } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  onSelect?: (id: string) => void;
  selected?: boolean;
  onAnalyze?: (lead: Lead) => Promise<void>;
  onCall?: (lead: Lead) => Promise<void>; // New Click-to-Call Prop
}

export const LeadCard: React.FC<LeadCardProps> = ({ lead, onSelect, selected, onAnalyze, onCall }) => {
  const [analyzing, setAnalyzing] = useState(false);
  const [calling, setCalling] = useState(false); // Calling State

  const handleAnalysis = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onAnalyze) return;
    setAnalyzing(true);
    await onAnalyze(lead);
    setAnalyzing(false);
  };

  const handleCall = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onCall) return;
    
    if (confirm(`¿Iniciar llamada a ${lead.businessName} (${lead.phone}) vía Issabel PBX?`)) {
        setCalling(true);
        await onCall(lead);
        setTimeout(() => setCalling(false), 2000); // Reset state after fake delay
    }
  };

  return (
    <div 
      className={`
        relative p-5 rounded-xl border-2 transition-all duration-200 cursor-pointer group flex flex-col justify-between h-full
        ${selected 
          ? 'border-wc-blue bg-blue-50/50 shadow-md' 
          : 'border-slate-100 bg-white hover:border-wc-blue/30 hover:shadow-sm'
        }
      `}
      onClick={() => onSelect && onSelect(lead.id)}
    >
      <div>
        <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${selected ? 'bg-wc-blue text-white' : 'bg-slate-100 text-wc-purple'}`}>
                <Building2 size={20} />
            </div>
            <div>
                <h3 className="font-semibold text-slate-800 leading-tight">{lead.businessName}</h3>
                
                {/* Social Proof Section (Maps Data) */}
                <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] font-semibold text-wc-blue bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wide border border-blue-100 inline-block">
                    {lead.category}
                </span>
                {(lead.rating || 0) > 0 && (
                    <div className="flex items-center gap-1 text-amber-500">
                        <Star size={12} fill="currentColor" />
                        <span className="text-xs font-bold text-slate-700">{lead.rating}</span>
                        <span className="text-[10px] text-slate-400">({lead.reviews})</span>
                    </div>
                )}
                </div>
            </div>
            </div>
            {selected && <CheckCircle className="text-wc-blue animate-in zoom-in" size={24} />}
        </div>

        <div className="space-y-2.5 text-sm text-slate-600 mt-4">
            <div className="flex items-start gap-3">
            <MapPin size={16} className="text-wc-green shrink-0 mt-0.5" />
            <span className="truncate leading-tight">{lead.address}</span>
            </div>
            
            {/* PHONE ROW WITH CLICK-TO-CALL */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-wc-blue shrink-0" />
                    <span className="font-mono text-slate-700">{lead.phone}</span>
                </div>
                {/* ISSABEL BUTTON */}
                {onCall && (
                    <button 
                        onClick={handleCall}
                        disabled={calling}
                        className={`
                            p-2 rounded-full transition-colors flex items-center justify-center
                            ${calling ? 'bg-green-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-600'}
                        `}
                        title="Llamar vía Issabel PBX"
                    >
                        {calling ? <Loader2 size={14} className="animate-spin" /> : <PhoneCall size={14} />}
                    </button>
                )}
            </div>
            
            {/* Social Media Row */}
            {lead.socialMedia && (
                <div className="flex gap-2 mt-2 pt-2 border-t border-slate-50">
                    {lead.socialMedia.facebook && <a href={lead.socialMedia.facebook} target="_blank" onClick={(e) => e.stopPropagation()} className="text-blue-600 hover:scale-110 transition-transform"><Facebook size={14} /></a>}
                    {lead.socialMedia.instagram && <a href={lead.socialMedia.instagram} target="_blank" onClick={(e) => e.stopPropagation()} className="text-pink-600 hover:scale-110 transition-transform"><Instagram size={14} /></a>}
                    {lead.socialMedia.linkedin && <a href={lead.socialMedia.linkedin} target="_blank" onClick={(e) => e.stopPropagation()} className="text-blue-800 hover:scale-110 transition-transform"><Linkedin size={14} /></a>}
                    {lead.socialMedia.website && <a href={lead.socialMedia.website} target="_blank" onClick={(e) => e.stopPropagation()} className="text-slate-600 hover:scale-110 transition-transform"><Globe size={14} /></a>}
                </div>
            )}

            {/* Actions Row */}
            <div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-100">
            {lead.mapsUrl && (
                <a 
                    href={lead.mapsUrl} 
                    target="_blank" 
                    rel="noreferrer"
                    onClick={(e) => e.stopPropagation()} 
                    className="text-xs flex items-center gap-1 text-slate-400 hover:text-wc-blue transition-colors"
                >
                    <ExternalLink size={12} />
                    Google Maps
                </a>
            )}
            </div>
        </div>
      </div>

      {/* INTELLIGENCE SINGULARITY SECTION */}
      <div className="mt-4">
          {lead.analysis ? (
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-100 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-purple-600 mb-1 uppercase tracking-wide">
                      <BrainCircuit size={12} /> Estrategia IA
                  </div>
                  <p className="text-xs text-slate-700 italic leading-snug">"{lead.analysis}"</p>
              </div>
          ) : (
            onAnalyze && (
                <button 
                onClick={handleAnalysis}
                disabled={analyzing}
                className="w-full py-1.5 mt-2 text-xs font-medium text-purple-600 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
                >
                    {analyzing ? <Loader2 size={12} className="animate-spin" /> : <BrainCircuit size={12} />}
                    {analyzing ? "Analizando..." : "Analizar Estrategia"}
                </button>
            )
          )}

          <div className="mt-3 flex gap-2">
            {lead.status === 'exported_wc' && (
            <span className="text-[10px] bg-green-100 text-green-700 font-medium px-2 py-1 rounded border border-green-200 w-full text-center">
                Enviado a WhatsCloud
            </span>
            )}
            {lead.status === 'exported_crm' && (
            <span className="text-[10px] bg-blue-100 text-blue-700 font-medium px-2 py-1 rounded border border-blue-200 w-full text-center">
                Enviado a CRM
            </span>
            )}
        </div>
      </div>
    </div>
  );
};