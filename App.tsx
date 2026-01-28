import React, { useState, useEffect, useMemo } from 'react';
import { accService } from './services/accService';
import { geminiService } from './services/geminiService';
import { Lead, ACCProfile, SearchFilters, N8NPayload, ACCLeadPayload, UserRole, BotConfig, SMSCampaignConfig, SystemProtocol, VoiceCampaignConfig } from './types';
import { FilterPanel } from './components/FilterPanel';
import { LeadCard } from './components/LeadCard';
import { BotBuilder } from './components/BotBuilder';
import { SMSReminder } from './components/SMSReminder';
import { VoiceCampaigns } from './components/VoiceCampaigns';
import { ConnectionsModule } from './components/ConnectionsModule';
import { AdminPanel } from './components/AdminPanel';
import { InsightsPanel } from './components/InsightsPanel';
import { PostProcessingToolbar, ViewFilters } from './components/PostProcessingToolbar';
import { LandingPage } from './components/LandingPage'; // Import Landing Page

import { 
  CreditCard, 
  Database, 
  Bot, 
  LayoutDashboard, 
  Loader2,
  Code,
  Cloud,
  Search,
  MessageSquare,
  MessageCircle,
  Settings,
  Menu,
  X,
  Shield,
  Lock,
  Radio, 
  Zap,
  Hexagon,
  Activity,
  PhoneCall 
} from 'lucide-react';

// Navigation Modules
type ModuleType = 'LeadScrapper' | 'BotBuilder' | 'SMSReminder' | 'VoiceCampaigns' | 'Connections' | 'AdminPanel';

const App: React.FC = () => {
  // --- VIEW STATE (Landing vs Dashboard) ---
  const [showLanding, setShowLanding] = useState(true);

  // State: System
  const [activeModule, setActiveModule] = useState<ModuleType>('LeadScrapper');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State: User / ACC
  const [profile, setProfile] = useState<ACCProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  
  // State: Scrapper Logic
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [isScraping, setIsScraping] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    niche: '',
    country: '',
    state: '',
    city: '',
    colonia: ''
  });

  // State: Post-Processing Filters (Client Side)
  const [viewFilters, setViewFilters] = useState<ViewFilters>({
    minRating: 0,
    requireEmail: false,
    sortBy: 'relevance'
  });

  // State: Debug/N8N/Protocol
  const [lastN8NPayload, setLastN8NPayload] = useState<N8NPayload | null>(null);
  const [showPayload, setShowPayload] = useState(false);
  const [activeProtocol, setActiveProtocol] = useState<SystemProtocol | null>(null);

  // --- PERSISTENCIA DE DATOS (Singularity Memory) ---
  useEffect(() => {
    // Load leads from local storage on mount
    const savedLeads = localStorage.getItem('wc_leads_cache');
    const savedFilters = localStorage.getItem('wc_filters_cache');
    if (savedLeads) {
        try {
            setLeads(JSON.parse(savedLeads));
        } catch (e) { console.error("Cache Error", e); }
    }
    if (savedFilters) {
        try {
            setFilters(JSON.parse(savedFilters));
        } catch (e) { console.error("Filter Cache Error", e); }
    }
  }, []);

  useEffect(() => {
    // Save leads to local storage on change
    localStorage.setItem('wc_leads_cache', JSON.stringify(leads));
  }, [leads]);

  useEffect(() => {
    // Save filters
    localStorage.setItem('wc_filters_cache', JSON.stringify(filters));
  }, [filters]);


  // --- SAAS RBAC PERMISSIONS SYSTEM ---
  const hasPermission = (action: 'SCRAPE' | 'EXPORT_DATA' | 'MANAGE_CHANNELS' | 'VIEW_DEBUG' | 'ADMIN_ACTIONS') => {
    if (!profile) return false;
    const { role } = profile;

    switch (action) {
      // TODOS pueden usar la herramienta principal si tienen créditos
      case 'SCRAPE':
        return ['SUPER_ADMIN', 'PLATFORM_SUPPORT', 'ACCOUNT_OWNER', 'ACCOUNT_AGENT'].includes(role);
      
      // PRIVACIDAD: Solo el DUEÑO del negocio puede exportar SU base de datos
      case 'EXPORT_DATA':
        return ['ACCOUNT_OWNER'].includes(role); 
      
      // INFRAESTRUCTURA: Plataforma y Dueños pueden configurar canales
      case 'MANAGE_CHANNELS':
        return ['SUPER_ADMIN', 'PLATFORM_SUPPORT', 'ACCOUNT_OWNER'].includes(role);
      
      // TÉCNICO: Solo el Super Admin ve los logs crudos
      case 'VIEW_DEBUG':
        return ['SUPER_ADMIN'].includes(role);
        
      // GESTIÓN CRÍTICA: Solo Super Admin puede regalar créditos o impersonar
      case 'ADMIN_ACTIONS':
        return ['SUPER_ADMIN'].includes(role);

      default:
        return false;
    }
  };

  // 1. Handshake Inicial con ACC (Singularity Operativa)
  // MODIFICADO: Solo ejecuta si NO estamos en la Landing Page
  useEffect(() => {
    if (showLanding) return; // Wait for login

    const initSession = async () => {
      setLoadingProfile(true);
      try {
        const userProfile = await accService.validateSubscription();
        setProfile(userProfile);
        // Only override filters if empty to respect persistence
        if(!filters.city) {
            setFilters({
            niche: '',
            ...userProfile.defaultLocation
            });
        }
      } catch (error) {
        console.error("Error connecting to ACC [Protocol 8888 Triggered]:", error);
        alert("Error de autenticación con Aurum Control Center. Verifica tu suscripción.");
      } finally {
        setLoadingProfile(false);
      }
    };
    initSession();
  }, [showLanding]); // Run when showLanding changes to false

  // Handler: Seleccionar Lead
  const toggleSelectLead = (id: string) => {
    const newSelected = new Set(selectedLeads);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLeads(newSelected);
  };

  // Logic: Select All (Filtered Only)
  const toggleSelectAll = () => {
    const allVisibleSelected = processedLeads.every(l => selectedLeads.has(l.id));

    if (allVisibleSelected && processedLeads.length > 0) {
        setSelectedLeads(new Set());
    } else {
        const newSet = new Set(selectedLeads);
        processedLeads.forEach(l => newSet.add(l.id));
        setSelectedLeads(newSet);
    }
  };

  // 3. Ejecutar Scraper (Protocolo de Abundancia: 318 798)
  const handleSearch = async () => {
    if (!profile) return;
    if (!hasPermission('SCRAPE')) {
      alert("No tienes permisos para realizar scraping.");
      return;
    }
    if (profile.credits <= 0) {
      alert("Créditos insuficientes en tu cuenta ACC.");
      return;
    }

    setIsScraping(true);
    setLeads([]);
    // Reset view filters on new search
    setViewFilters({ minRating: 0, requireEmail: false, sortBy: 'relevance' });
    
    try {
      const newLeads = await geminiService.scrapeLeads(filters);
      const leadsFound = newLeads.length;
      
      if (leadsFound > 0) {
        const creditsToDeduct = 1; 
        const remainingCredits = await accService.deductCredits(creditsToDeduct);
        
        setProfile(prev => prev ? ({ ...prev, credits: remainingCredits }) : null);
        setLeads(newLeads);

        // N8N: Deduction uses Success Protocol (transaction completed)
        generateN8NPayload('deduct_credits', {
          leads_extracted: leadsFound,
          credits_deducted: creditsToDeduct,
          new_balance: remainingCredits,
          location: `${filters.colonia}, ${filters.city}`
        });
      }
      
    } catch (error) {
      console.error(error);
      alert("Error durante la extracción.");
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


  // COMPUTED: Process Leads (Filter & Sort)
  const processedLeads = useMemo(() => {
    let result = [...leads];

    // Filter
    if (viewFilters.minRating > 0) {
        result = result.filter(l => (l.rating || 0) >= viewFilters.minRating);
    }
    if (viewFilters.requireEmail) {
        result = result.filter(l => l.email && l.email.length > 0);
    }

    // Sort
    result.sort((a, b) => {
        if (viewFilters.sortBy === 'rating') {
            return (b.rating || 0) - (a.rating || 0);
        }
        if (viewFilters.sortBy === 'reviews') {
            return (b.reviews || 0) - (a.reviews || 0);
        }
        return 0; // relevance (default order)
    });

    return result;
  }, [leads, viewFilters]);


  // Acción: Transformar data a formato Strict ACC y enviar
  const handleSendToWhatsCloud = () => {
    const leadsToSend = processedLeads.filter(l => selectedLeads.has(l.id));
    if (leadsToSend.length === 0) return;

    setLeads(prev => prev.map(l => selectedLeads.has(l.id) ? { ...l, status: 'exported_wc' } : l));
    setSelectedLeads(new Set());

    // ACC Strict Adaptation
    const accPayloads: ACCLeadPayload[] = leadsToSend.map(lead => ({
      lead_info: {
        name: lead.businessName,
        rating: lead.rating || 0,
        reviews: lead.reviews || 0,
        address: lead.address,
        phone: lead.phone,
        maps_url: lead.mapsUrl || '',
        email: lead.email
      },
      acc_meta: {
        source: "Google Maps Scrapper",
        Ubicacion: lead.address,
        status: "raw_lead"
      }
    }));

    // Trigger Abundance Protocol (Flow of data)
    generateN8NPayload('update_leads', {
      destination: 'whatscloud_db',
      payloads: accPayloads
    });
    
    alert(`${leadsToSend.length} leads enviados al Autorespondedor IA (Waha/Chatwoot).`);
  };

  const handleExportCRM = () => {
    const leadsToExport = processedLeads.filter(l => selectedLeads.has(l.id));
    if (leadsToExport.length === 0) return;

    if (!hasPermission('EXPORT_DATA')) {
        alert("ACCESO DENEGADO: Solo el Dueño de la Cuenta (Account Owner) puede exportar la base de datos por motivos de seguridad.");
        return;
    }

    setLeads(prev => prev.map(l => selectedLeads.has(l.id) ? { ...l, status: 'exported_crm' } : l));
    setSelectedLeads(new Set());

    generateN8NPayload('update_leads', {
      destination: 'external_crm_api',
      leads: leadsToExport
    });

    alert(`${leadsToExport.length} leads exportados al sistema externo.`);
  };

  // --- CONNECTIONS HANDLER ---
  const handleCreateChannel = (data: { name: string; phoneNumber: string }) => {
    if (!profile) return;
    if (!hasPermission('MANAGE_CHANNELS')) {
      alert("No tienes permisos para crear canales.");
      return;
    }

    generateN8NPayload('create_channel', {
      channel_type: 'whatsapp_api',
      name: data.name,
      identifier: data.phoneNumber,
      waha_config: {
        auto_pair: true
      }
    });

    alert("Solicitud de creación enviada. N8N aprovisionará el inbox en Chatwoot en breve.");
  };

  const handleLinkExtension = (extension: string) => {
    if (!profile) return;
    
    // Update Local State for UI
    setProfile({...profile, pbxExtension: extension});

    // Update N8N
    generateN8NPayload('link_extension', {
        acc_user_id: profile.userId,
        sip_extension: extension,
        context: 'from-internal'
    });
    alert(`Extensión ${extension} vinculada a tu cuenta.`);
  };

  // --- BOT BUILDER SAVE HANDLER ---
  const handleSaveBotConfig = (config: BotConfig) => {
    // Protocolo de Éxito (Configuración exitosa)
    generateN8NPayload('bot_flow', {
      status: 'active',
      ...config
    });
    alert("Configuración de Bot Guardada (JSON enviado a n8n).");
  };

  // --- SMS CAMPAIGN HANDLER ---
  const handleSendSMSCampaign = async (config: SMSCampaignConfig, cost: number) => {
    if (!profile) return;
    
    const remainingCredits = await accService.deductCredits(cost);
    setProfile(prev => prev ? ({ ...prev, credits: remainingCredits }) : null);

    generateN8NPayload('sms_campaign', {
      campaign_name: config.campaignName,
      message_template: config.message,
      audience_size: config.audience.length,
      credits_used: cost,
      provider: 'LabsMobile',
      scheduled: config.scheduledDate || 'now'
    });

    alert(`Campaña SMS enviada. Costo: ${cost} créditos.`);
  };

  // --- VOICE CAMPAIGN HANDLER ---
  const handleSendVoiceCampaign = async (config: VoiceCampaignConfig, cost: number) => {
    if (!profile) return;

    const remainingCredits = await accService.deductCredits(cost);
    setProfile(prev => prev ? ({ ...prev, credits: remainingCredits }) : null);

    generateN8NPayload('voice_campaign', {
        campaign_name: config.campaignName,
        type: config.type,
        tts_text: config.ttsText,
        audio_file: config.audioFileName,
        audience_size: config.audience.length,
        credits_used: cost,
        provider: 'Issabel PBX Trunk',
        scheduled: config.scheduledDate || 'now'
    });

    alert(`Campaña de Voz lanzada. Costo: ${cost} créditos.`);
  };

  // --- ADMIN: ADD CREDITS ---
  const handleAddTestCredits = () => {
    if(hasPermission('ADMIN_ACTIONS') && profile) {
        setProfile({...profile, credits: profile.credits + 100});
        generateN8NPayload('admin_adjust_credits', { amount: 100, reason: 'Manual adjustment by Super Admin' });
    }
  };

  // --- ADMIN: SYNC ACC HUB ---
  const handleSyncACC = () => {
      // Logic for God Mode Sync
      generateN8NPayload('acc_sync_config', { timestamp: new Date(), target: 'MAIN_HUB' });
      alert("Comando de Sincronización Global enviado al ACC.");
  };

  // --- CORE SYSTEM: N8N PAYLOAD GENERATOR WITH PROTOCOLS ---
  const generateN8NPayload = (action: N8NPayload['action'], data: any) => {
    if (!profile) return;

    // Determine Grabovoi Protocol based on Action
    let protocol: SystemProtocol = 'SUCCESS_519_7148'; // Default: Success
    
    switch (action) {
      case 'update_leads':
      case 'sms_campaign':
      case 'voice_campaign':
      case 'initiate_call':
        protocol = 'ABUNDANCE_318_798'; // Generating flow/leads/money
        break;
      case 'admin_adjust_credits':
      case 'acc_sync_config':
        protocol = 'PROTECTION_8888'; // Administrative/Safety
        break;
      case 'deduct_credits':
      case 'bot_flow':
      case 'create_channel':
      case 'link_extension':
        protocol = 'SUCCESS_519_7148'; // Completing setup/transaction
        break;
    }

    const payload: N8NPayload = {
      action,
      userId: profile.userId,
      timestamp: new Date().toISOString(),
      module: activeModule,
      role: profile.role,
      holding_identity: {
        entity: 'Aurum Capital Holding',
        engine: 'WhatsCloud Ecosistema',
        active_protocol: protocol
      },
      data
    };
    
    // Set Visual State
    setActiveProtocol(protocol);
    setTimeout(() => setActiveProtocol(null), 3000); // Visual Pulse for 3 seconds

    setLastN8NPayload(payload);
  };

  // --- RENDER LANDING PAGE IF NOT LOGGED IN ---
  if (showLanding) {
    return <LandingPage onEnter={() => setShowLanding(false)} />;
  }

  // --- LOADING STATE (For Dashboard Handshake) ---
  if (loadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-wc-blue">
        <div className="relative">
           <div className="absolute inset-0 bg-wc-gradient blur-xl opacity-20 rounded-full"></div>
           <Loader2 className="animate-spin mb-4 relative z-10" size={48} />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Aurum Capital Holding</h2>
        <p className="text-slate-500 mt-2 text-xs uppercase tracking-widest font-semibold">WhatsCloud Singularity Operativa</p>
        <p className="text-[10px] text-slate-400 mt-4">Protocol: 519 7148 (Handshake...)</p>
      </div>
    );
  }

  // Helper to render Role Badge
  const RoleBadge = ({ role }: { role: UserRole }) => {
    const roleConfig = {
      SUPER_ADMIN: { label: 'GOD MODE', className: 'bg-black text-yellow-400 border-yellow-500 shadow-sm' },
      PLATFORM_SUPPORT: { label: 'STAFF WC', className: 'bg-wc-blue text-white border-blue-400' },
      ACCOUNT_OWNER: { label: 'OWNER', className: 'bg-purple-100 text-purple-700 border-purple-200' },
      ACCOUNT_AGENT: { label: 'AGENT', className: 'bg-slate-100 text-slate-600 border-slate-200' },
    };
    
    const config = roleConfig[role];

    return (
      <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold border uppercase tracking-wider flex items-center justify-center gap-1 ${config.className}`}>
        {role === 'SUPER_ADMIN' && <Zap size={10} fill="currentColor" />}
        {config.label}
      </span>
    );
  };

  // Helper: Filter selected leads for SMS Injection (From filtered list or global?)
  // Let's allow global selection across filters, but currently leads state holds all.
  const getSelectedLeads = () => {
    return leads.filter(l => selectedLeads.has(l.id));
  };

  return (
    <div className="min-h-screen flex font-sans bg-slate-50">
      
      {/* PROTOCOL HUD (Visual Layer) */}
      {activeProtocol && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in duration-500 pointer-events-none">
           <div className={`px-6 py-2 rounded-full border shadow-2xl backdrop-blur-md flex items-center gap-3
               ${activeProtocol === 'ABUNDANCE_318_798' ? 'bg-yellow-500/10 border-yellow-500 text-yellow-600' :
                 activeProtocol === 'SUCCESS_519_7148' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600' :
                 activeProtocol === 'PROTECTION_8888' ? 'bg-slate-900/90 border-yellow-500 text-yellow-400' :
                 'bg-indigo-500/10 border-indigo-500 text-indigo-600'
               }
           `}>
               <Activity size={18} className="animate-pulse" />
               <div className="flex flex-col">
                   <span className="text-[10px] font-bold uppercase tracking-widest">Protocol Active</span>
                   <span className="font-mono text-xs font-bold">{activeProtocol.replace(/_/g, ' ')}</span>
               </div>
           </div>
        </div>
      )}

      {/* SIDEBAR NAVIGATION (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col bg-slate-900 text-white fixed h-full z-20 shadow-xl">
        
        {/* HOLDING IDENTITY HEADER */}
        <div className="p-6 border-b border-slate-800">
           <div className="flex items-center gap-2 mb-2">
               <Hexagon size={16} className="text-yellow-500" fill="currentColor" />
               <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Aurum Capital</span>
           </div>
           <div className="flex items-center gap-2">
             <div className="bg-white/10 p-1.5 rounded-lg">
                  <Cloud className="text-wc-blue fill-wc-blue/20" />
              </div>
             <span className="font-bold text-xl tracking-tight">WhatsCloud</span>
           </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
            <SidebarItem 
                icon={<Search size={20} />} 
                label="Lead Scrapper" 
                active={activeModule === 'LeadScrapper'}
                onClick={() => setActiveModule('LeadScrapper')}
            />
            <SidebarItem 
                icon={<MessageSquare size={20} />} 
                label="BotBuilder IA" 
                active={activeModule === 'BotBuilder'}
                onClick={() => setActiveModule('BotBuilder')}
            />
            <SidebarItem 
                icon={<MessageCircle size={20} />} 
                label="SMS Reminder" 
                active={activeModule === 'SMSReminder'}
                onClick={() => setActiveModule('SMSReminder')}
            />
            <SidebarItem 
                icon={<PhoneCall size={20} />} 
                label="VoIP & PBX" 
                active={activeModule === 'VoiceCampaigns'}
                onClick={() => setActiveModule('VoiceCampaigns')}
            />
            <div className="pt-4 border-t border-slate-800 mt-2">
              <SidebarItem 
                  icon={<Radio size={20} />} 
                  label="Conexiones" 
                  active={activeModule === 'Connections'}
                  onClick={() => setActiveModule('Connections')}
              />
              {/* GOD MODE ITEM */}
              {hasPermission('ADMIN_ACTIONS') && (
                <div className="animate-in fade-in slide-in-from-left-2 delay-300">
                    <SidebarItem 
                        icon={<Shield size={20} className="text-yellow-400" />} 
                        label="GOD MODE (Admin)" 
                        active={activeModule === 'AdminPanel'}
                        onClick={() => setActiveModule('AdminPanel')}
                    />
                </div>
              )}
            </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            {/* PROTOCOL STATUS */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 mb-4 px-1">
              <span>System Protocol:</span>
              <span className={`font-mono transition-colors duration-500 ${activeProtocol ? 'text-white' : 'text-emerald-500'}`}>
                {activeProtocol ? 'ACTIVE...' : '519 7148'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-wc-gradient rounded-full flex items-center justify-center font-bold text-xs">
                      {profile?.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{profile?.name}</p>
                      <p className="text-xs text-slate-400 truncate">ACC: {profile?.userId}</p>
                  </div>
                  <Settings size={16} className="text-slate-500 cursor-pointer hover:text-white" />
                </div>
                {profile && (
                  <div className="mt-1 flex justify-between items-center">
                    <RoleBadge role={profile.role} />
                    {/* Admin Secret Button */}
                    {hasPermission('ADMIN_ACTIONS') && (
                        <button 
                            onClick={handleAddTestCredits}
                            className="text-[10px] text-yellow-500 hover:text-yellow-400 underline"
                            title="Super Admin: Add 100 Credits"
                        >
                            +Credit
                        </button>
                    )}
                  </div>
                )}
            </div>
        </div>
      </aside>

      {/* MOBILE HEADER & CONTENT WRAPPER */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          
          {/* TOP HEADER */}
          <header className="bg-white sticky top-0 z-10 shadow-sm border-b border-slate-200">
            <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              
              {/* Mobile Menu Trigger */}
              <div className="flex items-center gap-4 md:hidden">
                 <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600">
                    {isMobileMenuOpen ? <X /> : <Menu />}
                 </button>
                 <span className="font-bold text-lg text-slate-800">WhatsCloud</span>
              </div>

              {/* Breadcrumb / Title (Desktop) */}
              <div className="hidden md:flex items-center gap-2 text-slate-500 text-sm">
                 <Hexagon size={14} className="text-slate-300" />
                 <span>/</span>
                 <span className="font-semibold text-slate-800">{activeModule.replace(/([A-Z])/g, ' $1').trim()}</span>
              </div>

              {/* Credits & ACC Status */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
                    <CreditCard size={14} className="text-wc-blue" />
                    <span className="text-xs font-bold text-slate-700">{profile?.credits} Créditos</span>
                </div>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium border border-emerald-200 uppercase">
                    {profile?.subscriptionStatus}
                </span>
              </div>
            </div>
          </header>

          {/* MAIN MODULE CONTENT */}
          <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
             
             {/* MODULE: LEAD SCRAPPER */}
             {activeModule === 'LeadScrapper' && (
                 <div className="max-w-7xl mx-auto animate-in fade-in duration-300">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">
                            Google Maps <span className="text-transparent bg-clip-text bg-wc-gradient">Extractor</span>
                        </h1>
                        <p className="text-slate-500 text-lg">Busca negocios, extrae ratings y sincroniza con tu WAHA.</p>
                        {!hasPermission('SCRAPE') && (
                          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                            <Shield size={16} />
                            Tu rol de <span className="font-bold">{profile?.role}</span> no permite realizar nuevas extracciones.
                          </div>
                        )}
                    </div>

                    <FilterPanel 
                        filters={filters} 
                        setFilters={setFilters} 
                        onSearch={handleSearch}
                        isLoading={isScraping}
                    />

                    {isScraping && (
                        <div className="my-12 text-center">
                            <div className="inline-block relative">
                                <div className="absolute inset-0 bg-wc-gradient blur-xl opacity-20 rounded-full"></div>
                                <Loader2 className="animate-spin text-wc-blue relative z-10" size={48} />
                            </div>
                            <h3 className="mt-4 font-semibold text-slate-700">Analizando Google Maps en {filters.city}...</h3>
                            <p className="text-slate-400 text-sm">Protocol 318 798: Activando Flujo de Abundancia</p>
                        </div>
                    )}

                    {!isScraping && leads.length > 0 && (
                        <div className="space-y-6">
                             
                             {/* SECTION 1: MARKET INTELLIGENCE */}
                             <InsightsPanel leads={leads} city={filters.city || 'la zona'} />

                             {/* SECTION 2: RESULTS TOOLBAR & FILTERS */}
                             <PostProcessingToolbar 
                               filters={viewFilters}
                               setFilters={setViewFilters}
                               totalResults={leads.length}
                               visibleResults={processedLeads.length}
                             />

                             {/* SECTION 3: BULK ACTIONS */}
                             <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-100">
                                <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <input 
                                    type="checkbox" 
                                    className="w-5 h-5 text-wc-blue rounded border-slate-300 focus:ring-wc-blue"
                                    // Check if all VISIBLE leads are selected
                                    checked={processedLeads.length > 0 && processedLeads.every(l => selectedLeads.has(l.id))}
                                    onChange={toggleSelectAll}
                                    />
                                    <span className="text-sm font-medium text-slate-600">
                                    {selectedLeads.size} leads seleccionados
                                    </span>
                                </div>
                                </div>

                                <div className="flex gap-3 mt-3 sm:mt-0 w-full sm:w-auto">
                                <button 
                                    onClick={handleSendToWhatsCloud}
                                    disabled={selectedLeads.size === 0 || !hasPermission('SCRAPE')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-wc-green hover:bg-emerald-600 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-semibold rounded-lg transition-all shadow-sm"
                                >
                                    <Bot size={18} />
                                    Enviar a WAHA
                                </button>
                                
                                <button 
                                    onClick={handleExportCRM}
                                    disabled={selectedLeads.size === 0 || !hasPermission('EXPORT_DATA')}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-slate-300 hover:border-wc-blue text-slate-700 disabled:text-slate-300 text-sm font-semibold rounded-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed group"
                                    title={!hasPermission('EXPORT_DATA') ? "Acceso restringido a Dueños de Cuenta" : "Exportar JSON"}
                                >
                                    {!hasPermission('EXPORT_DATA') ? <Lock size={14} className="text-red-400" /> : <Database size={18} />}
                                    <span>Exportar JSON</span>
                                </button>
                                </div>
                            </div>

                             {/* SECTION 4: GRID */}
                             {processedLeads.length === 0 ? (
                               <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                  <p className="text-slate-500">No hay resultados que coincidan con tus filtros actuales.</p>
                                  <button onClick={() => setViewFilters({minRating: 0, requireEmail: false, sortBy: 'relevance'})} className="mt-2 text-wc-blue text-sm font-bold hover:underline">Limpiar Filtros</button>
                               </div>
                             ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {processedLeads.map(lead => (
                                    <LeadCard 
                                        key={lead.id} 
                                        lead={lead} 
                                        selected={selectedLeads.has(lead.id)}
                                        onSelect={toggleSelectLead}
                                        onAnalyze={handleAnalyzeLead}
                                        onCall={handleClickToCall} // CLICK TO CALL INJECTED
                                    />
                                    ))}
                                </div>
                             )}
                        </div>
                    )}
                 </div>
             )}

             {/* MODULE: BOT BUILDER */}
             {activeModule === 'BotBuilder' && profile && (
                 <BotBuilder onSave={handleSaveBotConfig} role={profile.role} />
             )}

             {/* MODULE: SMS REMINDER */}
             {activeModule === 'SMSReminder' && profile && (
                 <SMSReminder 
                    initialLeads={getSelectedLeads()}
                    accCredits={profile.credits}
                    onSendCampaign={handleSendSMSCampaign}
                 />
             )}

             {/* MODULE: VOICE CAMPAIGNS (NEW) */}
             {activeModule === 'VoiceCampaigns' && profile && (
                 <VoiceCampaigns
                    initialLeads={getSelectedLeads()}
                    accCredits={profile.credits}
                    onSendCampaign={handleSendVoiceCampaign}
                 />
             )}
             
             {/* MODULE: CONNECTIONS (UPDATED) */}
             {activeModule === 'Connections' && profile && (
               <ConnectionsModule 
                onCreateChannel={handleCreateChannel} 
                role={profile.role}
                onLinkExtension={handleLinkExtension}
                currentExtension={profile.pbxExtension}
               />
             )}

             {/* MODULE: ADMIN PANEL (GOD MODE) */}
             {activeModule === 'AdminPanel' && profile && hasPermission('ADMIN_ACTIONS') && (
                 <AdminPanel onSyncACC={handleSyncACC} />
             )}

             {/* N8N Payload Viewer (SUPER_ADMIN ONLY) */}
             {hasPermission('VIEW_DEBUG') && (
                <div className="mt-12 border-t pt-6">
                    <button 
                    onClick={() => setShowPayload(!showPayload)}
                    className="flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-wc-blue transition-colors"
                    >
                    <Code size={14} />
                    {showPayload ? 'Hide System JSON (Super Admin)' : 'Show System JSON (Super Admin)'}
                    </button>
                    
                    {showPayload && lastN8NPayload && (
                    <div className="mt-4 bg-slate-900 text-emerald-400 p-4 rounded-lg text-xs font-mono overflow-auto shadow-inner max-h-60 border border-slate-800">
                        <pre>{JSON.stringify(lastN8NPayload, null, 2)}</pre>
                    </div>
                    )}
                </div>
             )}

          </main>
      </div>

      {/* MOBILE MENU OVERLAY */}
      {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 md:hidden bg-slate-900 text-white flex flex-col p-6 animate-in slide-in-from-left duration-200">
              <div className="flex justify-between items-center mb-8">
                  <span className="font-bold text-xl">WhatsCloud</span>
                  <button onClick={() => setIsMobileMenuOpen(false)}><X /></button>
              </div>
              <nav className="space-y-4">
                <SidebarItem icon={<Search />} label="Lead Scrapper" active={activeModule === 'LeadScrapper'} onClick={() => {setActiveModule('LeadScrapper'); setIsMobileMenuOpen(false)}} />
                <SidebarItem icon={<MessageSquare />} label="BotBuilder" active={activeModule === 'BotBuilder'} onClick={() => {setActiveModule('BotBuilder'); setIsMobileMenuOpen(false)}} />
                <SidebarItem icon={<MessageCircle />} label="SMS Reminder" active={activeModule === 'SMSReminder'} onClick={() => {setActiveModule('SMSReminder'); setIsMobileMenuOpen(false)}} />
                <SidebarItem icon={<PhoneCall />} label="VoIP & PBX" active={activeModule === 'VoiceCampaigns'} onClick={() => {setActiveModule('VoiceCampaigns'); setIsMobileMenuOpen(false)}} />
                <SidebarItem icon={<Radio />} label="Conexiones" active={activeModule === 'Connections'} onClick={() => {setActiveModule('Connections'); setIsMobileMenuOpen(false)}} />
                {hasPermission('ADMIN_ACTIONS') && (
                    <SidebarItem icon={<Shield className="text-yellow-400" />} label="GOD MODE" active={activeModule === 'AdminPanel'} onClick={() => {setActiveModule('AdminPanel'); setIsMobileMenuOpen(false)}} />
                )}
              </nav>
          </div>
      )}
    </div>
  );
};

// Sidebar Helper Component
const SidebarItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm
        ${active ? 'bg-wc-gradient text-white shadow-lg shadow-wc-blue/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default App;