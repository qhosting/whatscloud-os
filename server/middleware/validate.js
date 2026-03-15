import { z } from 'zod';

export const validate = (schema) => (req, res, next) => {
    try {
        const validatedData = schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        // Replace req data with validated data (which strips unknown fields)
        if (validatedData.body) req.body = validatedData.body;
        if (validatedData.query) req.query = validatedData.query;
        if (validatedData.params) req.params = validatedData.params;
        next();
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorDetails = error.errors || [];
            return res.status(400).json({
                error: 'Validation failed',
                details: errorDetails.map(err => ({
                    path: err.path ? err.path.join('.') : '',
                    message: err.message
                }))
            });
        }
        next(error);
    }
};
