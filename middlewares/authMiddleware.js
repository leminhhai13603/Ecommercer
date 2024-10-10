const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;
    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        try {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded?.id);
                req.user = user;
                next();
            }
        } catch (error) {
            res.status(401).json({ message: "Vui lòng đăng nhập lại" });
        }
    } else {
        res.status(401).json({ message: "Không có token đính kèm trong header" });
    }
});

const isAdmin = asyncHandler(async(req, res, next) => {
    const {email} = req.user;
    const adminUser = await User.findOne({email});
    if(adminUser.role !== "admin"){
        res.status(403).json({ message: "Bạn không được phép truy cập" });
    } else {
        next();
    }
});
module.exports = {authMiddleware, isAdmin};