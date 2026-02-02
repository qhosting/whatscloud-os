
import React, { useState, useEffect, useMemo } from 'react';
import { accService } from './services/accService';
import { geminiService } from './services/geminiService';
import { storageService } from './services/storageService';
import { automationService } from './services/automationService';
import { PROD_CONFIG } from './services/config';
import { Lead, ACCProfile, SearchFilters, N8NPayload, UserRole, BotConfig, SystemProtocol } from './types';
import { FilterPanel } from './components/FilterPanel';
import { LeadCard } from './components/LeadCard';
import { BotBuilder } from './components/BotBuilder';
import { SMSReminder } from './components/SMSReminder';
import { VoiceCampaigns } from './components/VoiceCampaigns';
import { ConnectionsModule } from './components/ConnectionsModule';
import { AdminPanel } from './components/AdminPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { PostProcessingToolbar, ViewFilters } from './components/PostProcessingToolbar';
import { LandingPage } from './components/LandingPage';

import { 
  CreditCard, Database, Bot, Loader2, Cloud, Search, MessageSquare, MessageCircle, Settings, X, Shield, Radio, Zap, Hexagon, Activity, PhoneCall, Server, Network
} from 'lucide-react';

type ModuleType = 'LeadScrapper' | 'BotBuilder' | 'SMSReminder' | 'VoiceCampaigns' | 'Connections' | 'AdminPanel';

const App: React.FC = () => {
  const [profile, setProfile] = useState<ACCProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('LeadScrapper');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isScraping, setIsScraping] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ niche: '', country: 'México', state: '', city: '', colonia: '' });
  const [viewFilters, setViewFilters] = useState<ViewFilters>({ minRating: 0, requireEmail: false, sortBy: 'relevance' });
  const [infraStatus] = useState({ redis: 'online', db: 'online' });

  // Manejo de Login Exitoso
  const handleLoginSuccess = (userProfile: ACCProfile) => {
    setProfile(userProfile);
    storageService.redis.set('active_session', userProfile, 7200); // 2h session persistence
  };

  // Autenticación por Geolocalización para leads (Opcional)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        console.debug(`[GEO_SYNC] Localizado en: ${pos.coords.latitude}, ${pos.coords.longitude}`);
      });
    }
  }, []);

  // Cargar sesión persistente si existe
  useEffect(() => {
    const checkSession = async () => {
      const savedSession = await storageService.redis.get('active_session');
      if (savedSession) setProfile(savedSession);
    };
    checkSession();
  }, []);

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem('redis_active_session');
  };

  const handleSearch = async () => {
    if (!profile || profile.credits <= 0) {
      alert("Créditos insuficientes en WhatsCloud.MX");
      return;
    }
    setIsScraping(true);
    try {
      const newLeads = await geminiService.scrapeLeads(filters);
      if (newLeads.length > 0) {
        setLeads(newLeads);
        // Sincronización real con la DB vía N8N
        await automationService.trigger({
          action: 'deduct_credits',
          userId: profile.userId,
          timestamp: new Date().toISOString(),
          module: 'LeadScrapper',
          role: profile.role,
          holding_identity: { 
            entity: 'Aurum Capital Holding', 
            engine: 'WhatsCloud Ecosistema', 
            active_protocol: 'ABUNDANCE_318_798' 
          },
          data: { amount: 1, action: 'scraping_engine_trigger', niche: filters.niche }
        });
      }
    } catch (e) { 
      console.error(e);
    } finally { 
      setIsScraping(false); 
    }
  };

  // Intelligence Singularity: Analyze Specific Lead
  const handleAnalyzeLead = async (lead: Lead) => {
      const strategy = await geminiService.analyzeLeadStrategy(lead);
      setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, analysis: strategy } : l));
      // Trigger Protocol Visual
      setActiveProtocol('ABUNDANCE_318_798');
      setTimeout(() => setActiveProtocol(null), 3000);
  };

  // --- CLICK TO CALL HANDLER (VOIP REAL) ---
  const handleClickToCall = async (lead: Lead) => {
    if (!profile) return;
    
    if (profile.credits < 1) {
        alert("Sin créditos para llamar.");
        return;
    }

    // Deduct (Optimistic UI)
    const remaining = await accService.deductCredits(1);
    setProfile({ ...profile, credits: remaining });

    // REAL BACKEND CALL
    try {
        const token = localStorage.getItem('wc_auth_token');
        const response = await fetch('/api/call', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                destination: lead.phone,
                extension: profile.pbxExtension || '101'
            })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(`Error VoIP: ${data.error || 'Fallo desconocido'}`);
        } else {
             // Visual Protocol
             setActiveProtocol('ABUNDANCE_318_798'); // Connection/Flow
             alert("Centralita: Llamando...");
        }

    } catch (e) {
        console.error("VoIP Error", e);
        alert("Error de conexión con la centralita.");
    }
  };

  const processedLeads = useMemo(() => {
    let result = [...leads];
    if (viewFilters.minRating > 0) result = result.filter(l => (l.rating || 0) >= viewFilters.minRating);
    if (viewFilters.requireEmail) result = result.filter(l => l.email);
    return result;
  }, [leads, viewFilters]);

  // Si no hay perfil, mostrar Landing de Producción
  if (!profile) return <LandingPage onLoginSuccess={handleLoginSuccess} />;

  return (
    <div className="min-h-screen flex font-sans bg-slate-50 selection:bg-wc-blue selection:text-white">
      
      {/* SIDEBAR CORPORATIVO */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white fixed h-full z-20 shadow-2xl border-r border-white/5">
        <div className="p-6 border-b border-white/5 bg-slate-950/20">
           <div className="flex items-center gap-2 mb-2">
               <Hexagon size={16} className="text-yellow-500" fill="currentColor" />
               <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Aurum Control Center</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="bg-wc-gradient p-1.5 rounded-lg shadow-inner">
                  <Cloud size={20} className="text-white" />
              </div>
             <span className="font-bold text-xl tracking-tight">WhatsCloud<span className="text-wc-blue">.MX</span></span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            <SidebarItem icon={<Search size={18} />} label="Lead Scrapper" active={activeModule === 'LeadScrapper'} onClick={() => setActiveModule('LeadScrapper')} />
            <SidebarItem icon={<MessageSquare size={18} />} label="BotBuilder IA" active={activeModule === 'BotBuilder'} onClick={() => setActiveModule('BotBuilder')} />
            <SidebarItem icon={<MessageCircle size={18} />} label="SMS Reminder" active={activeModule === 'SMSReminder'} onClick={() => setActiveModule('SMSReminder')} />
            <SidebarItem icon={<PhoneCall size={18} />} label="VoIP & PBX" active={activeModule === 'VoiceCampaigns'} onClick={() => setActiveModule('VoiceCampaigns')} />
            <div className="pt-4 border-t border-white/5 mt-2">
              <SidebarItem icon={<Radio size={18} />} label="Conexiones" active={activeModule === 'Connections'} onClick={() => setActiveModule('Connections')} />
              {profile.role === 'SUPER_ADMIN' && <SidebarItem icon={<Shield size={18} className="text-yellow-400" />} label="GOD MODE" active={activeModule === 'AdminPanel'} onClick={() => setActiveModule('AdminPanel')} />}
            </div>
        </nav>

        {/* STATUS WIDGET */}
        <div className="p-4 bg-black/40 m-4 rounded-xl border border-white/5 font-mono shadow-inner">
            <h4 className="text-[9px] font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
                <Network size={10} /> Infrastructure Health
            </h4>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">whatscloud-os-db</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400">qhosting_redis</span>
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                </div>
            </div>
        </div>

        {/* USER PROFILE CARD */}
        <div className="p-4 border-t border-white/5 bg-slate-950/50">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border border-white/20 shadow-lg ${profile.role === 'SUPER_ADMIN' ? 'bg-yellow-500 text-black' : 'bg-wc-gradient text-white'}`}>
                {profile.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate text-slate-100">{profile.name}</p>
                  <p className="text-[10px] text-slate-500 truncate uppercase tracking-tighter">{profile.role}</p>
              </div>
              <button onClick={handleLogout} className="text-slate-500 hover:text-red-400 transition-colors p-1" title="Cerrar Sesión">
                <X size={16} />
              </button>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-10 border-b border-slate-200 h-16 flex items-center justify-between px-8 shadow-sm">
              <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                 <Hexagon size={14} className="text-wc-blue" />
                 <span>/</span>
                 <span className="text-slate-800 font-black tracking-tight uppercase text-xs">{activeModule}</span>
                 {profile.role === 'SUPER_ADMIN' && <span className="ml-2 bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-sm">ROOT ACCESS</span>}
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-inner group">
                    <CreditCard size={14} className="text-wc-blue group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">{profile.credits > 9999 ? 'UNLIMITED' : `${profile.credits} CR`}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Server size={12} className="text-wc-green" /> CLUSTER: WHATSCLOUD-MX-PROD
                </div>
              </div>
          </header>

          <main className="flex-grow p-8 overflow-y-auto bg-[#FBFDFF]">
             {activeModule === 'LeadScrapper' && (
                 <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                        <div>
                            <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter leading-none">
                                Lead<span className="text-transparent bg-clip-text bg-wc-gradient">Scrapper</span> 2.0
                            </h1>
                            <p className="text-slate-500 text-lg max-w-xl">Extracción masiva de Google Maps sincronizada con <strong>PostgreSQL 16</strong>.</p>
                        </div>
                        {leads.length > 0 && (
                            <button 
                                onClick={exportLeads} 
                                className="bg-slate-900 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center gap-2 active:scale-95"
                            >
                                <Database size={16} /> Exportar {selectedLeads.size} a CRM Corporativo
                            </button>
                        )}
                    </div>
                    <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} isLoading={isScraping} />
                    {leads.length > 0 && (
                        <div className="space-y-6">
                             <InsightsPanel leads={leads} city={filters.city || 'Mercado Global'} />
                             <PostProcessingToolbar filters={viewFilters} setFilters={setViewFilters} totalResults={leads.length} visibleResults={processedLeads.length} />
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                                {processedLeads.map(lead => (
                                    <LeadCard 
                                      key={lead.id} 
                                      lead={lead} 
                                      selected={selectedLeads.has(lead.id)} 
                                      onSelect={(id) => {
                                          const next = new Set(selectedLeads);
                                          next.has(id) ? next.delete(id) : next.add(id);
                                          setSelectedLeads(next);
                                      }} 
                                      onAnalyze={async (l) => {
                                          const analysis = await geminiService.analyzeLeadStrategy(l);
                                          setLeads(prev => prev.map(item => item.id === l.id ? {...item, analysis} : item));
                                      }} 
                                      onCall={async (l) => {
                                          await automationService.trigger({
                                              action: 'initiate_call',
                                              userId: profile.userId,
                                              timestamp: new Date().toISOString(),
                                              module: 'VoiceCampaigns',
                                              role: profile.role,
                                              holding_identity: { 
                                                entity: 'Aurum Capital Holding', 
                                                engine: 'WhatsCloud Ecosistema', 
                                                active_protocol: 'SUCCESS_519_7148' 
                                              },
                                              data: { leadId: l.id, phone: l.phone, extension: profile.pbxExtension || '101' }
                                          });
                                      }}
                                    />
                                ))}
                             </div>
                        </div>
                    )}
                 </div>
             )}
             {activeModule === 'BotBuilder' && <BotBuilder onSave={(config) => {
                 automationService.trigger({
                     action: 'acc_sync_config',
                     userId: profile.userId,
                     timestamp: new Date().toISOString(),
                     module: 'BotBuilder',
                     role: profile.role,
                     holding_identity: { entity: 'Aurum Capital Holding', engine: 'WhatsCloud Ecosistema', active_protocol: 'SUCCESS_519_7148' },
                     data: { config, type: 'neural_agent_deployment' }
                 });
                 alert("Agente Neural desplegado en WhatsCloud Cluster.");
             }} role={profile.role} />}
             {activeModule === 'SMSReminder' && <SMSReminder initialLeads={leads.filter(l => selectedLeads.has(l.id))} accCredits={profile.credits} onSendCampaign={(config, cost) => {
                 automationService.trigger({
                     action: 'sms_campaign',
                     userId: profile.userId,
                     timestamp: new Date().toISOString(),
                     module: 'SMSReminder',
                     role: profile.role,
                     holding_identity: { entity: 'Aurum Capital Holding', engine: 'WhatsCloud Ecosistema', active_protocol: 'ABUNDANCE_318_798' },
                     data: { config, cost }
                 });
                 alert("Campaña SMS encolada en Redis para envío inmediato.");
             }} />}
             {activeModule === 'VoiceCampaigns' && <VoiceCampaigns initialLeads={leads.filter(l => selectedLeads.has(l.id))} accCredits={profile.credits} onSendCampaign={(config, cost) => {
                 automationService.trigger({
                    action: 'voice_campaign',
                    userId: profile.userId,
                    timestamp: new Date().toISOString(),
                    module: 'VoiceCampaigns',
                    role: profile.role,
                    holding_identity: { entity: 'Aurum Capital Holding', engine: 'WhatsCloud Ecosistema', active_protocol: 'ABUNDANCE_318_798' },
                    data: { config, cost, pbx_host: 'issabel.whatscloud.mx' }
                });
                alert("Campaña de Robocalling disparada en Issabel PBX.");
             }} />}
             {activeModule === 'Connections' && <ConnectionsModule role={profile.role} onCreateChannel={(data) => {
                 automationService.trigger({
                     action: 'create_channel',
                     userId: profile.userId,
                     timestamp: new Date().toISOString(),
                     module: 'Connections',
                     role: profile.role,
                     holding_identity: { entity: 'Aurum Capital Holding', engine: 'WhatsCloud Ecosistema', active_protocol: 'PROTECTION_8888' },
                     data
                 });
             }} onLinkExtension={(ext) => {
                 automationService.trigger({
                     action: 'link_extension',
                     userId: profile.userId,
                     timestamp: new Date().toISOString(),
                     module: 'Connections',
                     role: profile.role,
                     holding_identity: { entity: 'Aurum Capital Holding', engine: 'WhatsCloud Ecosistema', active_protocol: 'PROTECTION_8888' },
                     data: { ext }
                 });
                 setProfile(prev => prev ? {...prev, pbxExtension: ext} : null);
             }} />}
             {activeModule === 'AdminPanel' && <AdminPanel onSyncACC={() => {}} />}
          </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
      onClick={onClick} 
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${active ? 'bg-wc-gradient text-white shadow-lg shadow-wc-blue/20 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        {icon} <span className="tracking-tight">{label}</span>
    </button>
);

export default App;
