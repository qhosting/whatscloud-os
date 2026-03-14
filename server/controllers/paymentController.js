import { Payment, Organization, User, CreditTransaction } from '../models/index.js';
import * as openpayService from '../services/paymentService.js';
import logger from '../config/logger.js';

export const requestRecharge = async (req, res) => {
    const { amount, method, deviceSessionId, token } = req.body;
    const { id: userId, organizationId } = req.user;

    if (!amount || amount <= 0) {
        return res.status(400).json({ error: 'Invalid amount' });
    }

    try {
        const org = await Organization.findByPk(organizationId);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        const openpayCustomerId = await openpayService.getOpenPayCustomer(org);
        if (!org.openpayCustomerId) {
            await org.update({ openpayCustomerId });
        }

        let payment;
        if (method === 'CARD') {
            const chargeRequest = {
                method: 'card',
                source_id: token,
                amount: amount,
                description: `Recharge for ${org.name}`,
                device_session_id: deviceSessionId,
                order_id: `WC-${Date.now()}`
            };

            const openpayResult = await openpayService.createCardCharge(openpayCustomerId, chargeRequest);
            
            payment = await Payment.create({
                amount,
                method: 'CARD',
                status: 'COMPLETED', // Cards are usually instant
                externalId: openpayResult.id,
                organizationId,
                userId,
                creditsAdded: Math.floor(amount) // 1 MXN = 1 Credit for now
            });

            // Add credits to user instantly
            const user = await User.findByPk(userId);
            await user.increment('credits', { by: Math.floor(amount) });
            
            await CreditTransaction.create({
                amount: Math.floor(amount),
                type: 'RECHARGE',
                reason: `Recharge via OpenPay (Card): ${openpayResult.id}`,
                userId,
                organizationId
            });

            return res.status(201).json({ status: 'success', payment });

        } else if (method === 'SPEI') {
            // SPEI via OpenPay
            const chargeRequest = {
                method: 'bank_account',
                amount: amount,
                description: `SPEI Recharge for ${org.name}`,
                order_id: `SPEI-${Date.now()}`
            };

            const openpayResult = await openpayService.createSpeiPayout(openpayCustomerId, chargeRequest);

            payment = await Payment.create({
                amount,
                method: 'SPEI',
                status: 'PENDING',
                externalId: openpayResult.id,
                organizationId,
                userId
            });

            return res.status(201).json({ 
                status: 'pending', 
                payment, 
                spei_instructions: openpayResult.payment_method 
            });

        } else if (method === 'MANUAL_SPEI') {
            // Manual SPEI (User uploads receipt later)
            payment = await Payment.create({
                amount,
                method: 'SPEI',
                status: 'PENDING',
                organizationId,
                userId
            });

            return res.status(201).json({ 
                status: 'pending', 
                payment,
                instructions: "Por favor transfiera a la CLABE: 0123456789 (Aurum Holding) y suba su comprobante."
            });
        }

        res.status(400).json({ error: 'Unsupported payment method' });

    } catch (error) {
        logger.error(`[PAYMENT] Error: ${error.message}`);
        res.status(500).json({ error: error.description || 'Internal Payment Error' });
    }
};

export const uploadReceipt = async (req, res) => {
    const { paymentId, receiptUrl } = req.body;
    
    try {
        const payment = await Payment.findByPk(paymentId);
        if (!payment) return res.status(404).json({ error: 'Payment record not found' });
        
        await payment.update({ receiptUrl, status: 'PENDING' });
        res.json({ message: 'Receipt uploaded successfully. Waiting for administrator approval.' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const approvePayment = async (req, res) => {
    const { paymentId } = req.params;
    const adminUser = req.user;

    if (adminUser.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Root access required' });
    }

    try {
        const payment = await Payment.findByPk(paymentId);
        if (!payment || payment.status !== 'PENDING') {
            return res.status(400).json({ error: 'Invalid or already processed payment' });
        }

        await payment.update({ status: 'COMPLETED', creditsAdded: Math.floor(payment.amount) });

        const user = await User.findByPk(payment.userId);
        await user.increment('credits', { by: Math.floor(payment.amount) });

        await CreditTransaction.create({
            amount: Math.floor(payment.amount),
            type: 'RECHARGE',
            reason: `Manual SPEI Recharge Approved by ${adminUser.email}`,
            userId: payment.userId,
            organizationId: payment.organizationId
        });

        res.json({ message: 'Payment approved and credits added successfully' });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
