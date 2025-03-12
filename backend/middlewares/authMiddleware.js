const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

const authMiddleware = asyncHandler(async (req, res, next) => {
    let token;

    if (req?.headers?.authorization?.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        console.log(token)
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findById(decoded?.id);
            if (!user) {
                return res.status(401).json({ message: "Người dùng không tồn tại" });
            }

            req.user = user;
            next();
        } catch (error) {
            console.error("Lỗi xác thực token:", error);
            return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
        }
    } else {
        return res.status(401).json({ message: "Không có token trong yêu cầu" });
    }
});

const isAdmin = asyncHandler(async (req, res, next) => {
    const { email } = req.user;
    const adminUser = await User.findOne({ email });

    if (adminUser.role !== "admin") {
        res.status(403).json({ message: "Không có quyền admin" });
    } else {
        next();
    }
});

module.exports = { authMiddleware, isAdmin };
