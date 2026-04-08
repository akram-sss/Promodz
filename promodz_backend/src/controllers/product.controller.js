import { prisma } from "../utils/prisma.js";
import { subDays } from "date-fns";
import { syncCategoriesToDB } from "../utils/syncCategories.js";

export const createProduct = async (req, res) => {
  const user = req.user;
  const { 
    name,
    description,
    price,
    categoryId,
    subCategoryId,
    subCategoryIds,  // Array of subcategory IDs for multi-category
    expiresAt,
    startDate,   // When the product becomes active
    discount,    // New: discount percentage
    link,        // New: product link/URL
    images       // New: array of image URLs
  } = req.body;

  if (!name || !price || !categoryId) {
    return res.status(400).json({ error: "Name, price and categoryId are required" });
  }

  let companyId;
  const createdById = user.id;

  try {
    if (user.role === "ENTREPRISE") {
      companyId = user.id;
    } else if (user.role === "ADMIN") {
      // Admin/moderator must provide the target companyId
      const targetCompanyId = req.body.companyId;
      if (!targetCompanyId) {
        return res.status(400).json({ error: "companyId is required for admin users" });
      }
      // Verify this admin is assigned to the requested company
      const adminLink = await prisma.companyAdmin.findFirst({
        where: { adminId: user.id, companyId: targetCompanyId },
      });
      if (!adminLink) {
        return res.status(403).json({ error: "Admin not assigned to this company" });
      }
      if (!adminLink.canAdd) {
        return res.status(403).json({ error: "You don't have permission to add products for this company" });
      }
      companyId = targetCompanyId;
    } else if (user.role === "SUPER_ADMIN") {
      companyId = req.body.companyId;
      if (!companyId) {
        return res.status(400).json({ error: "companyId is required for super admin" });
      }
    } else {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Check if the company's subscription is active (not cancelled/paused)
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });
    if (subscription && subscription.status === "CANCELLED") {
      return res.status(403).json({ error: "This company is paused. Cannot add products." });
    }

    // ✅ Ensure category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      return res.status(400).json({ error: "Invalid categoryId" });
    }

    // ✅ If subCategoryId is provided, validate it
    if (subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: subCategoryId },
      });
      if (!subCategory || subCategory.categoryId !== categoryId) {
        return res.status(400).json({ error: "Invalid or mismatched subCategoryId" });
      }
    }

    // Resolve subCategoryIds: use provided array, or fall back to single subCategoryId
    let finalSubCategoryIds = [];
    let finalCategoryId = categoryId;
    let finalSubCategoryId = subCategoryId || null;

    if (Array.isArray(subCategoryIds) && subCategoryIds.length > 0) {
      finalSubCategoryIds = subCategoryIds;
      // Set primary categoryId/subCategoryId from first item
      const firstSub = await prisma.subCategory.findUnique({ where: { id: subCategoryIds[0] }, include: { category: true } });
      if (firstSub) {
        finalCategoryId = firstSub.categoryId;
        finalSubCategoryId = firstSub.id;
      }
    } else if (subCategoryId) {
      finalSubCategoryIds = [subCategoryId];
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        discount: discount ? parseFloat(discount) : 50,
        link: link || `https://yourdomain.com/products/${crypto.randomUUID()}`,
        images: images || ['defaultPromotion', 'defaultPromotion', 'defaultPromotion', 'defaultPromotion'],
        categoryId: finalCategoryId,
        subCategoryId: finalSubCategoryId,
        subCategoryIds: finalSubCategoryIds,
        companyId,
        createdById,
        startDate: startDate ? new Date(startDate) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      include: {
        category: true,
        subCategory: true,
      },
    });

    res.status(201).json({
      ...product,
      category: product.category?.name || null,
      subCategory: product.subCategory?.name || null,
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getActiveProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        // Hide scheduled products whose startDate is in the future
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] }
        ],
      },
      include: { 
        category: true, 
        subCategory: true,
        company: { select: { id: true, username: true } },
        createdBy: { select: { id: true } },
        // We need favorites to get count (array length)
        favorites: { select: { userId: true } },
        // We need ratings to calculate average rating
        ratings: { select: { rating: true } },
        // We need clicks to get count (array length)
        clicks: { select: { id: true } }
      },
      orderBy: { createdAt: "desc" },
    });

    // Format each product to match the promotion structure
    const formattedProducts = await Promise.all(products.map(async (product) => {
      // Calculate average rating
      let avgRating = 0;
      if (product.ratings.length > 0) {
        const sum = product.ratings.reduce((total, r) => total + (r.rating || 0), 0);
        avgRating = parseFloat((sum / product.ratings.length).toFixed(1));
      }

      // Get editedByID array (company ID + admin IDs)
      const companyAdmins = await prisma.companyAdmin.findMany({
        where: {
          companyId: product.companyId,
          canEdit: true
        },
        select: {
          adminId: true
        }
      });

      const editedByIDs = [
        product.companyId,
        ...companyAdmins.map(admin => admin.adminId)
      ];

      // Build categories array from subCategoryIds (multi-category support)
      let categories = [];
      if (product.subCategoryIds && product.subCategoryIds.length > 0) {
        const subCats = await prisma.subCategory.findMany({
          where: { id: { in: product.subCategoryIds } },
          include: { category: true },
        });
        for (const sc of subCats) {
          if (sc.category?.name && !categories.includes(sc.category.name)) {
            categories.push(sc.category.name);
          }
          if (sc.name && !categories.includes(sc.name)) {
            categories.push(sc.name);
          }
        }
      }
      // Fallback to single category/subcategory
      if (categories.length === 0) {
        if (product.category?.name) categories.push(product.category.name);
        if (product.subCategory?.name && product.subCategory.name !== product.category?.name) {
          categories.push(product.subCategory.name);
        }
      }
      if (categories.length === 0) {
        categories.push("General");
      }

      // Calculate number of likes (favorites)
      const likesCount = product.favorites.length;

      // Calculate number of clicks
      const clicksCount = product.clicks.length;

      return {
        id: product.id,
        company: product.company?.username || "Unknown Company",
        companyID: product.companyId,
        createdByID: product.createdById,
        editedByID: editedByIDs,
        name: product.name,
        description: product.description || '',
        category: categories,
        subCategoryIds: product.subCategoryIds || [],
        price: product.price,
        discount: product.discount || 50,
        rating: avgRating,
        Likes: likesCount,
        Clicks: clicksCount,
        Link: product.link || `https://yourdomain.com/products/${product.id}`,
        images: product.images.length > 0 ? product.images :
          ['defaultPromotion', 'defaultPromotion', 'defaultPromotion', 'defaultPromotion'],
        startDate: (product.startDate || product.createdAt).toISOString(),
        endDate: product.expiresAt?.toISOString() ||
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
    }));

    res.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching active products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const recordProductClick = async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ error: "Product not found" });

    await prisma.productClick.create({
      data: {
        productId,
      },
    });

    res.status(200).json({ message: "Click recorded" });
  } catch (error) {
    console.error("Error recording click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const incrementProductClick = async (req, res) => {
  const { productId } = req.params;

  console.log("[productClick] Received click for productId:", productId);

  if (!productId) {
    return res.status(400).json({ error: "Product ID is required" });
  }

  try {
    // Check if product exists and not expired
    const product = await prisma.product.findUnique({ where: { id: productId } });

    if (!product) {
      console.log("[productClick] ❌ Product not found:", productId);
      return res.status(404).json({ error: "Product not found" });
    }

    // Check expiration
    if (product.expiresAt && product.expiresAt <= new Date()) {
      console.log("[productClick] ❌ Product expired:", productId);
      return res.status(400).json({ error: "This product has expired" });
    }

    // Extract visitor info for richer analytics
    const forwarded = req.headers["x-forwarded-for"];
    const ipAddress = forwarded ? forwarded.split(",")[0].trim() : req.socket?.remoteAddress || null;
    const userAgent = req.headers["user-agent"] || null;
    const userId = req.user?.id || null;

    console.log("[productClick] IP:", ipAddress, "| User:", userId || "guest", "| Product:", product.name);

    // Record click with full tracking data
    await prisma.productClick.create({
      data: { productId, userId, ipAddress, userAgent },
    });

    console.log("[productClick] ✅ Click SAVED for product:", product.name, "(", productId, ")");
    res.status(200).json({ message: "Product click recorded" });
  } catch (error) {
    console.error("[productClick] ❌ Error recording click:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getRecommendedProducts = async (req, res) => {
  const userId = req.user.id;

  try {
    // Fetch all active + not expired + not scheduled products
    const now = new Date();
    const allProducts = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: now } }
        ],
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }],
      },
      include: {
        ratings: true,
        favorites: true,
        company: { select: { id: true, username: true, fullName: true } },
        category: true,
        subCategory: true,
      },
    });

    // Fetch current user with favorites, ratings, and followed companies
    const [user, recentSearches] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        include: {
          productFavorites: { include: { product: true } },
          productRatings: true,
          companiesFollowed: {
            include: { company: true },
          },
        },
      }),
      // Fetch unique recent search queries (last 50, within 30 days)
      prisma.searchHistory.findMany({
        where: {
          userId,
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { query: true, createdAt: true },
      }),
    ]);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Build helper sets/maps for personalization
    const favorites = new Set(user.productFavorites.map((f) => f.productId));
    const ratingsMap = new Map(user.productRatings.map((r) => [r.productId, r.rating]));
    const followedCompanyIds = new Set(user.companiesFollowed.map((c) => c.companyId));

    // Build search history terms with frequency weighting
    // More frequent searches = stronger signal
    const searchTermFrequency = new Map();
    for (const s of recentSearches) {
      const term = s.query.toLowerCase().trim();
      if (term.length >= 2) {
        searchTermFrequency.set(term, (searchTermFrequency.get(term) || 0) + 1);
      }
    }
    const searchTerms = [...searchTermFrequency.keys()];

    // Score each product
    const scored = allProducts
      .filter((product) => !favorites.has(product.id)) // Exclude already-favorited products
      .map((product) => {
      let score = 0;
      const userRating = ratingsMap.get(product.id) ?? null;

      // Check name/category similarity against user's favorites
      const nameMatch = user.productFavorites.some(
        (fav) =>
          fav.product.name.toLowerCase().includes(product.name.toLowerCase()) ||
          product.name.toLowerCase().includes(fav.product.name.toLowerCase())
      );

      const categoryMatch = user.productFavorites.some(
        (fav) => fav.product.categoryId === product.categoryId
      );

      // Assign weights
      if (followedCompanyIds.has(product.companyId)) score += 250; // from followed company
      if (userRating >= 3) score += 500;           // user rated this product highly
      if (!userRating) score += 100;               // unexplored product — boost discovery
      if (userRating !== null && userRating <= 2) score -= 200;    // disliked product

      if (nameMatch) score += 50;
      if (categoryMatch) score += 30;

      // ── Search History Scoring ──
      // Boost products that match the user's recent search queries
      const productName = product.name.toLowerCase();
      const productDesc = (product.description || "").toLowerCase();
      const productCategory = (product.category?.name || "").toLowerCase();
      const productSubCategory = (product.subCategory?.name || "").toLowerCase();
      const productCompany = (product.company?.fullName || product.company?.username || "").toLowerCase();

      for (const term of searchTerms) {
        const freq = searchTermFrequency.get(term);
        // Product name matches search term — strongest signal
        if (productName.includes(term) || term.includes(productName)) {
          score += 150 * Math.min(freq, 3); // cap at 3x frequency boost
        }
        // Description matches
        else if (productDesc.includes(term)) {
          score += 80 * Math.min(freq, 3);
        }
        // Category/subcategory matches — user is interested in this type
        else if (productCategory.includes(term) || productSubCategory.includes(term)) {
          score += 100 * Math.min(freq, 3);
        }
        // Company name matches — user searched for this brand
        else if (productCompany.includes(term) || term.includes(productCompany)) {
          score += 120 * Math.min(freq, 3);
        }
      }

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount || 50,
        link: product.link,
        images: product.images,
        companyId: product.companyId,
        companyName: product.company?.fullName ?? product.company?.username ?? null,
        companyID: product.company?.id ?? null,
        category: product.category?.name ?? null,
        subCategory: product.subCategory?.name ?? null,
        startDate: product.createdAt,
        endDate: product.expiresAt,
        score,
      };
    });

    // Sort products by score, highest first
    const sorted = scored.sort((a, b) => b.score - a.score);

    res.json(sorted);
  } catch (err) {
    console.error("Error fetching recommended products:", err);
    res.status(500).json({ error: "Failed to fetch recommended products" });
  }
};

export const getPopularProducts = async (req, res) => {
  try {
    const now = new Date();
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }],
      },
      include: {
        _count: {
          select: {
            favorites: true, // use the actual relation name
            clicks: true,
            ratings: true,
          },
        },
        ratings: true,
        category: true,
        subCategory: true,
        company: { select: { username: true } },
      },
    });

    const scored = products.map((product) => {
      const numFavorites = product._count.favorites;
      const numClicks = product._count.clicks;
      const numRatings = product._count.ratings;

      const avgRating =
        product.ratings.length > 0
          ? product.ratings.reduce(
              (sum, r) => sum + (r.rating || 0),
              0
            ) / product.ratings.length
          : 0;

      const score =
        numFavorites * 3 +
        numRatings * 2 +
        (avgRating >= 3 ? avgRating * 10 : 0) +
        numClicks * 1;

      return {
        id: product.id,
        name: product.name,
        price: product.price,
        discount: product.discount || 50,
        link: product.link,
        images: product.images,
        company: product.company?.username || null,
        category: product.category?.name || null,
        subCategory: product.subCategory?.name || null,
        avgRating: parseFloat(avgRating.toFixed(2)),
        popularityScore: score,
      };
    });

    res.json(scored.sort((a, b) => b.popularityScore - a.popularityScore));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch popular products" });
  }
};

export const getProductViewStats = async (req, res) => {
  const { range = "day" } = req.query;
  let days = range === "week" ? 7 : range === "month" ? 30 : 1;

  const since = subDays(new Date(), days);

  try {
    const stats = await prisma.productClick.groupBy({
      by: ["productId"],
      _count: { id: true },
      where: { createdAt: { gte: since } },
    });

    const result = await Promise.all(
      stats.map(async (s) => {
        const product = await prisma.product.findUnique({
          where: { id: s.productId },
          include: { category: true, subCategory: true },
        });
        return {
          productId: s.productId,
          productName: product?.name,
          category: product?.category?.name || null,
          subCategory: product?.subCategory?.name || null,
          totalViews: s._count.id,
        };
      })
    );

    res.json(result);
  } catch (error) {
    console.error("Error fetching product view stats:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { productId } = req.params;
  const userId = req.user.id;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if company is paused
    if (req.user.role !== "SUPER_ADMIN") {
      const companySub = await prisma.subscription.findUnique({ where: { companyId: product.companyId } });
      if (companySub && companySub.status === "CANCELLED") {
        return res.status(403).json({ error: "This company is paused. Cannot delete products." });
      }
    }

    // Prevent double deletion
    if (product.status === "DELETED") {
      return res.status(400).json({ error: "Product is already deleted" });
    }

    // Authorization check
    if (req.user.role !== "SUPER_ADMIN" && req.user.id !== product.companyId) {
      const assignment = await prisma.companyAdmin.findFirst({
        where: {
          adminId: req.user.id,
          companyId: product.companyId,
          canDelete: true,
        },
      });

      if (!assignment) {
        return res
          .status(403)
          .json({ error: "Not authorized to delete this product" });
      }
    }

    // Soft delete + track who deleted it
    const deletedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        status: "DELETED",
        deletedById: userId,
      },
      include: {
        deletedBy: {
          select: { id: true, username: true, role: true },
        },
      },
    });

    res.json({
      message: `Product "${deletedProduct.name}" deleted successfully by ${deletedProduct.deletedBy?.username || "Unknown"}`,
      deletedProduct,
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProductExpiry = async (req, res) => {
  const { productId } = req.params;
  const { expiresAt } = req.body;
  const user = req.user;

  if (!expiresAt) {
    return res.status(400).json({ error: "expiresAt date is required" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { company: true },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Super admin can update anything
    if (user.role === "SUPER_ADMIN") {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { expiresAt: new Date(expiresAt) },
      });
      return res.json({ message: "Expiry date updated by super admin", product: updated });
    }

    // Company owner can update their own product
    if (user.role === "ENTREPRISE" && product.companyId === user.id) {
      const updated = await prisma.product.update({
        where: { id: productId },
        data: { expiresAt: new Date(expiresAt) },
      });
      return res.json({ message: "Expiry date updated by company", product: updated });
    }

    // Admin can update only if assigned to this company
    if (user.role === "ADMIN") {
      const assignment = await prisma.companyAdmin.findFirst({
        where: {
          adminId: user.id,
          companyId: product.companyId,
        },
      });

      if (!assignment) {
        return res.status(403).json({ error: "Not authorized to update this product" });
      }

      const updated = await prisma.product.update({
        where: { id: productId },
        data: { expiresAt: new Date(expiresAt) },
      });
      return res.json({ message: "Expiry date updated by assigned admin", product: updated });
    }

    return res.status(403).json({ error: "Not authorized to update expiry date" });
  } catch (error) {
    console.error("Update expiry date error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getDeletedProducts = async (req, res) => {
  try {
    let deletedProducts;

    if (req.user.role === "SUPER_ADMIN") {
      // Super admin sees ALL deleted products
      deletedProducts = await prisma.product.findMany({
        where: { status: "DELETED" },
        include: {
          company: { select: { id: true, username: true, role: true } },
          createdBy: { select: { id: true, username: true, role: true } },
          deletedBy: { select: { id: true, username: true, role: true } },
          category: { select: { name: true } },
          subCategory: { select: { name: true } },
          _count: { select: { favorites: true, clicks: true } },
          editHistory: {
            include: { user: { select: { id: true, username: true, role: true } } },
            orderBy: { editedAt: 'desc' },
          },
        },
      });
    } else if (req.user.role === "ADMIN") {
      // Assigned admin - get all companies they can view
      const assignments = await prisma.companyAdmin.findMany({
        where: {
          adminId: req.user.id,
          canViews: true,
        },
      });

      if (!assignments.length) {
        return res.status(403).json({ error: "Not authorized to view deleted products" });
      }

      const companyIds = assignments.map(a => a.companyId);
      deletedProducts = await prisma.product.findMany({
        where: {
          status: "DELETED",
          companyId: { in: companyIds },
        },
        include: {
          company: { select: { id: true, username: true, role: true } },
          createdBy: { select: { id: true, username: true, role: true } },
          deletedBy: { select: { id: true, username: true, role: true } },
          category: { select: { name: true } },
          subCategory: { select: { name: true } },
          _count: { select: { favorites: true, clicks: true } },
          editHistory: {
            include: { user: { select: { id: true, username: true, role: true } } },
            orderBy: { editedAt: 'desc' },
          },
        },
      });
    } else if (req.user.role === "ENTREPRISE") {
      // Company sees its OWN deleted products
      deletedProducts = await prisma.product.findMany({
        where: {
          status: "DELETED",
          companyId: req.user.id,
        },
        include: {
          company: { select: { id: true, username: true, role: true } },
          createdBy: { select: { id: true, username: true, role: true } },
          deletedBy: { select: { id: true, username: true, role: true } },
          category: { select: { name: true } },
          subCategory: { select: { name: true } },
          _count: { select: { favorites: true, clicks: true } },
          editHistory: {
            include: { user: { select: { id: true, username: true, role: true } } },
            orderBy: { editedAt: 'desc' },
          },
        },
      });
    } else {
      return res.status(403).json({ error: "Not authorized to view deleted products" });
    }

    res.json({
      count: deletedProducts.length,
      products: deletedProducts.map((p) => ({
        id: p.id,
        name: p.name,
        image: p.images && p.images.length > 0 ? p.images[0] : null,
        images: p.images || [],
        price: p.price,
        discount: p.discount,
        endDate: p.expiresAt ? p.expiresAt.toISOString() : null,
        startDate: p.startDate ? p.startDate.toISOString() : p.createdAt.toISOString(),
        company: p.company?.username || "Unknown",
        companyId: p.company?.id,
        createdBy: p.createdBy?.username || null,
        createdByRole: p.createdBy?.role || null,
        deletedBy: p.deletedBy?.username || null,
        deletedByRole: p.deletedBy?.role || null,
        deletedAt: p.updatedAt ? p.updatedAt.toISOString() : p.createdAt.toISOString(),
        category: p.category?.name || null,
        subCategory: p.subCategory?.name || null,
        Likes: p._count?.favorites || 0,
        Clicks: p._count?.clicks || 0,
        description: p.description || '',
        link: p.link || '',
        editHistory: (p.editHistory || []).map(e => ({
          username: e.user?.username || 'Unknown',
          role: e.user?.role || null,
          editedAt: e.editedAt.toISOString(),
        })),
      })),
    });
  } catch (err) {
    console.error("Error fetching deleted products:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { status: "ACTIVE" },
      include: {
        category: true,
        subCategory: true,
        createdBy: { select: { id: true, username: true, role: true } },
        company: { select: { id: true, username: true, role: true } },
      },
    });

    res.json(
      products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: p.price,
        discount: p.discount || 50, // Added
        link: p.link, // Added
        images: p.images, // Added
        status: p.status,
        startDate: p.startDate,
        expiresAt: p.expiresAt,
        createdAt: p.createdAt,
        companyId: p.companyId,
        company: p.company?.username || null,
        companyName: p.company?.username || null,
        createdBy: p.createdBy?.username || null,
        createdById: p.createdById,
        category: p.category?.name || null,
        categoryId: p.categoryId,
        subCategory: p.subCategory?.name || null,
        subCategoryId: p.subCategoryId,
        subCategoryIds: p.subCategoryIds || [],
      }))
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// New function to update product details including images, link, discount
export const updateProductDetails = async (req, res) => {
  const { productId } = req.params;
  const { discount, link, images, name, description, price, categoryId, subCategoryId, subCategoryIds, startDate, expiresAt } = req.body;
  const user = req.user;

  try {
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Check if company is paused
    if (req.user.role !== "SUPER_ADMIN") {
      const companySub = await prisma.subscription.findUnique({ where: { companyId: product.companyId } });
      if (companySub && companySub.status === "CANCELLED") {
        return res.status(403).json({ error: "This company is paused. Cannot edit products." });
      }
    }

    // Authorization check
    if (req.user.role !== "SUPER_ADMIN" && req.user.id !== product.companyId) {
      const assignment = await prisma.companyAdmin.findFirst({
        where: {
          adminId: req.user.id,
          companyId: product.companyId,
          canEdit: true,
        },
      });

      if (!assignment) {
        return res
          .status(403)
          .json({ error: "Not authorized to update this product" });
      }
    }

    // Resolve multi-category if subCategoryIds provided
    let resolvedCategoryId = categoryId !== undefined ? categoryId : product.categoryId;
    let resolvedSubCategoryId = subCategoryId !== undefined ? subCategoryId : product.subCategoryId;
    let resolvedSubCategoryIds = product.subCategoryIds || [];

    if (subCategoryIds !== undefined && Array.isArray(subCategoryIds)) {
      resolvedSubCategoryIds = subCategoryIds;
      if (subCategoryIds.length > 0) {
        const firstSub = await prisma.subCategory.findUnique({ where: { id: subCategoryIds[0] }, include: { category: true } });
        if (firstSub) {
          resolvedCategoryId = firstSub.categoryId;
          resolvedSubCategoryId = firstSub.id;
        }
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        discount: discount !== undefined ? parseFloat(discount) : product.discount,
        link: link !== undefined ? link : product.link,
        images: images !== undefined ? images : product.images,
        name: name !== undefined ? name : product.name,
        description: description !== undefined ? description : product.description,
        price: price !== undefined ? parseFloat(price) : product.price,
        categoryId: resolvedCategoryId,
        subCategoryId: resolvedSubCategoryId,
        subCategoryIds: resolvedSubCategoryIds,
        startDate: startDate !== undefined ? (startDate ? new Date(startDate) : null) : product.startDate,
        expiresAt: expiresAt !== undefined ? (expiresAt ? new Date(expiresAt) : null) : product.expiresAt,
      },
    });

    // Record edit history
    await prisma.productEditHistory.create({
      data: {
        productId: productId,
        userId: req.user.id,
      },
    });

    res.json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== GET CATEGORIES (PUBLIC) =====================
export const getCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      include: {
        subCategories: {
          select: { id: true, name: true, image: true },
          orderBy: { name: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });

    const formatted = categories.map((c) => ({
      id: c.id,
      name: c.name,
      image: c.image,
      subcategories: c.subCategories.map((s) => s.name),
      subcategoriesData: c.subCategories,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== SEARCH PRODUCTS (PUBLIC) =====================
export const searchProducts = async (req, res) => {
  const { q, category, subcategory } = req.query;

  try {
    // Save search query to history if user is authenticated and query is non-empty
    if (req.user?.id && q && q.trim().length > 0) {
      prisma.searchHistory.create({
        data: { query: q.trim().toLowerCase(), userId: req.user.id },
      }).catch(() => {}); // fire-and-forget, don't block search
    }

    const now = new Date();
    const where = {
      status: "ACTIVE",
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
      AND: [{ OR: [{ startDate: null }, { startDate: { lte: now } }] }],
    };

    if (q) {
      where.AND.push({
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { description: { contains: q, mode: "insensitive" } },
          { company: { username: { contains: q, mode: "insensitive" } } },
        ],
      });
    }

    if (category) {
      where.category = { name: { equals: category, mode: "insensitive" } };
    }
    if (subcategory) {
      where.subCategory = { name: { equals: subcategory, mode: "insensitive" } };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        company: { select: { id: true, username: true, fullName: true } },
        category: { select: { id: true, name: true } },
        subCategory: { select: { id: true, name: true } },
        _count: { select: { favorites: true, clicks: true, ratings: true } },
        ratings: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = products.map((p) => {
      const validRatings = p.ratings.filter(r => r.rating != null);
      const avgRating =
        validRatings.length > 0
          ? parseFloat(
              (validRatings.reduce((s, r) => s + r.rating, 0) / validRatings.length).toFixed(1)
            )
          : 0;

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        company: p.company?.username ?? null,
        companyName: p.company?.fullName ?? p.company?.username ?? null,
        companyID: p.companyId,
        category: [
          p.category?.name ?? "General",
          ...(p.subCategory ? [p.subCategory.name] : []),
        ],
        price: p.price,
        discount: p.discount ?? 50,
        rating: avgRating,
        Likes: p._count.favorites,
        Clicks: p._count.clicks,
        Link: p.link ?? "",
        images:
          p.images && p.images.length > 0
            ? p.images
            : [
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
              ],
        startDate: p.startDate || p.createdAt,
        endDate: p.expiresAt ?? new Date(p.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    });

    res.json(formatted);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== SYNC CATEGORIES (ADMIN) =====================
export const syncCategories = async (req, res) => {
  try {
    await syncCategoriesToDB();

    // Re-fetch to get counts for the response
    const categories = await prisma.category.findMany({
      include: { subCategories: true },
    });
    const totalSubs = categories.reduce((sum, c) => sum + c.subCategories.length, 0);

    res.json({
      message: "Categories synced successfully",
      total: categories.length,
      totalSubcategories: totalSubs,
    });
  } catch (error) {
    console.error("Error syncing categories:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== TRENDING SEARCHES (PUBLIC) =====================
export const getTrendingSearches = async (req, res) => {
  try {
    // Get searches from the last 30 days, group by query, count occurrences
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const searches = await prisma.searchHistory.groupBy({
      by: ["query"],
      where: {
        createdAt: { gte: thirtyDaysAgo },
        query: { not: "" },
      },
      _count: { query: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    });

    const trending = searches.map((s, i) => ({
      id: i + 1,
      text: s.query,
      count: s._count.query,
    }));

    res.json(trending);
  } catch (err) {
    console.error("Error fetching trending searches:", err);
    res.status(500).json({ error: "Failed to fetch trending searches" });
  }
};

// ===================== SEARCH SUGGESTIONS (PUBLIC) =====================
export const getSearchSuggestions = async (req, res) => {
  const { q } = req.query;
  if (!q || q.trim().length < 2) {
    return res.json([]);
  }

  try {
    const searchTerm = q.trim();
    const now = new Date();

    // Get matching products (name, company, category) — limit to 6
    const products = await prisma.product.findMany({
      where: {
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          {
            OR: [
              { name: { contains: searchTerm, mode: "insensitive" } },
              { company: { username: { contains: searchTerm, mode: "insensitive" } } },
              { company: { fullName: { contains: searchTerm, mode: "insensitive" } } },
              { category: { name: { contains: searchTerm, mode: "insensitive" } } },
            ],
          },
        ],
      },
      include: {
        company: { select: { id: true, username: true, fullName: true } },
        category: { select: { name: true } },
        _count: { select: { favorites: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const suggestions = products.map((p) => ({
      id: p.id,
      name: p.name,
      company: p.company?.fullName ?? p.company?.username ?? "",
      companyID: p.companyId,
      category: p.category?.name ?? "General",
      price: p.price,
      discount: p.discount ?? 0,
      image: p.images?.[0] || null,
      likes: p._count.favorites,
    }));

    res.json(suggestions);
  } catch (err) {
    console.error("Error fetching search suggestions:", err);
    res.status(500).json({ error: "Failed to fetch suggestions" });
  }
};

// ===================== GET COMPANY PUBLIC INFO (PUBLIC) =====================
export const getCompanyPublicInfo = async (req, res) => {
  const { companyName } = req.params;

  try {
    const company = await prisma.user.findFirst({
      where: {
        role: "ENTREPRISE",
        OR: [
          { username: { equals: companyName, mode: "insensitive" } },
          { fullName: { equals: companyName, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        phoneNumber: true,
        city: true,
        country: true,
        image: true,
        website: true,
        handle: true,
        description: true,
        createdAt: true,
        _count: { select: { followers: true, productsAsCompany: true } },
      },
    });

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    // Get active products for this company
    const products = await prisma.product.findMany({
      where: {
        companyId: company.id,
        status: "ACTIVE",
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        AND: [{ OR: [{ startDate: null }, { startDate: { lte: new Date() } }] }],
      },
      include: {
        category: { select: { name: true } },
        subCategory: { select: { name: true } },
        _count: { select: { favorites: true, clicks: true, ratings: true } },
        ratings: { select: { rating: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedProducts = products.map((p) => {
      const validRatings = p.ratings.filter(r => r.rating != null);
      const avgRating =
        validRatings.length > 0
          ? parseFloat(
              (validRatings.reduce((s, r) => s + r.rating, 0) / validRatings.length).toFixed(1)
            )
          : 0;

      return {
        id: p.id,
        name: p.name,
        company: company.username,
        companyName: company.fullName ?? company.username,
        companyID: company.id,
        category: [
          p.category?.name ?? "General",
          ...(p.subCategory ? [p.subCategory.name] : []),
        ],
        price: p.price,
        discount: p.discount ?? 50,
        rating: avgRating,
        Likes: p._count.favorites,
        Clicks: p._count.clicks,
        Link: p.link ?? "",
        images:
          p.images && p.images.length > 0
            ? p.images
            : [
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
                "https://placehold.co/400x400?text=No+Image",
              ],
        startDate: p.startDate || p.createdAt,
        endDate: p.expiresAt ?? new Date(p.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000),
      };
    });

    res.json({
      id: company.id,
      name: company.fullName ?? company.username,
      username: company.username,
      handle: `@${company.username}`,
      image: company.image,
      website: company.website,
      description: company.description,
      email: company.email,
      phone: company.phoneNumber,
      city: company.city,
      country: company.country,
      followers: company._count.followers,
      totalProducts: company._count.productsAsCompany,
      createdAt: company.createdAt,
      products: formattedProducts,
    });
  } catch (error) {
    console.error("Error fetching company info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};