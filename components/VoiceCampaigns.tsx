import React, { useState, useEffect } from 'react';
import { VoiceCampaignConfig, SMSAudienceMember, Lead, VoiceCampaignHistoryItem } from '../types';
import { 
  PhoneCall, 
  Users, 
  Upload, 
  Trash2, 
  PlayCircle, 
  Calculator, 
  Mic,
  FileAudio,
  Type,
  CalendarDays,
  History,
  Check,
  X,
  Clock
} from 'lucide-react';

interface VoiceCampaignsProps {
  initialLeads: Lead[];
  accCredits: number;
  onSendCampaign: (config: VoiceCampaignConfig, cost: number) => void;
}

const VOICE_CREDIT_COST_PER_LEAD = 3; 

// Mock History Data
const MOCK_HISTORY: VoiceCampaignHistoryItem[] = [
    { id: '1', name: 'Promo Navidad', date: '2023-12-24', status: 'completed', answered: 450, failed: 50, cost: 1500 },
    { id: '2', name: 'Cobranza Lote 1', date: '2024-01-15', status: 'completed', answered: 120, failed: 10, cost: 390 },
    { id: '3', name: 'Aviso Mantenimiento', date: '2024-02-01', status: 'scheduled', answered: 0, failed: 0, cost: 300 },
];

export const VoiceCampaigns: React.FC<VoiceCampaignsProps> = ({ initialLeads, accCredits, onSendCampaign }) => {
  
  // STATE
  const [activeTab, setActiveTab] = useState<'create' | 'history'>('create');
  const [campaignName, setCampaignName] = useState(`Campaña Voz ${new Date().toLocaleDateString()}`);
  const [messageType, setMessageType] = useState<'tts' | 'audio_file'>('tts');
  const [ttsText, setTtsText] = useState('');
  const [audience, setAudience] = useState<SMSAudienceMember[]>([]);
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Simulated File Upload
  const [audioFile, setAudioFile] = useState<File | null>(null);

  // Derived State for Cost
  const [totalCost, setTotalCost] = useState(0);

  // Initialize Audience
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

  // Cost Logic
  useEffect(() => {
    setTotalCost(audience.length * VOICE_CREDIT_COST_PER_LEAD);
  }, [audience]);

  const handleFileUpload = () => {
    const fakeImport: SMSAudienceMember[] = [
      { id: 'csv_v1', name: 'Dr. House', phone: '+525512345678', source: 'csv_import' },
      { id: 'csv_v2', name: 'Lic. Valeriano', phone: '+525587654321', source: 'csv_import' },
    ];
    setAudience(prev => [...prev, ...fakeImport]);
    alert(`Se importaron ${fakeImport.length} contactos.`);
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files && e.target.files[0]) {
        setAudioFile(e.target.files[0]);
    }
  };

  const handleClearAudience = () => {
    if (confirm("¿Limpiar lista?")) setAudience([]);
  };

  const handleSend = () => {
    if (totalCost > accCredits) {
      alert("Créditos insuficientes.");
      return;
    }
    if (messageType === 'tts' && !ttsText) {
        alert("Escribe el mensaje a locutar.");
        return;
    }
    if (messageType === 'audio_file' && !audioFile) {
        alert("Sube un archivo de audio.");
        return;
    }

    onSendCampaign(
      { 
          campaignName, 
          type: messageType,
          ttsText: messageType === 'tts' ? ttsText : undefined,
          audioFileName: audioFile ? audioFile.name : undefined,
          audience,
          scheduledDate: scheduledDate ? new Date(scheduledDate).toISOString() : undefined
      },
      totalCost
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in">
      
      {/* TABS */}
      <div className="flex gap-4 mb-4 border-b border-slate-200">
          <button 
            onClick={() => setActiveTab('create')}
            className={`pb-2 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'create' ? 'border-wc-purple text-wc-purple' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
              Nueva Campaña
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-2 px-4 font-bold text-sm transition-colors border-b-2 ${activeTab === 'history' ? 'border-wc-purple text-wc-purple' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
          >
              Historial y Reportes
          </button>
      </div>

      {activeTab === 'create' ? (
      <div className="flex flex-col lg:flex-row gap-6 flex-1 overflow-hidden">
        {/* LEFT: CONFIG */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4 overflow-y-auto pr-2 pb-10">
            
            {/* CAMPAIGN SETTINGS */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-2 mb-4 text-slate-800">
                <PhoneCall className="text-wc-purple" />
                <h2 className="text-lg font-bold">Campaña de Voz (Robocalling)</h2>
            </div>
            
            <div className="space-y-4">
                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre de Campaña</label>
                <input 
                    type="text" 
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:border-wc-purple outline-none text-sm font-medium"
                />
                </div>

                {/* SCHEDULED DATE */}
                <div>
                   <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Programación (Opcional)</label>
                   <div className="relative">
                       <CalendarDays className="absolute left-3 top-2.5 text-slate-400" size={18} />
                       <input 
                         type="datetime-local" 
                         value={scheduledDate}
                         onChange={(e) => setScheduledDate(e.target.value)}
                         className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:border-wc-purple outline-none text-sm font-medium"
                       />
                   </div>
                   <p className="text-[10px] text-slate-400 mt-1">Si lo dejas en blanco, se enviará inmediatamente.</p>
                </div>

                {/* MESSAGE SOURCE SELECTOR */}
                <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tipo de Mensaje</label>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setMessageType('tts')}
                        className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${messageType === 'tts' ? 'border-wc-purple bg-purple-50 text-wc-purple' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                    >
                        <Type size={20} />
                        <span className="text-xs font-bold">Text-to-Speech</span>
                    </button>
                    <button 
                        onClick={() => setMessageType('audio_file')}
                        className={`flex-1 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${messageType === 'audio_file' ? 'border-wc-purple bg-purple-50 text-wc-purple' : 'border-slate-100 text-slate-400 hover:bg-slate-50'}`}
                    >
                        <FileAudio size={20} />
                        <span className="text-xs font-bold">Subir Audio (MP3)</span>
                    </button>
                </div>
                </div>

                {/* EDITOR AREA */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 min-h-[150px]">
                    {messageType === 'tts' ? (
                        <div>
                            <label className="text-xs font-bold text-slate-400 mb-2 block">Texto a Locutar (IA Neuronal)</label>
                            <textarea 
                                value={ttsText}
                                onChange={(e) => setTtsText(e.target.value)}
                                placeholder="Hola, somos WhatsCloud. Tenemos una oferta exclusiva para su negocio..."
                                className="w-full h-32 p-3 rounded-lg border border-slate-200 text-sm focus:border-wc-purple outline-none resize-none"
                            />
                            <p className="text-[10px] text-slate-400 mt-1 text-right">Issabel TTS Engine</p>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-300 rounded-lg bg-white">
                            <input type="file" accept="audio/mp3,audio/wav" className="hidden" id="audio-upload" onChange={handleAudioUpload} />
                            <label htmlFor="audio-upload" className="cursor-pointer flex flex-col items-center text-slate-500 hover:text-wc-purple transition-colors">
                                <Upload size={32} className="mb-2" />
                                <span className="text-sm font-bold">{audioFile ? audioFile.name : 'Click para subir MP3'}</span>
                                <span className="text-[10px] mt-1">Máx 5MB</span>
                            </label>
                        </div>
                    )}
                </div>

                {/* AUDIENCE */}
                <div>
                <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Destinatarios ({audience.length})</label>
                    <div className="flex gap-2">
                        <button onClick={handleFileUpload} className="text-xs bg-slate-100 px-2 py-1 rounded hover:bg-slate-200">Importar</button>
                        {audience.length > 0 && <button onClick={handleClearAudience} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}
                    </div>
                </div>
                <div className="max-h-32 overflow-y-auto border border-slate-200 rounded-lg">
                    {audience.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-4">Sin audiencia.</p>
                    ) : (
                        audience.map((m, i) => (
                            <div key={i} className="flex justify-between p-2 border-b border-slate-50 text-xs hover:bg-slate-50">
                                <span>{m.name}</span>
                                <span className="font-mono text-slate-500">{m.phone}</span>
                            </div>
                        ))
                    )}
                </div>
                </div>

            </div>
            </div>
        </div>

        {/* RIGHT: COST & PREVIEW */}
        <div className="w-full lg:w-1/2 flex flex-col gap-4">
            
            {/* COST CALCULATOR */}
            <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Calculator size={100} />
            </div>
            
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Costo Estimado (Issabel Trunk)</h3>
            
            <div className="flex justify-between items-end mb-6 relative z-10">
                <div>
                    <div className="text-4xl font-bold font-mono tracking-tight">{totalCost}</div>
                    <div className="text-xs text-slate-400 mt-1">Créditos ({VOICE_CREDIT_COST_PER_LEAD} por llamada)</div>
                </div>
                <div className="text-right">
                    <div className="text-emerald-400 font-bold text-lg">{accCredits}</div>
                    <div className="text-xs text-slate-400">Disponibles</div>
                </div>
            </div>

            <button 
                onClick={handleSend}
                disabled={totalCost === 0 || totalCost > accCredits || audience.length === 0}
                className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
                {scheduledDate ? <Clock size={18} /> : <PlayCircle size={18} />}
                {totalCost > accCredits ? 'Saldo Insuficiente' : (scheduledDate ? 'Programar Campaña' : 'Lanzar Campaña Ahora')}
            </button>
            </div>

            {/* INFO CARD */}
            <div className="bg-purple-50 p-6 rounded-2xl border border-purple-100">
                <h3 className="font-bold text-purple-900 mb-2 flex items-center gap-2">
                    <Mic size={18} /> ¿Cómo funciona el Robocalling?
                </h3>
                <p className="text-sm text-purple-800 leading-relaxed mb-4">
                    WhatsCloud envía las instrucciones a tu servidor <strong>Issabel PBX</strong>. El sistema marcará automáticamente a la lista de contactos usando tus troncales SIP.
                    <br/><br/>
                    Cuando el cliente contesta, el sistema reproducirá el audio o el texto convertido a voz (TTS).
                </p>
                <div className="text-xs bg-white p-3 rounded-lg text-purple-600 border border-purple-200">
                    <strong>Nota Técnica:</strong> La capacidad de llamadas simultáneas depende de la configuración de tu servidor Asterisk.
                </div>
            </div>

        </div>
      </div>
      ) : (
          /* HISTORY TAB */
          <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-6 overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2"><History /> Historial de Campañas de Voz</h3>
              <div className="w-full overflow-x-auto">
                  <table className="w-full text-left">
                      <thead>
                          <tr className="border-b border-slate-200 text-xs text-slate-500 uppercase">
                              <th className="p-3">Nombre</th>
                              <th className="p-3">Fecha</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Contestadas</th>
                              <th className="p-3">Fallidas</th>
                              <th className="p-3">Costo</th>
                          </tr>
                      </thead>
                      <tbody>
                          {MOCK_HISTORY.map(item => (
                              <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                  <td className="p-3 font-medium text-slate-800">{item.name}</td>
                                  <td className="p-3 text-slate-500 text-sm">{item.date}</td>
                                  <td className="p-3">
                                      {item.status === 'completed' && <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Check size={10} /> Completada</span>}
                                      {item.status === 'scheduled' && <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><Clock size={10} /> Programada</span>}
                                      {item.status === 'failed' && <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase flex items-center gap-1 w-fit"><X size={10} /> Fallida</span>}
                                  </td>
                                  <td className="p-3 text-sm text-slate-600">{item.answered}</td>
                                  <td className="p-3 text-sm text-red-400">{item.failed}</td>
                                  <td className="p-3 font-mono text-xs text-slate-500">{item.cost} cr</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

    </div>
  );
};