import express from "express";
import { getUsers, getProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = express.Router();

// GET all users (Protected)
router.get("/", authMiddleware, getUsers);

// GET logged-in user profile
router.get("/me", authMiddleware, getProfile);

export default router;
