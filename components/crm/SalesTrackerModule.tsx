import React, { useState, useEffect } from 'react';
import { OwnerDashboard } from './OwnerDashboard';
import { MobileAgenda } from './MobileAgenda';
import { accService } from '../../services/accService';

export const SalesTrackerModule = () => {
    const [role, setRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkRole = async () => {
            try {
                // Fetch current user logic. 
                // Using validateSubscription to get the simulated cached profile which includes the role
                const profile = await accService.validateSubscription();
                setRole(profile?.role || 'MEMBER');
            } catch (e) {
                setRole('MEMBER');
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

    if (role === 'ACCOUNT_OWNER' || role === 'SUPER_ADMIN') {
        return <OwnerDashboard />; // Admin view with KPI funnel
    }

    // Default to Sales worker view
    return <MobileAgenda />;
};
