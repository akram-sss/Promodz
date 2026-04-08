import express from "express";
import { createUser, getAllUsers, loginUser } from "../controllers/user.controller.js";
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/authorize.js';
import { getActiveUsers } from "../controllers/user.controller.js";
import { toggleFavoriteProduct, rateProduct } from '../controllers/user.controller.js';
import { updateUserRole } from "../controllers/user.controller.js";
import { followCompany, unfollowCompany, changePassword, registerPublicUser, verifyEmail, resendVerificationCode } from "../controllers/user.controller.js";
import { getProfile, updateProfile, getUserFavorites, getUserFollowing, deleteAccount } from "../controllers/user.controller.js";
import { getUserById } from "../controllers/user.controller.js";


const router = express.Router();

// Public routes
router.post("/register-public", registerPublicUser);
router.post("/verify-email", verifyEmail);
router.post("/resend-verification", resendVerificationCode);

// Super admin-only user creation (moderators cannot create users)
router.post("/register", authenticate, authorizeRoles("SUPER_ADMIN"), createUser);

// Authenticated user routes
router.get("/me", authenticate, getProfile);
router.patch("/me", authenticate, updateProfile);
router.delete("/me", authenticate, deleteAccount);
router.get("/me/favorites", authenticate, getUserFavorites);
router.get("/me/following", authenticate, getUserFollowing);

router.post('/:productId/favorite', authenticate, toggleFavoriteProduct);
router.post('/:productId/rate', authenticate, rateProduct);

// Protected + Role-restricted routes
router.get("/", authenticate, authorizeRoles("ADMIN", "SUPER_ADMIN"), getAllUsers);
router.get("/active", authenticate, getActiveUsers);
router.get("/:userId", authenticate, authorizeRoles("ADMIN", "SUPER_ADMIN"), getUserById);
router.patch("/role/:id", authenticate, authorizeRoles("SUPER_ADMIN"), updateUserRole);

router.post("/follow-company", authenticate, followCompany);
router.post("/unfollow-company", authenticate, unfollowCompany);
router.patch("/change-password", authenticate, changePassword);
export default router;
