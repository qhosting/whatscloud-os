import axios from 'axios';
import logger from '../config/logger.js';
import { WhatsAppConnection } from '../models/index.js';

const getWahaUrl = () => process.env.WAHA_URL || 'http://localhost:3000';
const getWahaHeaders = () => {
    const key = process.env.WAHA_API_KEY;
    if (!key || key.trim() === '' || key === 'undefined') return {};
    return { 'X-Api-Key': key };
};
const getTenantSessionName = (orgId) => `tenant_${orgId}`;

export const startWahaSession = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const sessionName = getTenantSessionName(organizationId);
        const wahaUrl = getWahaUrl();

        await axios.post(`${wahaUrl}/api/sessions/start`, {
            name: sessionName,
            config: {
                proxy: null,
                webhooks: [
                    {
                        url: `${process.env.APP_URL || 'http://172.17.0.1:3000'}/webhook/whatsapp`,
                        events: ["message", "session.status"]
                    }
                ]
            }
        }, { headers: getWahaHeaders() }).catch(e => {
            if (e.response && e.response.status === 409) return; // Already exists/starting
            throw e;
        });

        res.json({ success: true, session: sessionName });
    } catch (e) {
        const errorData = e.response?.data;
        logger.error(`[WAHA] start exception: ${e.message} - Data: ${JSON.stringify(errorData)}`);
        res.status(e.response?.status || 500).json({ 
            error: e.message, 
            details: errorData 
        });
    }
};

export const getWahaSessionStatus = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const sessionName = getTenantSessionName(organizationId);
        const wahaUrl = getWahaUrl();

        const statusResponse = await axios.get(`${wahaUrl}/api/sessions/${sessionName}`, {
            headers: getWahaHeaders()
        }).catch(e => null);

        if (!statusResponse || !statusResponse.data) {
            return res.json({ status: 'STOPPED' });
        }

        const sessionData = statusResponse.data;
        const status = sessionData.status;

        res.json({
            status: status,
            session: sessionName
        });
    } catch (e) {
        logger.error(`[WAHA] status exception: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

// Route that pipes the image or base64 to frontend
export const getWahaQr = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const sessionName = getTenantSessionName(organizationId);
        const wahaUrl = getWahaUrl();

        // Get QR as JSON (which contains base64 usually, or we can request image)
        const qrResponse = await axios.get(`${wahaUrl}/api/${sessionName}/auth/qr`, {
            headers: getWahaHeaders(),
            responseType: 'arraybuffer' // force array buffer to pipe image directly
        }).catch(e => null);

        if (!qrResponse || !qrResponse.data) {
            return res.status(404).json({ error: 'QR not ready or session is not in SCAN_QR_CODE state' });
        }

        // Pipe the image
        const contentType = qrResponse.headers['content-type'];
        res.setHeader('Content-Type', contentType || 'image/png');
        res.send(qrResponse.data);
    } catch (e) {
        logger.error(`[WAHA] qr fetch exception: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

export const stopWahaSession = async (req, res) => {
    try {
        const { organizationId } = req.user;
        const sessionName = getTenantSessionName(organizationId);
        const wahaUrl = getWahaUrl();

        await axios.post(`${wahaUrl}/api/sessions/${sessionName}/logout`, {}, {
            headers: getWahaHeaders()
        }).catch(e => null);

        await axios.post(`${wahaUrl}/api/sessions/${sessionName}/stop`, {}, {
            headers: getWahaHeaders()
        }).catch(e => null);

        res.json({ success: true });
    } catch (e) {
        logger.error(`[WAHA] stop exception: ${e.message}`);
        res.status(500).json({ error: e.message });
    }
};

// GLOBAL ADMIN ROUTES
export const getAllWahaSessions = async (req, res) => {
    try {
        const wahaUrl = getWahaUrl();
        const response = await axios.get(`${wahaUrl}/api/sessions`, {
            headers: getWahaHeaders()
        }).catch(e => { throw e; });

        res.json(response.data);
    } catch (e) {
         const errorData = e.response?.data;
         logger.error(`[WAHA Admin] get all sessions error: ${e.message} - Data: ${JSON.stringify(errorData)}`);
         res.status(e.response?.status || 500).json({ 
             error: e.message,
             details: errorData
         });
    }
};

export const deleteWahaSessionAdmin = async (req, res) => {
    try {
        const { session } = req.params;
        const wahaUrl = getWahaUrl();
        
        await axios.post(`${wahaUrl}/api/sessions/${session}/stop`, {}, {
            headers: getWahaHeaders()
        }).catch(e => null);

        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

export const checkWahaHealth = async () => {
    const url = getWahaUrl();
    try {
        const response = await axios.get(`${url}/api/version`, {
            headers: getWahaHeaders(),
            timeout: 5000
        });
        logger.info(`[WAHA] Service is UP at ${url} (Version: ${response.data.version || 'unknown'})`);
        return true;
    } catch (e) {
        logger.error(`[WAHA] Service is DOWN or Unreachable at ${url}. Error: ${e.message}`);
        return false;
    }
};
