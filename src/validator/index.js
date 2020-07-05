exports.userSignupValidator = (req, res, next) => {
    req.check('username', 'Username is required').notEmpty();
    req.check('email', 'Email must have between 3 and 32 characters')
        .matches(/.+\@.+\..+/)
        .withMessage('Invalid email address')
        .isLength({
            min: 6,
            max: 40,
        });
    req.check('password', 'Password required').notEmpty();
    req.check('password')
        .isLength({ min: 6 })
        .withMessage('Password must contain at least 6 characters')
        .matches(/\d/)
        .withMessage('Password must contain a number');

    const errors = req.validationErrors();
    
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ 
            error: {
                message: firstError
            } 
        });
    }
    next();
}

exports.auctionValidator = (req, res, next) => {
    //@TODO: actualizar
    req.check('initial_stock', 'Initial stock is required').notEmpty();
    req.check('initial_price', 'Initial price is required').notEmpty();
    req.check('min_price', 'Minimum price is required').notEmpty();
    req.check('article_id', 'Article ID is required').notEmpty();

    const errors = req.validationErrors();
    
    if (errors) {
        const firstError = errors.map(error => error.msg)[0];
        return res.status(400).json({ 
            error: {
                message: firstError
            } 
        });
    }
    next();
}