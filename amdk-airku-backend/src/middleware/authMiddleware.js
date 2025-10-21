
const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Dapatkan token dari header
            token = req.headers.authorization.split(' ')[1];

            // Verifikasi token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Lampirkan payload pengguna ke objek request
            req.user = decoded;

            next();
        } catch (error) {
            console.error(error);
            
            // Tangani error token expired secara spesifik
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Sesi Anda telah berakhir. Silakan login kembali.',
                    error: 'TOKEN_EXPIRED',
                    expiredAt: error.expiredAt
                });
            }
            
            // Tangani error JWT tidak valid
            if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Token tidak valid. Silakan login kembali.',
                    error: 'INVALID_TOKEN'
                });
            }
            
            // Error lainnya
            res.status(401).json({ 
                message: 'Tidak terotorisasi, token gagal',
                error: 'AUTH_FAILED'
            });
        }
    } else {
        res.status(401).json({ 
            message: 'Tidak terotorisasi, tidak ada token',
            error: 'NO_TOKEN'
        });
    }
};

const admin = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk Admin' });
    }
};

const sales = (req, res, next) => {
    if (req.user && req.user.role === 'Sales') {
        next();
    } else {
        res.status(403).json({ message: 'Akses ditolak, hanya untuk Sales' });
    }
};

module.exports = { protect, admin, sales };
