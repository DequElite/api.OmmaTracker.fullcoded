"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authenticateToken_1 = require("../../../middleware/authenticateToken");
const SAProfileRouter = (0, express_1.Router)();
SAProfileRouter.get('/profile', authenticateToken_1.authenticateSAToken, (req, res) => {
    const sa = req.user;
    console.log(sa);
    res.json({ message: 'access granted', sa: sa, isAdmin: req.isAdmin });
});
exports.default = SAProfileRouter;
