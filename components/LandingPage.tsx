import React from 'react';
import { 
  Bot, 
  Search, 
  MessageCircle, 
  Zap, 
  Globe, 
  CheckCircle2, 
  ArrowRight, 
  Shield, 
  Database,
  BarChart3,
  PhoneCall
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnter }) => {
  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-wc-purple selection:text-white overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-wc-gradient flex items-center justify-center">
               <Globe className="text-white" size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">WhatsCloud<span className="text-wc-blue">.MX</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Soluciones</a>
            <a href="#engine" className="hover:text-white transition-colors">Motor IA</a>
            <a href="#pricing" className="hover:text-white transition-colors">Precios</a>
          </div>
          <button 
            onClick={onEnter}
            className="px-5 py-2.5 bg-white text-slate-950 font-bold rounded-lg hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm"
          >
            Console Login <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl opacity-20 pointer-events-none">
           <div className="absolute top-20 left-10 w-96 h-96 bg-wc-purple rounded-full blur-[128px]"></div>
           <div className="absolute top-40 right-10 w-96 h-96 bg-wc-blue rounded-full blur-[128px]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-wc-green text-xs font-bold mb-6 animate-in fade-in slide-in-from-bottom-4">
            <Zap size={12} fill="currentColor" />
            NUEVO: Protocolo 8888 Activado
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold tracking-tight mb-6 leading-tight animate-in fade-in slide-in-from-bottom-6 duration-700">
            Automatización Total <br />
            <span className="text-transparent bg-clip-text bg-wc-gradient">Sin Límites Técnicos.</span>
          </h1>
          
          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            El ecosistema definitivo que combina <strong>Google Maps Scraping</strong>, <strong>Gemini IA</strong> y <strong>Marketing Omnicanal</strong> en una sola consola. Diseñado para escalas masivas.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
            <button 
              onClick={onEnter}
              className="w-full sm:w-auto px-8 py-4 bg-wc-gradient text-white font-bold rounded-xl shadow-lg shadow-wc-blue/25 hover:scale-105 transition-transform flex items-center justify-center gap-2"
            >
              Iniciar Ecosistema <Zap size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 text-slate-300 font-bold rounded-xl hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
              <PhoneCall size={18} /> Agendar Demo
            </button>
          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW (Mockup) */}
      <section className="px-4 mb-24">
        <div className="max-w-6xl mx-auto bg-slate-900 rounded-2xl border border-slate-800 p-2 shadow-2xl relative">
           <div className="absolute -inset-1 bg-wc-gradient rounded-2xl blur opacity-20"></div>
           <div className="relative bg-slate-900 rounded-xl overflow-hidden aspect-video border border-slate-800 flex items-center justify-center group">
               {/* Abstract UI Representation */}
               <div className="absolute inset-0 bg-[url('https://cdn.dribbble.com/users/1615584/screenshots/15710288/media/6c7a72cb7f785a1a1cf274836b761765.jpg?resize=1600x1200&vertical=center')] bg-cover bg-center opacity-80 group-hover:scale-105 transition-transform duration-700"></div>
               <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="text-center">
                     <p className="text-sm font-mono text-wc-green mb-2">System Status: ONLINE</p>
                     <h3 className="text-3xl font-bold">Aurum Control Center</h3>
                     <button onClick={onEnter} className="mt-4 text-sm underline hover:text-wc-blue">Click para acceder</button>
                  </div>
               </div>
           </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="features" className="py-24 bg-slate-950 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Módulos de Poder</h2>
            <p className="text-slate-400">Herramientas integradas para dominar tu mercado.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Search className="text-wc-blue" size={32} />}
              title="Lead Scrapper 2.0"
              desc="Extrae miles de prospectos de Google Maps con inteligencia artificial. Obtén teléfonos, emails, redes sociales y análisis de estrategia."
            />
            <FeatureCard 
              icon={<Bot className="text-wc-purple" size={32} />}
              title="BotBuilder Neural"
              desc="Crea flujos de chat avanzados con memoria a largo plazo. El bot recuerda nombres, gustos y contextos pasados."
            />
            <FeatureCard 
              icon={<MessageCircle className="text-wc-green" size={32} />}
              title="Marketing Omnicanal"
              desc="SMS masivos, Robocalling con IA y WhatsApp API. Todo conectado para maximizar tu tasa de conversión."
            />
          </div>
        </div>
      </section>

      {/* STATS / TRUST */}
      <section className="py-20 border-y border-slate-900 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <StatItem value="1.2M+" label="Leads Extraídos" />
            <StatItem value="99.9%" label="Uptime Garantizado" />
            <StatItem value="150+" label="Empresas Activas" />
            <StatItem value="50x" label="ROI Promedio" />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 border-t border-slate-900 bg-slate-950 text-slate-500 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Globe size={16} />
            <span className="font-bold text-slate-300">WhatsCloud.MX</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white">Términos</a>
            <a href="#" className="hover:text-white">Privacidad</a>
            <a href="#" className="hover:text-white">Soporte</a>
          </div>
          <div>
            &copy; 2024 Aurum Capital Holding.
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-wc-blue/50 transition-colors group">
    <div className="mb-6 p-4 bg-slate-950 rounded-xl w-fit border border-slate-800 group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-3 text-slate-100">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);

const StatItem = ({ value, label }: { value: string, label: string }) => (
  <div>
    <div className="text-4xl font-bold text-transparent bg-clip-text bg-white mb-1">{value}</div>
    <div className="text-xs uppercase tracking-widest font-bold text-slate-500">{label}</div>
  </div>
);