import React, { useState, useEffect } from 'react';
import { SMSCampaignConfig, SMSAudienceMember, Lead } from '../types';
import { 
  MessageCircle, 
  Users, 
  Upload, 
  Trash2, 
  Send, 
  Calculator, 
  Smartphone,
  Info,
  CheckCircle2,
  AlertTriangle,
  LayoutTemplate
} from 'lucide-react';

interface SMSReminderProps {
  initialLeads: Lead[]; // Leads passed from Scrapper
  accCredits: number;
  onSendCampaign: (config: SMSCampaignConfig, cost: number) => void;
}

const GSM_LIMIT = 160;
const UNICODE_LIMIT = 70; // Emojis reduce limit drastically

const SMS_TEMPLATES = [
    { label: 'Cobranza Suave', text: 'Hola {{nombre_negocio}}, notamos un saldo pendiente en tu cuenta. Por favor verifica tu estado aquí: {{link_pago}}' },
    { label: 'Promo Flash', text: '¡Oferta Relámpago! ⚡ Solo hoy 50% de descuento en toda la tienda. Muestra este SMS. Te esperamos.' },
    { label: 'Confirmación Cita', text: 'Hola, confirmamos tu cita para el {{fecha}}. Responde SI para confirmar o NO para reagendar.' },
    { label: 'Bienvenida', text: 'Bienvenido a la familia WhatsCloud. Gracias por confiar en nosotros.' }
];

export const SMSReminder: React.FC<SMSReminderProps> = ({ initialLeads, accCredits, onSendCampaign }) => {
  
  // STATE
  const [campaignName, setCampaignName] = useState(`Campaña SMS ${new Date().toLocaleDateString()}`);
  const [message, setMessage] = useState('');
  const [audience, setAudience] = useState<SMSAudienceMember[]>([]);

  // Derived State for Cost
  const [isUnicode, setIsUnicode] = useState(false);
  const [segments, setSegments] = useState(1);
  const [charCount, setCharCount] = useState(0);
  const [totalCost, setTotalCost] = useState(0);

  // Initialize Audience from Props
  useEffect(() => {
    if (initialLeads.length > 0) {
      const mappedLeads: SMSAudienceMember[] = initialLeads.map(l => ({
        id: l.id,
        name: l.businessName,
        phone: l.phone,
        source: 'lead_scrapper'
      }));
      setAudience(mappedLeads);
    }
  }, [initialLeads]);

  // LOGIC: GSM/Unicode Calculation
  useEffect(() => {
    // Simple check: if it contains characters outside standard GSM 7-bit range
    // For this demo, we assume any emoji triggers Unicode mode
    const hasUnicode = /[^\u0000-\u00ff]/.test(message);
    setIsUnicode(hasUnicode);

    const len = message.length;
    setCharCount(len);

    const limit = hasUnicode ? UNICODE_LIMIT : GSM_LIMIT;
    const calcSegments = len === 0 ? 0 : Math.ceil(len / limit);
    setSegments(calcSegments);

    // Cost logic: Audience Size * Segments * 1 Credit
    setTotalCost(audience.length * calcSegments);

  }, [message, audience]);

  // HANDLER: Add Variable
  const insertVariable = (variable: string) => {
    setMessage(prev => prev + ` {{${variable}}} `);
  };

  // HANDLER: Apply Template
  const applyTemplate = (text: string) => {
      setMessage(text);
  };

  // HANDLER: Import CSV (Simulated)
  const handleFileUpload = () => {
    const fakeImport: SMSAudienceMember[] = [
      { id: 'csv_1', name: 'Juan Pérez', phone: '+525512345678', source: 'csv_import' },
      { id: 'csv_2', name: 'Maria Lopez', phone: '+525587654321', source: 'csv_import' },
      { id: 'csv_3', name: 'Tacos El Guero', phone: '+525511223344', source: 'csv_import' },
    ];
    setAudience(prev => [...prev, ...fakeImport]);
    alert(`Se importaron ${fakeImport.length} contactos desde CSV.`);
  };

  const handleClearAudience = () => {
    if (confirm("¿Estás seguro de limpiar la lista de audiencia?")) {
      setAudience([]);
    }
  };

  const handleSend = () => {
    if (totalCost > accCredits) {
      alert("No tienes créditos suficientes para esta campaña.");
      return;
    }
    onSendCampaign(
      { campaignName, message, audience },
      totalCost
    );
  };

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in">
      
      {/* LEFT COLUMN: CONFIGURATION */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2">
        
        {/* CARD: CAMPAIGN INFO */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-4 text-slate-800">
             <MessageCircle className="text-wc-blue" />
             <h2 className="text-lg font-bold">Configuración de Campaña</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de Campaña</label>
              <input 
                type="text" 
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-wc-blue outline-none text-sm font-medium"
              />
            </div>
            
            {/* AUDIENCE MANAGER */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex justify-between items-center mb-3">
                 <div className="flex items-center gap-2">
                    <Users size={16} className="text-slate-500" />
                    <span className="text-sm font-bold text-slate-700">Audiencia ({audience.length})</span>
                 </div>
                 <div className="flex gap-2">
                    <button 
                      onClick={handleFileUpload}
                      className="text-xs bg-white border border-slate-300 px-3 py-1.5 rounded-lg hover:border-wc-blue flex items-center gap-1 transition-colors"
                    >
                      <Upload size={12} /> Importar CSV
                    </button>
                    {audience.length > 0 && (
                      <button onClick={handleClearAudience} className="text-slate-400 hover:text-red-500">
                        <Trash2 size={16} />
                      </button>
                    )}
                 </div>
              </div>
              
              <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                 {audience.length === 0 ? (
                   <p className="text-xs text-slate-400 text-center py-4 italic">No hay destinatarios seleccionados.</p>
                 ) : (
                   audience.map((member, idx) => (
                     <div key={idx} className="flex justify-between text-xs bg-white p-2 rounded border border-slate-100">
                        <span className="font-medium truncate max-w-[50%]">{member.name}</span>
                        <span className="font-mono text-slate-500">{member.phone}</span>
                     </div>
                   ))
                 )}
              </div>
            </div>
          </div>
        </div>

        {/* CARD: EDITOR */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex-1">
           <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Mensaje (Template)</label>
           
           {/* TEMPLATES */}
            <div className="mb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-2">
                    <LayoutTemplate size={12} /> Plantillas Rápidas
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {SMS_TEMPLATES.map((tmpl, idx) => (
                        <button 
                            key={idx}
                            onClick={() => applyTemplate(tmpl.text)}
                            className="px-3 py-1.5 bg-slate-50 text-slate-600 text-xs rounded-lg border border-slate-200 hover:bg-slate-100 hover:border-wc-blue hover:text-wc-blue transition-colors whitespace-nowrap"
                        >
                            {tmpl.label}
                        </button>
                    ))}
                </div>
            </div>

           {/* VARIABLE CHIPS */}
           <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              {['nombre_negocio', 'telefono', 'fecha', 'link_pago'].map(v => (
                <button 
                  key={v}
                  onClick={() => insertVariable(v)}
                  className="px-2 py-1 bg-blue-50 text-wc-blue text-[10px] font-bold uppercase rounded-md border border-blue-100 hover:bg-blue-100 transition-colors whitespace-nowrap"
                >
                  + {v}
                </button>
              ))}
           </div>

           <textarea 
             value={message}
             onChange={(e) => setMessage(e.target.value)}
             placeholder="Escribe tu mensaje aquí... (Ej: Hola {{nombre_negocio}}, te recordamos tu pago pendiente...)"
             className="w-full h-40 p-4 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-wc-blue/20 focus:border-wc-blue outline-none resize-none font-sans leading-relaxed"
           />

           {/* GSM COUNTER & STATS */}
           <div className="mt-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                 <span className={`font-bold ${charCount > (isUnicode ? UNICODE_LIMIT : GSM_LIMIT) ? 'text-amber-500' : 'text-slate-400'}`}>
                   {charCount} carácteres
                 </span>
                 <span className="text-slate-300">|</span>
                 <span className="font-bold text-slate-600">
                   {segments} segmento(s)
                 </span>
              </div>
              <div className="flex items-center gap-1">
                 <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${isUnicode ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>
                   {isUnicode ? 'UNICODE (Emoji)' : 'GSM-7 Standard'}
                 </span>
              </div>
           </div>
           
           {isUnicode && (
             <div className="mt-2 text-[10px] text-amber-600 bg-amber-50 p-2 rounded flex items-start gap-1">
               <AlertTriangle size={12} className="mt-0.5 shrink-0" />
               El uso de emojis o tildes especiales reduce el límite por mensaje de 160 a 70 caracteres.
             </div>
           )}
        </div>

      </div>

      {/* RIGHT COLUMN: PREVIEW & COST */}
      <div className="w-full lg:w-1/2 flex flex-col gap-4">
        
        {/* COST CALCULATOR */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Calculator size={100} />
           </div>
           
           <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Resumen de Costos (ACC)</h3>
           
           <div className="flex justify-between items-end mb-6 relative z-10">
              <div>
                <div className="text-4xl font-bold font-mono tracking-tight">{totalCost}</div>
                <div className="text-xs text-slate-400 mt-1">Créditos Totales</div>
              </div>
              <div className="text-right">
                 <div className="text-emerald-400 font-bold text-lg">{accCredits}</div>
                 <div className="text-xs text-slate-400">Disponibles</div>
              </div>
           </div>

           {/* Progress Bar for Credits */}
           <div className="w-full bg-slate-800 h-2 rounded-full mb-2 overflow-hidden">
             <div 
               className={`h-full transition-all duration-500 ${totalCost > accCredits ? 'bg-red-500' : 'bg-wc-gradient'}`} 
               style={{ width: `${Math.min((totalCost / (accCredits || 1)) * 100, 100)}%` }}
             ></div>
           </div>
           <p className="text-[10px] text-slate-500 text-right">
             {totalCost > accCredits ? 'Saldo Insuficiente' : `${Math.round((totalCost / (accCredits || 1)) * 100)}% del saldo`}
           </p>

           <button 
             onClick={handleSend}
             disabled={totalCost === 0 || totalCost > accCredits || audience.length === 0}
             className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
           >
             <Send size={18} />
             {totalCost > accCredits ? 'Recargar Saldo' : 'Confirmar y Enviar Campaña'}
           </button>
        </div>

        {/* PHONE SIMULATOR */}
        <div className="flex-1 bg-[#F0F2F5] rounded-3xl border-8 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[600px]">
           {/* Notch */}
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-xl z-20"></div>
           
           {/* Status Bar */}
           <div className="bg-slate-100 h-8 w-full flex justify-between items-center px-6 pt-2 text-[10px] font-bold text-slate-800 z-10">
              <span>9:41</span>
              <div className="flex gap-1">
                 <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
                 <div className="w-3 h-3 bg-slate-800 rounded-full"></div>
              </div>
           </div>

           {/* SMS Header */}
           <div className="bg-white/80 backdrop-blur-sm p-4 border-b border-slate-200 flex flex-col items-center pt-8">
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-1 text-slate-500">
                <Users size={24} />
              </div>
              <span className="text-xs text-slate-500">To:</span>
              <span className="font-bold text-slate-800 text-sm">
                 {audience.length > 0 ? `${audience.length} Destinatarios` : 'Lista Vacía'}
              </span>
           </div>

           {/* Message Body */}
           <div className="flex-1 p-4 overflow-y-auto bg-white">
              <div className="flex justify-center mb-6">
                 <span className="text-[10px] text-slate-400 uppercase tracking-widest">Today 9:41 AM</span>
              </div>
              
              {message && (
                <div className="flex justify-end mb-2 animate-in zoom-in slide-in-from-bottom-2 duration-300">
                   <div className="bg-wc-blue text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[85%] text-sm shadow-sm leading-relaxed relative">
                      {/* Simulate variable replacement for preview */}
                      {message.replace(/{{nombre_negocio}}/g, "Pizza Napoli").replace(/{{telefono}}/g, "+52...").replace(/{{fecha}}/g, "Hoy")}
                      
                      {/* SMS Status Tick */}
                      <div className="absolute -bottom-4 right-1 text-[10px] text-slate-400 font-bold flex items-center gap-1">
                        Delivered <CheckCircle2 size={10} />
                      </div>
                   </div>
                </div>
              )}

              {!message && (
                 <div className="flex flex-col items-center justify-center h-40 opacity-30">
                    <Smartphone size={40} className="mb-2" />
                    <p className="text-xs">Vista Previa</p>
                 </div>
              )}
           </div>
           
           {/* Input Fake */}
           <div className="p-3 bg-slate-100 border-t border-slate-200">
              <div className="h-8 rounded-full border border-slate-300 bg-white"></div>
           </div>

        </div>

      </div>
    </div>
  );
};