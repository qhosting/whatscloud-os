import Openpay from 'openpay';
import dotenv from 'dotenv';
import logger from '../config/logger.js';

dotenv.config();

const openpay = new Openpay(
    process.env.OPENPAY_MERCHANT_ID,
    process.env.OPENPAY_PRIVATE_KEY,
    process.env.OPENPAY_PRODUCTION === 'true'
);

export const createCardCharge = async (customer, chargeRequest) => {
    return new Promise((resolve, reject) => {
        openpay.charges.create(chargeRequest, (error, body) => {
            if (error) {
                logger.error(`[OPENPAY] Card Charge Error: ${error.description}`);
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
};

export const createSpeiPayout = async (customer, chargeRequest) => {
    // Note: OpenPay SPEI typically involves creating a 'payout' or a specific charge with method='bank_account'
    // but in many cases for recharges, it's just generating an 'estatus' or 'orden de pago'.
    return new Promise((resolve, reject) => {
        openpay.charges.create(chargeRequest, (error, body) => {
            if (error) {
                logger.error(`[OPENPAY] SPEI Charge Error: ${error.description}`);
                reject(error);
            } else {
                resolve(body);
            }
        });
    });
};

export const getOpenPayCustomer = async (organization) => {
    if (organization.openpayCustomerId) return organization.openpayCustomerId;
    
    const customerRequest = {
        name: organization.name,
        email: `billing+${organization.slug}@whatscloud.io`, // Placeholder
        external_id: organization.id
    };

    return new Promise((resolve, reject) => {
        openpay.customers.create(customerRequest, (error, body) => {
            if (error) {
                logger.error(`[OPENPAY] Customer Creation Error: ${error.description}`);
                reject(error);
            } else {
                resolve(body.id);
            }
        });
    });
};
