import React, { useState, useEffect } from 'react';
import { Smartphone, RefreshCw, QrCode, CheckCircle, AlertCircle, PowerOff, Loader2 } from 'lucide-react';
import { accService } from '../services/accService';

interface WahaStatus {
    status: 'STARTING' | 'SCAN_QR_CODE' | 'WORKING' | 'FAILED' | 'STOPPED';
    session?: string;
}

export const WahaConnectionCard = () => {
    const [wahaStatus, setWahaStatus] = useState<WahaStatus>({ status: 'STOPPED' });
    const [qrUrl, setQrUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [polling, setPolling] = useState(false);

    // Initial fetch
    useEffect(() => {
        checkStatus();
    }, []);

    // Polling effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (polling) {
            interval = setInterval(() => {
                checkStatus(true);
            }, 3000); // 3 seconds polling
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [polling]);

    const checkStatus = async (isPolling = false) => {
        if (!isPolling) setLoading(true);
        try {
            const data = await accService.getWahaSessionStatus();
            setWahaStatus(data);
            
            if (data.status === 'SCAN_QR_CODE') {
                setPolling(true);
                // Fetch QR Image
                const blobUrl = await accService.getWahaQrBlobUrl().catch(() => null);
                if (blobUrl) setQrUrl(blobUrl);
            } 
            else if (data.status === 'WORKING') {
                setPolling(false);
                if (qrUrl) setQrUrl(null); // Clear QR memory
            }
            else if (data.status === 'STARTING') {
                setPolling(true);
            }
            else {
                setPolling(false);
            }
        } catch (e) {
            setPolling(false);
        } finally {
            if (!isPolling) setLoading(false);
        }
    };

    const handleConnect = async () => {
        setLoading(true);
        try {
            await accService.startWahaSession();
            setWahaStatus({ status: 'STARTING' });
            setPolling(true);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const handleDisconnect = async () => {
        if (!confirm('¿Estás seguro de desconectar tu línea de WhatsApp? Tendrás que volver a escanear el QR.')) return;
        setLoading(true);
        try {
            await accService.stopWahaSession();
            setWahaStatus({ status: 'STOPPED' });
            setQrUrl(null);
            setPolling(false);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-2xl border-2 border-green-500/20 shadow-lg relative overflow-hidden transition-all">
            <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-sm">
                Motor WAHA
            </div>

            <div className="flex items-start gap-4 mb-4">
                <div className={`p-3 rounded-2xl ${
                    wahaStatus.status === 'WORKING' ? 'bg-green-100 text-green-600' : 
                    wahaStatus.status === 'SCAN_QR_CODE' ? 'bg-blue-100 text-blue-600' :
                    'bg-slate-100 text-slate-500'
                }`}>
                    <Smartphone size={28} />
                </div>
                <div>
                    <h3 className="text-lg font-black text-slate-800">Conexión Core a WAHA</h3>
                    <p className="text-sm font-medium text-slate-500">
                        {wahaStatus.status === 'WORKING' ? 'Línea Privada Conectada' : 
                         wahaStatus.status === 'SCAN_QR_CODE' ? 'Esperando Escaneo...' :
                         'Vincular línea para CRM y Respuestas IA'}
                    </p>
                </div>
            </div>

            {loading && !polling ? (
                <div className="flex justify-center py-6">
                    <Loader2 className="animate-spin text-green-500" size={32} />
                </div>
            ) : (
                <div className="mt-4">
                    {/* STATE: DISCONNECTED */}
                    {(wahaStatus.status === 'STOPPED' || wahaStatus.status === 'FAILED') && (
                        <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
                            <AlertCircle className="text-slate-400 mb-2" size={32} />
                            <p className="text-xs text-slate-500 font-bold mb-4">No hay sesión activa.</p>
                            <button 
                                onClick={handleConnect}
                                className="bg-green-600 hover:bg-green-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-md shadow-green-600/30 flex items-center gap-2 active:scale-95 transition-all"
                            >
                                <QrCode size={18} /> Iniciar Conexión WAHA
                            </button>
                        </div>
                    )}

                    {/* STATE: STARTING */}
                    {wahaStatus.status === 'STARTING' && (
                        <div className="flex flex-col items-center py-6 bg-blue-50/50 rounded-xl border border-blue-100">
                            <RefreshCw className="text-blue-500 animate-spin mb-3" size={32} />
                            <p className="text-sm text-blue-800 font-bold">Generando Código QR...</p>
                            <p className="text-xs text-blue-600 mt-1">Por favor espera un momento.</p>
                        </div>
                    )}

                    {/* STATE: SCAN QR */}
                    {wahaStatus.status === 'SCAN_QR_CODE' && (
                        <div className="flex flex-col items-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                            <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Escanea para vincular</p>
                            
                            {qrUrl ? (
                                <div className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 mb-4">
                                    <img src={qrUrl} alt="WhatsApp QR Code" className="w-56 h-56 object-contain" />
                                </div>
                            ) : (
                                <div className="w-56 h-56 bg-slate-100 animate-pulse rounded-xl mb-4 flex items-center justify-center">
                                    <QrCode className="text-slate-300" size={48} />
                                </div>
                            )}

                            <div className="flex items-center gap-2 text-blue-600 font-bold text-xs bg-blue-50 px-4 py-2 rounded-full">
                                <RefreshCw size={12} className="animate-spin" /> Esperando escaneo desde tu app de WhatsApp...
                            </div>
                        </div>
                    )}

                    {/* STATE: WORKING */}
                    {wahaStatus.status === 'WORKING' && (
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between bg-green-50 px-4 py-3 rounded-xl border border-green-200">
                                <div className="flex items-center gap-2 text-green-700">
                                    <CheckCircle size={18} />
                                    <span className="font-bold text-sm">Sesión Activa ({wahaStatus.session})</span>
                                </div>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                            </div>
                            
                            <button 
                                onClick={handleDisconnect}
                                className="w-full bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-4 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors border border-slate-200 hover:border-red-200"
                            >
                                <PowerOff size={16} /> Desconectar Línea
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
