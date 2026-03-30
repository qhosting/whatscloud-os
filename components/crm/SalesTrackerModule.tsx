import React, { useState, useEffect } from 'react';
import { OwnerDashboard } from './OwnerDashboard';
import { MobileAgenda } from './MobileAgenda';
import { CrmMetricsPanel } from './CrmMetricsPanel';
import { accService } from '../../services/accService';
import { Calendar, BarChart3, Users, LayoutGrid } from 'lucide-react';

interface SalesTrackerProps {
    onProfileUpdate?: () => void;
}

export const SalesTrackerModule: React.FC<SalesTrackerProps> = ({ onProfileUpdate }) => {
    const [activeTab, setActiveTab] = useState<'PIPELINE' | 'AGENDA' | 'METRICS'>('PIPELINE');
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                // Fetch current user logic. 
                const profile = await accService.validateSubscription();
                const currentRole = profile?.role || 'ACCOUNT_AGENT';
                setRole(currentRole);
                
                // Si es vendedor común, mandarlo directo a Agenda
                if (currentRole === 'ACCOUNT_AGENT') {
                    setActiveTab('AGENDA');
                }
            } catch (e) {
                setRole('MEMBER');
                setActiveTab('AGENDA');
            } finally {
                setLoading(false);
            }
        };
        checkRole();
    }, []);

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center bg-slate-50">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-wc-blue border-t-transparent"></div>
            </div>
        );
    }

    const isAdmin = role === 'ACCOUNT_OWNER' || role === 'SUPER_ADMIN';

    return (
        <div className="flex flex-col h-full bg-[#f8fafc]">
            {/* ── TABS NAVIGATION ── */}
            <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-2 shadow-sm shrink-0">
                 {isAdmin && (
                     <button 
                        onClick={() => setActiveTab('PIPELINE')}
                        className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'PIPELINE' ? 'border-wc-blue text-wc-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                     >
                        <Users size={14} /> Pipeline
                     </button>
                 )}
                 <button 
                    onClick={() => setActiveTab('AGENDA')}
                    className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'AGENDA' ? 'border-wc-blue text-wc-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                 >
                    <Calendar size={14} /> Agenda
                 </button>
                 {isAdmin && (
                     <button 
                        onClick={() => setActiveTab('METRICS')}
                        className={`flex items-center gap-2 px-5 py-4 text-xs font-black uppercase tracking-widest border-b-2 transition-all ${activeTab === 'METRICS' ? 'border-wc-blue text-wc-blue' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                     >
                        <BarChart3 size={14} /> Métricas
                     </button>
                 )}
            </div>

            {/* ── CONTENT AREA ── */}
            <div className="flex-1 overflow-hidden">
                {activeTab === 'PIPELINE' && <OwnerDashboard />}
                {activeTab === 'AGENDA' && <MobileAgenda isAdmin={isAdmin} />}
                {activeTab === 'METRICS' && <CrmMetricsPanel onProfileUpdate={onProfileUpdate} />}
            </div>
        </div>
    );
};

