const jwt = require('jsonwebtoken');
const Users = require('../models/users');

const authenticateUser = async (req,res,next) => {
    try {
        const authHeader = req.headers.authorization;

        if(!authHeader){
            return res.status(404).json({
                message: "Access denied. token missing"
            })
        }

        const token = authHeader.split(' ')[1];

        const decoded = jwt.verify(token,'secretKey');

        const user = await Users.findById(decoded.id);

        req.user = user;
        next();
    } catch (error) {
        return res.status(500).json({
            message: error
        })
    }
}

module.exports = authenticateUser;

