
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
import { BillingModule } from './components/BillingModule';
import { ConnectionsModule } from './components/ConnectionsModule';
import { AdminPanel } from './components/AdminPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { ViewFilters, PostProcessingToolbar } from './components/PostProcessingToolbar';
import { LandingPage } from './components/LandingPage';
import { InboxModule } from './components/InboxModule';
import { CommerceModule } from './components/CommerceModule';
import { SalesTrackerModule } from './components/crm/SalesTrackerModule';

import { 
  CreditCard, Database, Bot, Loader2, Cloud, Search, MessageSquare, MessageCircle, Settings, X, Shield, Radio, Zap, Hexagon, Activity, PhoneCall, Server, Network, Menu, Wallet, AlertCircle, Clock, ShoppingBag, Calendar
} from 'lucide-react';

type ModuleType = 'Dashboard' | 'LeadScrapper' | 'BotBuilder' | 'SMSReminder' | 'VoiceCampaigns' | 'Connections' | 'AdminPanel' | 'Billing' | 'Inbox' | 'Commerce' | 'SalesTracker';

const App: React.FC = () => {
  const [profile, setProfile] = useState<ACCProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>('Dashboard');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isScraping, setIsScraping] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({ niche: '', country: 'México', state: '', city: '', colonia: '', limit: 10 });
  const [viewFilters, setViewFilters] = useState<ViewFilters>({ minRating: 0, requireEmail: false, sortBy: 'relevance' });
  const [scanProgress, setScanProgress] = useState(0);
  const [infraStatus] = useState({ redis: 'online', db: 'online' });
  const [stats, setStats] = useState<any>(null);
  const [activeProtocol, setActiveProtocol] = useState<SystemProtocol | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  // Fetch Stats and real Leads on load
  useEffect(() => {
    if (profile) {
      accService.getDashboardStats().then(setStats);
      fetchLeads();
    }
  }, [profile]);

  const fetchLeads = async () => {
    try {
      const token = localStorage.getItem('wc_auth_token');
      const response = await fetch('/api/leads?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const rawLeads = data.leads || [];
        const unique = Array.from(new Map(rawLeads.map((l: any) => [l.id, l])).values());
        setLeads(unique as Lead[]);
      }
    } catch (e) {
      console.error("Fetch Leads Error", e);
    }
  };

  const handleLogout = () => {
    setProfile(null);
    localStorage.removeItem('redis_active_session');
    localStorage.removeItem('wc_auth_token');
  };

  const refreshProfile = async () => {
    if (!profile) return;
    try {
        const statsData = await accService.getDashboardStats();
        if (statsData) {
            setStats(statsData);
            setProfile(prev => prev ? { ...prev, credits: statsData.summary.creditsRemaining } : null);
        }
    } catch (e) {
        console.error("Refresh Profile Error", e);
    }
  };

  const handleSearch = async () => {
    if (!profile || profile.credits <= 0) {
      alert("Créditos insuficientes en WhatsCloud.MX");
      return;
    }
    setScanProgress(0);
    setIsScraping(true);
    try {
      const newLeads = await geminiService.scrapeLeads(filters, (p) => setScanProgress(p));
      if (newLeads.length > 0) {
        // Deduplicate locally just in case
        const unique = Array.from(new Map(newLeads.map(l => [l.id, l])).values());
        setLeads(unique);
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

  const exportLeads = async () => {
    try {
        const token = localStorage.getItem('wc_auth_token');
        const res = await fetch('/api/leads/export', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error('Export failed');
        
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `whatscloud_leads_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
    } catch (e) {
        console.error("Export Error", e);
        alert("Error al exportar leads.");
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out shadow-2xl border-r border-white/5 md:translate-x-0 flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
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
            <SidebarItem icon={<Activity size={18} />} label="Tablero Principal" active={activeModule === 'Dashboard'} onClick={() => setActiveModule('Dashboard')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<Calendar size={18} />} label="CRM y Tareas" active={activeModule === 'SalesTracker'} onClick={() => setActiveModule('SalesTracker')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<Search size={18} />} label="Lead Scrapper" active={activeModule === 'LeadScrapper'} onClick={() => setActiveModule('LeadScrapper')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<MessageSquare size={18} />} label="Inbox de Chat" active={activeModule === 'Inbox'} onClick={() => setActiveModule('Inbox')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<Bot size={18} />} label="BotBuilder IA" active={activeModule === 'BotBuilder'} onClick={() => setActiveModule('BotBuilder')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<ShoppingBag size={18} />} label="Comercio Digital" active={activeModule === 'Commerce'} onClick={() => setActiveModule('Commerce')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<MessageCircle size={18} />} label="SMS Reminder" active={activeModule === 'SMSReminder'} onClick={() => setActiveModule('SMSReminder')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<PhoneCall size={18} />} label="VoIP & PBX" active={activeModule === 'VoiceCampaigns'} onClick={() => setActiveModule('VoiceCampaigns')} setIsSidebarOpen={setIsSidebarOpen} />
            <SidebarItem icon={<Wallet size={18} />} label="Facturación" active={activeModule === 'Billing'} onClick={() => setActiveModule('Billing')} setIsSidebarOpen={setIsSidebarOpen} />
            <div className="pt-4 border-t border-white/5 mt-2">
              <SidebarItem icon={<Radio size={18} />} label="Conexiones" active={activeModule === 'Connections'} onClick={() => setActiveModule('Connections')} setIsSidebarOpen={setIsSidebarOpen} />
              {profile.role === 'SUPER_ADMIN' && <SidebarItem icon={<Shield size={18} className="text-yellow-400" />} label="GOD MODE" active={activeModule === 'AdminPanel'} onClick={() => setActiveModule('AdminPanel')} setIsSidebarOpen={setIsSidebarOpen} />}
            </div>
        </nav>

        {/* MOBILE CLOSE BUTTON */}
        <button 
          className="md:hidden absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X size={20} />
        </button>

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

      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* MOBILE BOTTOM NAVIGATION (PWA OPTIMIZED) */}
      <nav 
        className="md:hidden fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200 z-40 flex justify-around items-center"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)', height: 'calc(4rem + env(safe-area-inset-bottom))' }}
      >
          <MobileNavItem icon={<Activity size={20} />} label="Tablero" active={activeModule === 'Dashboard'} onClick={() => setActiveModule('Dashboard')} />
          <MobileNavItem icon={<Calendar size={20} />} label="Agenda" active={activeModule === 'SalesTracker'} onClick={() => setActiveModule('SalesTracker')} />
          <MobileNavItem icon={<MessageSquare size={20} />} label="Inbox" active={activeModule === 'Inbox'} onClick={() => setActiveModule('Inbox')} />
          <button 
              onClick={() => setIsSidebarOpen(true)}
              className="flex flex-col items-center justify-center w-16 h-full text-slate-400 hover:text-wc-blue transition-colors"
          >
              <Menu size={20} />
              <span className="text-[10px] font-bold mt-1">Más</span>
          </button>
      </nav>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen w-full overflow-hidden">
          <header className="bg-white/90 backdrop-blur-xl sticky top-0 z-30 border-b border-slate-200 h-16 flex items-center justify-between px-4 md:px-8 shadow-sm">
              <div className="flex items-center gap-3">
                  <button 
                    className="md:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    onClick={() => setIsSidebarOpen(true)}
                  >
                      <Hexagon size={24} className="text-wc-blue" />
                  </button>
                  <div className="hidden md:flex items-center gap-2 text-slate-400 text-sm font-medium">
                     <Hexagon size={14} className="text-wc-blue" />
                     <span className="hidden sm:inline">/</span>
                     <span className="text-slate-800 font-black tracking-tight uppercase text-xs">{activeModule}</span>
                     {profile.role === 'SUPER_ADMIN' && <span className="ml-2 hidden lg:inline bg-yellow-400 text-black text-[9px] font-black px-2 py-0.5 rounded shadow-sm">ROOT ACCESS</span>}
                  </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                    onClick={() => setActiveModule('Billing')}
                    className="flex items-center gap-2 bg-slate-100 px-4 py-1.5 rounded-full border border-slate-200 shadow-inner group hover:bg-white hover:border-wc-blue/30 transition-all active:scale-95"
                >
                    <CreditCard size={14} className="text-wc-blue group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-bold text-slate-700">{profile.credits > 9999 ? 'UNLIMITED' : `${profile.credits} CR`}</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Server size={12} className="text-wc-green" /> CLUSTER: WHATSCLOUD-MX-PROD
                </div>
              </div>
          </header>

          <main className="flex-grow p-4 md:p-8 overflow-y-auto bg-[#FBFDFF] pb-24 md:pb-8">
             {activeModule === 'Dashboard' && (
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    <h1 className="text-4xl font-black text-slate-900 mb-8 tracking-tighter">Dashboard <span className="text-wc-blue">Real-Time</span></h1>
                    
                    {/* STATS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Leads Activos" value={stats?.summary.totalLeads || 0} icon={<Database className="text-wc-blue" />} />
                        <StatCard title="Seguimiento Vencido" value={stats?.summary.overdueFollowUps || 0} icon={<AlertCircle className={`animate-pulse ${stats?.summary.overdueFollowUps > 0 ? 'text-red-500' : 'text-slate-300'}`} />} />
                        <StatCard title="Alta Calidad" value={stats?.summary.highQualityLeads || 0} icon={<Zap className="text-wc-green" />} />
                        <StatCard title="Potencial ROI" value={`$${stats?.summary.estimatedROI.toLocaleString() || 0}`} icon={<Activity className="text-wc-purple" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* CRM Pipeline Chart */}
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Clock size={120} />
                             </div>
                             <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Clock size={18} className="text-slate-900" /> Pipeline de Seguimiento
                             </h3>
                             <div className="space-y-4">
                                {['NEW', 'CONTACTED', 'QUALIFIED', 'CLOSING', 'WON', 'LOST'].map(status => {
                                    const entry = stats?.charts.leadsByStatus?.find((s: any) => s.status === status);
                                    const count = entry ? parseInt(entry.count) : 0;
                                    const percentage = (count / (stats?.summary.totalLeads || 1)) * 100;
                                    return (
                                        <div key={status} className="flex items-center gap-4">
                                            <span className="w-24 text-[10px] font-black text-slate-400 uppercase tracking-widest">{status}</span>
                                            <div className="flex-1 h-2 bg-slate-50 rounded-full border border-slate-100 overflow-hidden">
                                                <div 
                                                    className={`h-full transition-all duration-1000 ${
                                                        status === 'WON' ? 'bg-emerald-500' : 
                                                        status === 'LOST' ? 'bg-slate-300' : 
                                                        status === 'NEW' ? 'bg-blue-500' : 'bg-wc-blue'
                                                    }`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="w-8 text-right text-[11px] font-bold text-slate-700">{count}</span>
                                        </div>
                                    );
                                })}
                             </div>
                        </div>

                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Search size={18} className="text-wc-blue" /> Dominancia por Nicho
                            </h3>
                            <div className="space-y-6">
                                {stats?.charts.leadsByNiche.map((n: any) => (
                                    <div key={n.niche} className="group">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-black text-slate-700 uppercase tracking-tighter">{n.niche}</span>
                                            <span className="text-xs font-bold text-wc-blue bg-wc-blue/10 px-2 py-0.5 rounded-full">{n.count} leads</span>
                                        </div>
                                        <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                            <div 
                                                className="h-full bg-wc-gradient transform origin-left transition-transform duration-1000 ease-out" 
                                                style={{ width: `${(n.count / stats.summary.totalLeads) * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                             <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
                                <Settings size={18} className="text-wc-green" /> Distribución AI Scoring
                             </h3>
                             <div className="flex items-end justify-between h-48 gap-4 px-4 pb-4">
                                {stats?.charts.scoreDistribution.map((d: any) => (
                                   <div key={d.name} className="flex-1 flex flex-col items-center gap-2">
                                      <div 
                                        className="w-full bg-slate-100 rounded-t-lg transition-all duration-700 relative group overflow-hidden" 
                                        style={{ height: `${(d.value / (Math.max(...stats.charts.scoreDistribution.map((v:any) => v.value)) || 1)) * 100}%`, minHeight: '4px' }}
                                      >
                                         <div className="absolute inset-x-0 bottom-0 bg-wc-gradient-hover opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                         {d.value > 0 && (
                                           <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-500">
                                             {d.value}
                                           </span>
                                         )}
                                      </div>
                                      <span className="text-[10px] font-bold text-slate-400 rotate-45 lg:rotate-0 mt-2">{d.name}</span>
                                   </div>
                                ))}
                             </div>
                        </div>
                    </div>
                </div>
             )}
             {activeModule === 'LeadScrapper' && (
                 <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {!(leads.length > 0 && !isScraping) && (
                        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                            <div>
                                <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tighter leading-none">
                                    Lead<span className="text-transparent bg-clip-text bg-wc-gradient">Scrapper</span> 2.0
                                </h1>
                                <p className="text-slate-500 text-lg max-w-xl">Genera prospectos de alta calidad con <strong>Inteligencia Artificial</strong> en segundos.</p>
                            </div>
                        </div>
                    )}
                    <FilterPanel filters={filters} setFilters={setFilters} onSearch={handleSearch} isLoading={isScraping} isCompact={leads.length > 0 && !isScraping} />
                    
                    {isScraping && (
                        <div className="mt-8 p-8 bg-white rounded-3xl border border-slate-200 shadow-2xl flex flex-col items-center gap-6 animate-pulse">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                                <Activity size={48} className="text-wc-blue absolute animate-ping opacity-20" />
                                <div className="text-2xl font-black text-slate-900 z-10">{scanProgress}%</div>
                                <svg className="absolute w-full h-full -rotate-90">
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-100" />
                                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-wc-blue" strokeDasharray={364} strokeDashoffset={364 - (364 * scanProgress) / 100} strokeLinecap="round" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <h3 className="text-xl font-bold text-slate-800">Escaneando Cluster Google Maps</h3>
                                <p className="text-sm text-slate-500 mt-1">Extraídos leads reales de <strong>{filters.niche}</strong> en <strong>{filters.city}</strong>.</p>
                            </div>
                            <div className="w-full max-w-md h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full bg-wc-gradient transition-all duration-500" style={{ width: `${scanProgress}%` }}></div>
                            </div>
                        </div>
                    )}

                    {leads.length > 0 && !isScraping && (
                        <div className="space-y-6">
                             <InsightsPanel leads={leads} city={filters.city || 'Mercado Global'} />
                             <PostProcessingToolbar 
                                filters={viewFilters} 
                                setFilters={setViewFilters} 
                                totalResults={leads.length} 
                                visibleResults={processedLeads.length} 
                                selectedCount={selectedLeads.size}
                                onExport={exportLeads}
                             />
                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-20">
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
                                      onUpdate={() => fetchLeads()}
                                    />
                                ))}
                             </div>
                        </div>
                    )}
                 </div>
             )}
             {activeModule === 'Inbox' && (
                <div className="max-w-7xl mx-auto h-[calc(100vh-10rem)]">
                    <h1 className="text-3xl font-black text-slate-900 mb-6 tracking-tighter">Live <span className="text-wc-blue">Inbox</span></h1>
                    <InboxModule />
                </div>
             )}
             {activeModule === 'SalesTracker' && (
                 <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
                    <SalesTrackerModule />
                 </div>
             )}
             {activeModule === 'Commerce' && (
                <div className="max-w-7xl mx-auto h-[calc(100vh-8rem)]">
                    <h1 className="text-4xl font-black text-slate-900 mb-6 tracking-tighter">Gestor de <span className="text-wc-blue">Catálogo y Pedidos</span></h1>
                    <CommerceModule />
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
             {activeModule === 'SMSReminder' && <SMSReminder initialLeads={leads.filter(l => selectedLeads.has(l.id))} accCredits={profile.credits} onSendCampaign={async (config, cost) => {
                 try {
                     const result = await accService.sendSmsCampaign(config, cost);
                     setProfile(prev => prev ? {...prev, credits: result.remainingCredits} : null);
                     alert(result.message || "Campaña SMS enviada exitosamente.");
                 } catch (e) {
                     alert("Error al enviar campaña SMS. Verifica tus créditos o configuración.");
                 }
             }} />}
              {activeModule === 'VoiceCampaigns' && <VoiceCampaigns initialLeads={leads.filter(l => selectedLeads.has(l.id))} accCredits={profile.credits} onSendCampaign={async (config, cost) => {
                  try {
                      const result = await accService.sendVoiceCampaign(config, cost);
                      setProfile(prev => prev ? {...prev, credits: result.remainingCredits} : null);
                      alert(`Campaña "${config.campaignName}" disparada exitosamente en Issabel PBX.`);
                  } catch (e) {
                      alert("Error al lanzar la campaña. Verifica tus créditos y conexión.");
                  }
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
             {activeModule === 'AdminPanel' && <AdminPanel />}
             {activeModule === 'Billing' && <BillingModule 
                 currentCredits={profile.credits} 
                 onRefreshCredits={refreshProfile}
               />}
          </main>
      </div>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick, setIsSidebarOpen }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, setIsSidebarOpen?: (val: boolean) => void }) => (
    <button 
      onClick={() => {
        onClick();
        if (setIsSidebarOpen) setIsSidebarOpen(false);
      }} 
      className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all font-bold text-sm ${active ? 'bg-wc-gradient text-white shadow-lg shadow-wc-blue/20 translate-x-1' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        {icon} <span className="tracking-tight">{label}</span>
    </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`flex flex-col items-center justify-center w-16 h-full transition-colors relative ${active ? 'text-wc-blue' : 'text-slate-400 hover:text-slate-600'}`}
    >
        {icon}
        <span className="text-[10px] font-bold mt-1 tracking-tight">{label}</span>
        {active && <div className="absolute top-0 w-8 h-1 bg-wc-blue rounded-b-full"></div>}
    </button>
);

const StatCard = ({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) => (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">{icon}</div>
        </div>
        <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">{title}</h4>
        <p className="text-3xl font-black text-slate-900">{value}</p>
    </div>
);

export default App;
