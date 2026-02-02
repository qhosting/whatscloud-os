import AmiClient from 'asterisk-manager';

let ami = null;

// Configurar conexión AMI solo si existen credenciales
const AMI_HOST = process.env.AMI_HOST?.trim();
const AMI_USER = process.env.AMI_USER?.trim();
const AMI_SECRET = process.env.AMI_SECRET?.trim();

if (AMI_HOST && AMI_USER && AMI_SECRET) {
    console.log(`[AMI] Initializing connection to ${AMI_HOST}...`);
    ami = new AmiClient(
        process.env.AMI_PORT || 5038,
        AMI_HOST,
        AMI_USER,
        AMI_SECRET
    );

    // Keep alive / Error handling
    ami.keepConnected();
    ami.on('error', (err) => console.error('[AMI] Error:', err.message)); // Reduced log noise
    ami.on('connect', () => console.log('[AMI] Connected successfully'));
} else {
    console.log('[AMI] VoIP Integration Disabled (Missing AMI_HOST/USER/SECRET)');
}

export const initiateCall = async (req, res) => {
    if (!ami) {
        return res.status(503).json({ error: 'VoIP Service Unavailable (Not Configured)' });
    }

    const { destination, extension, context = 'from-internal' } = req.body;
    const user = req.user; // From verifyToken

    if (!destination || !extension) {
        return res.status(400).json({ error: 'Missing destination or extension' });
    }

    console.log(`[VoIP] User ${user.id} initiating call: Ext ${extension} -> ${destination}`);

    const action = {
        'Action': 'Originate',
        'Channel': `SIP/${extension}`,
        'Context': context,
        'Exten': destination,
        'Priority': 1,
        'CallerID': `WhatsCloud <${destination}>`,
        'Async': 'true'
    };

    ami.action(action, (err, response) => {
        if (err) {
            console.error('[AMI] Call Failed:', err);
            return res.status(500).json({ error: 'Call initiation failed', details: err.message });
        }

        console.log('[AMI] Response:', response);
        res.json({ status: 'success', message: 'Call initiated via PBX', pbx_response: response });
    });
};
