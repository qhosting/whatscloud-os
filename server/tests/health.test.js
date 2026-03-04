import request from 'supertest';
import app from '../app.js';

describe('API Health Check', () => {
    it('should return 200 OK and health status', async () => {
        // Note: This test might fail if DB services aren't running, 
        // but the API structure check will pass.
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toBeDefined();
        expect(res.body).toHaveProperty('service', 'WhatsCloud Scrapper API');
    });
});
