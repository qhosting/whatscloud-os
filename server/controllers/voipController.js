import AmiClient from 'asterisk-manager';

// Configurar conexión AMI (Singleton)
const ami = new AmiClient(
    process.env.AMI_PORT || 5038,
    process.env.AMI_HOST || 'localhost',
    process.env.AMI_USER,
    process.env.AMI_SECRET
);

// Keep alive / Error handling
ami.keepConnected();
ami.on('error', (err) => console.error('[AMI] Error:', err));

export const initiateCall = async (req, res) => {
    const { destination, extension, context = 'from-internal' } = req.body;
    const user = req.user; // From verifyToken

    if (!destination || !extension) {
        return res.status(400).json({ error: 'Missing destination or extension' });
    }

    console.log(`[VoIP] User ${user.id} initiating call: Ext ${extension} -> ${destination}`);

    // AMI Action: Originate
    // Docs: https://wiki.asterisk.org/wiki/display/AST/Asterisk+11+ManagerAction_Originate
    const action = {
        'Action': 'Originate',
        'Channel': `SIP/${extension}`, // Or PJSIP depending on setup
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
