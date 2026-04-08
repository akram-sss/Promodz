import { prisma } from "../utils/prisma.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { nanoid } from "nanoid";
import { activeUsers } from "../utils/activeUsers.js";
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';
import { sendVerificationEmail } from '../utils/email.js';

export const createUser = async (req, res) => {
  const { username, fullName, email, phoneNumber, password, role, companyName } = req.body;
  const creator = req.user; // authenticated user (set by middleware)

  if (!username || !fullName || !email || !phoneNumber || !password || !role) {
    return res.status(400).json({ error: "All fields are required" });
  }

  const roleUpper = role.toUpperCase();

  // Check permission
  if (creator.role === "ADMIN" && !["USER", "ENTREPRISE"].includes(roleUpper)) {
    return res.status(403).json({
      error: "Admins can only create users or companies",
    });
  }

  // Company name is required when creating a company account
  if (roleUpper === "ENTREPRISE" && !companyName) {
    return res.status(400).json({ error: "Company name is required for company accounts" });
  }

  try {
    // Check for duplicate email
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Check for duplicate username
    const existingUsername = await prisma.user.findUnique({ where: { username } });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        id: nanoid(12),
        username,
        fullName,
        email,
        phoneNumber,
        password: hashedPassword,
        role: roleUpper,
        // Admin-created accounts are active and verified immediately
        active: true,
        verified: true,
        // Set company name for company accounts
        ...(roleUpper === "ENTREPRISE" && companyName ? { companyName } : {}),
      },
    });

    // Auto-create a FREE subscription for company accounts
    if (roleUpper === "ENTREPRISE") {
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      await prisma.subscription.create({
        data: {
          companyId: user.id,
          plan: "FREE",
          status: "ACTIVE",
          startDate: now,
          endDate: oneYearLater,
          price: 0,
          autoRenew: true,
        },
      });
    }

    const { password: _, ...userData } = user;
    res.status(201).json(userData);

  } catch (err) {
    console.error(err);

    if (err.code === 'P2002') {
      return res.status(409).json({
        error: `Unique constraint failed on ${err.meta?.target?.join(", ")}`,
      });
    }

    if (err.code === 'P2003') {
      return res.status(400).json({ error: `Foreign key constraint failed` });
    }

    if (err.code === 'P2022') {
      return res.status(400).json({ error: `Invalid column: ${err.meta?.column}` });
    }

    res.status(500).json({ error: "Internal server error", detail: err.message });
  }
};

export const registerPublicUser = async (req, res) => {
  const { username, fullName, email, phoneNumber, password } = req.body;

  // Required fields
  if (!username || !fullName || !email || !phoneNumber || !password) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    // Check for duplicate email
    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      // If user exists but not verified and not active, allow re-registration
      if (!existingEmail.active && !existingEmail.verified) {
        const code = crypto.randomInt(100000, 999999).toString();
        const hashedPassword = await bcrypt.hash(password, 10);
        await prisma.user.update({
          where: { email },
          data: {
            username,
            fullName,
            phoneNumber,
            password: hashedPassword,
            verificationCode: code,
            verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
          },
        });
        try {
          await sendVerificationEmail(email, code);
        } catch (emailErr) {
          console.error("Email send failed:", emailErr);
          console.log("Verification code for", email, ":", code);
        }
        return res.status(201).json({
          message: "A verification code has been sent to your email.",
          requiresVerification: true,
          email,
        });
      }
      return res.status(409).json({ error: "Email already exists" });
    }

    // Check for duplicate username
    const existingUsername = await prisma.user.findFirst({
      where: { username }
    });
    if (existingUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const code = crypto.randomInt(100000, 999999).toString();

    // Only USER role allowed for public registration
    const userData = {
      id: nanoid(12),
      username,
      fullName,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "USER",
      active: false, // Not active until email is verified
      verified: false,
      verificationCode: code,
      verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000), // 10 min
    };

    await prisma.user.create({
      data: userData,
    });

    // Send verification email
    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      console.log("Verification code for", email, ":", code);
    }

    res.status(201).json({
      message: "A verification code has been sent to your email.",
      requiresVerification: true,
      email,
    });

  } catch (err) {
    console.error("Public registration error:", err);
    
    if (err.code === 'P2002') {
      return res.status(409).json({
        error: `Duplicate entry for ${err.meta?.target?.join(", ")}`
      });
    }
    
    res.status(500).json({ 
      error: "Registration failed", 
      detail: err.message 
    });
  }
};

export const verifyEmail = async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and verification code are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.active && user.verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    if (
      user.verificationCode !== code ||
      !user.verificationCodeExpiry ||
      user.verificationCodeExpiry < new Date()
    ) {
      return res.status(400).json({ error: "Invalid or expired verification code" });
    }

    await prisma.user.update({
      where: { email },
      data: {
        active: true,
        verified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
        verificationDate: new Date(),
      },
    });

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err) {
    console.error("Email verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
};

export const resendVerificationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.active && user.verified) {
      return res.status(400).json({ error: "Email is already verified" });
    }

    const code = crypto.randomInt(100000, 999999).toString();

    await prisma.user.update({
      where: { email },
      data: {
        verificationCode: code,
        verificationCodeExpiry: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    try {
      await sendVerificationEmail(email, code);
    } catch (emailErr) {
      console.error("Email send failed:", emailErr);
      console.log("Verification code for", email, ":", code);
    }

    res.json({ message: "A new verification code has been sent to your email." });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Failed to resend verification code" });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const requestingUser = req.user;

    let users;
    const selectFields = {
      id: true,
      username: true,
      fullName: true,
      email: true,
      phoneNumber: true,
      role: true,
      createdAt: true,
      isBanned: true,
      active: true,
      image: true,
      companyName: true,
      city: true,
      country: true,
    };

    if (requestingUser.role === "SUPER_ADMIN") {
      // SUPER_ADMIN sees everyone (except soft-deleted)
      users = await prisma.user.findMany({
        where: {
          NOT: { id: requestingUser.id },
          isDeleted: false,
        },
        select: selectFields,
      });
    } else if (requestingUser.role === "ADMIN") {
      // ADMIN sees all except other ADMINs, SUPER_ADMINs, and soft-deleted
      users = await prisma.user.findMany({
        where: {
          isDeleted: false,
          NOT: {
            OR: [
              { role: "ADMIN" },
              { role: "SUPER_ADMIN" },
              { id: requestingUser.id },
            ],
          },
        },
        select: selectFields,
      });
    } else {
      // Everyone else is forbidden
      return res.status(403).json({ error: "Forbidden: insufficient permissions" });
    }

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export const loginUser = async (req, res) => {
  const { identifier, password } = req.body;

  if (!identifier || !password) {
    return res.status(400).json({ error: 'Identifier and password are required' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (user.isDeleted) {
      return res.status(403).json({ error: 'This account has been deleted. Please contact support.' });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: 'This account has been banned. Please contact support.' });
    }

    // Check if email is verified (for USER accounts created via public registration)
    if (!user.active && user.role === 'USER') {
      return res.status(403).json({ 
        error: 'Please verify your email before logging in.',
        requiresVerification: true,
        email: user.email,
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    const { password: _, ...userData } = user;

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: userData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const getActiveUsers = async (req, res) => {
  const user = req.user;

  if (user.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }


  const onlineUsers = Array.from(activeUsers.values());
  res.json(onlineUsers);
};
export const updateUserRole = async (req, res) => {
  const { id } = req.params; // ID of the user to update
  const { role } = req.body;
  const requestingUser = req.user;

  // Only SUPER_ADMIN can perform this action
  if (requestingUser.role !== "SUPER_ADMIN") {
    return res.status(403).json({ error: "Access denied" });
  }

  if (!["USER", "ADMIN", "ENTREPRISE", "SUPER_ADMIN"].includes(role)) {
    return res.status(400).json({ error: "Invalid role specified" });
  }

  try {
    const userToUpdate = await prisma.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent changing role of another SUPER_ADMIN
    if (userToUpdate.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Cannot modify another SUPER_ADMIN" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        role: true,
        isBanned: true,
        createdAt: true,
      },
    });

    res.json({ message: "User role updated", user: updatedUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update user role" });
  }
};
export const toggleFavoriteProduct = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const existing = await prisma.productFavorite.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      // Unfavorite
      await prisma.productFavorite.delete({
        where: { userId_productId: { userId, productId } }
      });
      return res.json({ message: 'Product unfavorited' });
    } else {
      // Favorite
      await prisma.productFavorite.create({
        data: { userId, productId }
      });
      return res.json({ message: 'Product favorited' });
    }
  } catch (err) {
    console.error('Error toggling favorite:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const rateProduct = async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { rating } = req.body;

  try {
    if (rating !== null && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5 or null' });
    }

    const existing = await prisma.productRating.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      // Update or remove
      await prisma.productRating.update({
        where: { userId_productId: { userId, productId } },
        data: { rating }
      });
    } else {
      // Create new rating
      await prisma.productRating.create({
        data: { userId, productId, rating }
      });
    }

    res.json({ message: rating === null ? 'Rating removed' : 'Rating updated' });
  } catch (err) {
    console.error('Error rating product:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};
export const followCompany = async (req, res) => {
  const userId = req.user.id; 
  const { companyId } = req.body;

  if (!companyId) {
    return res.status(400).json({ error: "companyId is required" });
  }

  try {
    const company = await prisma.user.findUnique({ where: { id: companyId } });

    if (!company || company.role !== "ENTREPRISE") {
      return res.status(404).json({ error: "Company not found or not valid" });
    }

    const existingFollow = await prisma.companyFollow.findUnique({
      where: { userId_companyId: { userId, companyId } },
    });

    if (existingFollow) {
      return res.status(200).json({ message: "Already following this company" });
    }

    const follow = await prisma.companyFollow.create({
      data: {
        userId,
        companyId,
      },
    });

    res.status(201).json({ message: "Company followed", follow });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not follow company" });
  }
};
export const unfollowCompany = async (req, res) => {
  const userId = req.user.id;
  const { companyId } = req.body;

  try {
    await prisma.companyFollow.delete({
      where: {
        userId_companyId: {
          userId,
          companyId,
        },
      },
    });

    res.json({ message: "Company unfollowed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to unfollow company" });
  }
};
export const changePassword = async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "Current and new password are required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== GET CURRENT USER PROFILE =====================
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isBanned: true,
        active: true,
        createdAt: true,
        image: true,
        website: true,
        handle: true,
        companyName: true,
        address: true,
        rc: true,
        city: true,
        postalCode: true,
        description: true,
        country: true,
        _count: {
          select: {
            productsAsCompany: true,
            followers: true,
            companiesFollowed: true,
            productFavorites: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== UPDATE CURRENT USER PROFILE =====================
export const updateProfile = async (req, res) => {
  const allowedFields = [
    "fullName", "username", "email", "phoneNumber", "image",
    "website", "handle", "companyName", "address", "rc",
    "city", "postalCode", "description", "country",
  ];

  const data = {};
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      data[field] = req.body[field];
    }
  }

  if (Object.keys(data).length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  try {
    // If email is being changed, require password verification
    if (data.email) {
      const currentUser = await prisma.user.findUnique({ where: { id: req.user.id } });
      if (data.email !== currentUser.email) {
        const { currentPassword } = req.body;
        if (!currentPassword) {
          return res.status(400).json({ error: "Password is required to change email" });
        }
        const valid = await bcrypt.compare(currentPassword, currentUser.password);
        if (!valid) {
          return res.status(401).json({ error: "Incorrect password" });
        }
      }
    }

    // Check unique constraints if updating email or username
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: { email: data.email, NOT: { id: req.user.id } },
      });
      if (existing) return res.status(409).json({ error: "Email already taken" });
    }
    if (data.username) {
      const existing = await prisma.user.findFirst({
        where: { username: data.username, NOT: { id: req.user.id } },
      });
      if (existing) return res.status(409).json({ error: "Username already taken" });
    }

    const updated = await prisma.user.update({
      where: { id: req.user.id },
      data,
      select: {
        id: true, email: true, username: true, fullName: true,
        phoneNumber: true, role: true, image: true, website: true,
        handle: true, companyName: true, address: true, rc: true,
        city: true, postalCode: true, description: true, country: true,
      },
    });

    res.json(updated);
  } catch (err) {
    console.error("Error updating profile:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== DELETE OWN ACCOUNT =====================
export const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  const { password } = req.body;

  if (!password) {
    return res.status(400).json({ error: "Password is required to confirm account deletion" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // SUPER_ADMIN cannot delete their own account
    if (user.role === "SUPER_ADMIN") {
      return res.status(403).json({ error: "Super admin accounts cannot be self-deleted" });
    }

    if (user.isDeleted) {
      return res.status(400).json({ error: "Account is already deleted" });
    }

    // Soft-delete: mark user as deleted instead of removing from DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedById: null, // self-deleted (no admin)
        isBanned: true,    // prevent login
      },
    });

    res.json({ message: "Account deleted successfully" });
  } catch (err) {
    console.error("Error deleting account:", err);
    res.status(500).json({ error: "Failed to delete account. Please try again." });
  }
};
export const getUserFavorites = async (req, res) => {
  try {
    const favorites = await prisma.productFavorite.findMany({
      where: { userId: req.user.id },
      include: {
        product: {
          include: {
            company: { select: { id: true, username: true, fullName: true } },
            category: { select: { name: true } },
            subCategory: { select: { name: true } },
            _count: { select: { favorites: true, clicks: true, ratings: true } },
            ratings: { select: { rating: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const products = favorites.map(({ product: p }) => {
      const validRatings = p.ratings.filter(r => r.rating != null);
      const avgRating = validRatings.length > 0
        ? parseFloat((validRatings.reduce((s, r) => s + r.rating, 0) / validRatings.length).toFixed(1))
        : 0;

      return {
        id: p.id,
        name: p.name,
        company: p.company?.fullName ?? p.company?.username ?? null,
        companyID: p.company?.id ?? null,
        companyName: p.company?.fullName ?? p.company?.username ?? null,
        category: [p.category?.name ?? "General", ...(p.subCategory ? [p.subCategory.name] : [])],
        price: p.price,
        discount: p.discount ?? 0,
        rating: avgRating,
        Likes: p._count.favorites,
        Clicks: p._count.clicks,
        Link: p.link ?? "",
        images: p.images?.length > 0 ? p.images : ["https://placehold.co/400x400?text=No+Image"],
        startDate: p.createdAt,
        endDate: p.expiresAt,
      };
    });

    res.json(products);
  } catch (err) {
    console.error("Error fetching favorites:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== GET USER FOLLOWED COMPANIES =====================
export const getUserFollowing = async (req, res) => {
  try {
    const following = await prisma.companyFollow.findMany({
      where: { userId: req.user.id },
      include: {
        company: {
          select: {
            id: true, username: true, fullName: true, image: true,
            website: true, handle: true, city: true, country: true,
            _count: { select: { followers: true, productsAsCompany: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const companies = following.map(({ company: c }) => ({
      id: c.id,
      name: c.fullName ?? c.username,
      username: c.username,
      handle: c.handle ?? `@${c.username}`,
      image: c.image,
      website: c.website,
      city: c.city,
      country: c.country,
      followers: c._count.followers,
      activePromotions: c._count.productsAsCompany,
    }));

    res.json(companies);
  } catch (err) {
    console.error("Error fetching following:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

// GET /api/users/:userId - Get user by ID (ADMIN/SUPER_ADMIN only)
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const requester = req.user;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        fullName: true,
        phoneNumber: true,
        role: true,
        isBanned: true,
        active: true,
        createdAt: true,
        image: true,
        website: true,
        handle: true,
        companyName: true,
        address: true,
        rc: true,
        city: true,
        postalCode: true,
        description: true,
        country: true,
        verified: true,
        lastSeen: true,
        online: true,
        _count: {
          select: {
            productsAsCompany: true,
            followers: true,
            companiesFollowed: true,
            productFavorites: true,
            productRatings: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // For ENTREPRISE users, include subscription and stats
    let subscription = null;
    let companyStats = null;
    let assignedAdmins = [];

    if (user.role === "ENTREPRISE") {
      subscription = await prisma.subscription.findUnique({
        where: { companyId: user.id },
        include: {
          features: {
            include: { feature: true },
          },
        },
      });

      const [activeProducts, expiredProducts, deletedProducts, totalClicks] = await Promise.all([
        prisma.product.count({ where: { companyId: user.id, status: "ACTIVE" } }),
        prisma.product.count({ where: { companyId: user.id, status: "EXPIRED" } }),
        prisma.product.count({ where: { companyId: user.id, status: "DELETED" } }),
        prisma.companyClick.count({ where: { companyId: user.id } }),
      ]);

      companyStats = {
        activeProducts,
        expiredProducts,
        deletedProducts,
        totalClicks,
        followers: user._count.followers,
      };

      // Get admins assigned to this company
      assignedAdmins = await prisma.companyAdmin.findMany({
        where: { companyId: user.id },
        include: {
          admin: {
            select: { id: true, fullName: true, email: true, role: true, image: true },
          },
        },
      });
    }

    // For ADMIN users, include assigned companies
    let assignedCompanies = [];
    if (user.role === "ADMIN") {
      assignedCompanies = await prisma.companyAdmin.findMany({
        where: { adminId: user.id },
        include: {
          company: {
            select: {
              id: true,
              fullName: true,
              companyName: true,
              email: true,
              image: true,
            },
          },
        },
      });
    }

    res.json({
      ...user,
      subscription,
      companyStats,
      assignedAdmins: assignedAdmins.map((a) => ({
        ...a.admin,
        permissions: {
          canViews: a.canViews,
          canEdit: a.canEdit,
          canDelete: a.canDelete,
          canAdd: a.canAdd,
        },
      })),
      assignedCompanies: assignedCompanies.map((ac) => ({
        ...ac.company,
        permissions: {
          canViews: ac.canViews,
          canEdit: ac.canEdit,
          canDelete: ac.canDelete,
          canAdd: ac.canAdd,
        },
      })),
    });
  } catch (err) {
    console.error("Error fetching user by ID:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};