export const verifySuperAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Access Denied: SuperAdmin privileges required' });
    }
    next();
};
