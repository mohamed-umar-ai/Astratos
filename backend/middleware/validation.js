const validatePassword = (req, res, next) => {
    const { password } = req.body;
    
    if (!password) {
        return res.status(400).json({ message: 'Password is required.' });
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
            message: 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&).' 
        });
    }

    next();
};

module.exports = { validatePassword };
