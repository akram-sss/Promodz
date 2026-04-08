import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// ===================== SUPER ADMIN FUNCTIONS =====================

// Create or update subscription for a company
export const assignSubscription = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can manage subscriptions." });
    }

    const { companyId, plan, startDate, endDate, price, autoRenew = true, features = [] } = req.body;

    // Validate required fields
    if (!companyId || !plan || !startDate || !endDate || !price) {
      return res.status(400).json({ error: "companyId, plan, startDate, endDate, and price are required." });
    }

    // Validate company exists and is a company (ENTREPRENEUR role)
    const company = await prisma.user.findUnique({
      where: { id: companyId },
    });

    if (!company || company.role !== "ENTREPRISE") {
      return res.status(400).json({ error: "Invalid company ID or user is not a company." });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ error: "Invalid date format." });
    }

    if (end <= start) {
      return res.status(400).json({ error: "End date must be after start date." });
    }

    // Calculate next billing date (if auto-renew is enabled)
    let nextBillingDate = null;
    if (autoRenew) {
      nextBillingDate = new Date(end);
      nextBillingDate.setDate(nextBillingDate.getDate() + 1);
    }

    // Check if company already has a subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    let subscription;
    
    if (existingSubscription) {
      // Update existing subscription
      subscription = await prisma.subscription.update({
        where: { companyId },
        data: {
          plan,
          startDate: start,
          endDate: end,
          price,
          autoRenew,
          nextBillingDate,
          status: "ACTIVE",
        },
        include: {
          company: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
          features: {
            include: {
              feature: true,
            },
          },
        },
      });
    } else {
      // Create new subscription
      subscription = await prisma.subscription.create({
        data: {
          companyId,
          plan,
          startDate: start,
          endDate: end,
          price,
          autoRenew,
          nextBillingDate,
        },
        include: {
          company: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
      });
    }

    // Assign features if provided
    if (features.length > 0) {
      await assignFeaturesToSubscription(subscription.id, features);
    }

    // Get updated subscription with features
    const updatedSubscription = await prisma.subscription.findUnique({
      where: { id: subscription.id },
      include: {
        company: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
      },
    });

    res.status(200).json({
      message: existingSubscription ? "Subscription updated successfully." : "Subscription created successfully.",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Assign subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Helper function to assign features to subscription
async function assignFeaturesToSubscription(subscriptionId, features) {
  // Clear existing features
  await prisma.subscriptionFeature.deleteMany({
    where: { subscriptionId },
  });

  // Add new features
  for (const feature of features) {
    await prisma.subscriptionFeature.create({
      data: {
        subscriptionId,
        featureId: feature.featureId,
        isActive: feature.isActive !== undefined ? feature.isActive : true,
        value: feature.value,
      },
    });
  }
}

// Cancel subscription
export const cancelSubscription = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can cancel subscriptions." });
    }

    const { companyId } = req.params;

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found for this company." });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { companyId },
      data: {
        status: "CANCELLED",
        autoRenew: false,
      },
      include: {
        company: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    res.json({
      message: "Subscription cancelled successfully.",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all subscriptions
export const getAllSubscriptions = async (req, res) => {
  try {
    // SUPER_ADMIN sees all; ADMIN sees only assigned companies' subscriptions
    const isAdmin = req.user.role === "ADMIN";

    const { 
      status, 
      plan, 
      page = 1, 
      limit = 20,
      search 
    } = req.query;
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Build where clause
    const where = {};
    
    if (status) where.status = status;
    if (plan) where.plan = plan;

    // If ADMIN, restrict to assigned companies only
    if (isAdmin) {
      const assignments = await prisma.companyAdmin.findMany({
        where: { adminId: req.user.id },
        select: { companyId: true },
      });
      where.companyId = { in: assignments.map(a => a.companyId) };
    }
    
    if (search) {
      where.company = {
        OR: [
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { fullName: { contains: search, mode: "insensitive" } },
        ],
      };
    }

    const [subscriptions, total] = await Promise.all([
      prisma.subscription.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              username: true,
              email: true,
              fullName: true,
            },
          },
          features: {
            include: {
              feature: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.subscription.count({ where }),
    ]);

    res.json({
      subscriptions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Get subscriptions error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get subscription by company ID
export const getCompanySubscription = async (req, res) => {
  try {
    const { companyId } = req.params;

    // SUPER_ADMIN can view any; ADMIN can view assigned companies; ENTREPRISE can view own
    if (req.user.role === "ADMIN") {
      const assignment = await prisma.companyAdmin.findFirst({
        where: { adminId: req.user.id, companyId },
      });
      if (!assignment) {
        return res.status(403).json({ error: "You are not assigned to this company." });
      }
    } else if (req.user.role !== "SUPER_ADMIN" && req.user.id !== companyId) {
      return res.status(403).json({ error: "Forbidden: You can only view your own subscription or need admin privileges." });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: {
        company: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
          },
        },
        features: {
          include: {
            feature: true,
          },
        },
        invoices: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ 
        message: "No subscription found for this company.",
        hasSubscription: false,
      });
    }

    // Check if subscription is expired
    const now = new Date();
    const isExpired = subscription.endDate < now;
    const isActive = subscription.status === "ACTIVE" && !isExpired;

    res.json({
      subscription,
      isActive,
      isExpired,
      daysRemaining: isExpired ? 0 : Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)),
    });
  } catch (error) {
    console.error("Get company subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get subscription statistics
export const getSubscriptionStats = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can view subscription stats." });
    }

    const now = new Date();

    const [
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan,
      totalRevenue,
      upcomingRenewals,
    ] = await Promise.all([
      prisma.subscription.count(),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          endDate: { gt: now },
        },
      }),
      prisma.subscription.count({
        where: {
          OR: [
            { status: "EXPIRED" },
            { endDate: { lt: now } },
          ],
        },
      }),
      prisma.subscription.count({
        where: { status: "CANCELLED" },
      }),
      prisma.subscription.groupBy({
        by: ["plan"],
        _count: {
          id: true,
        },
        where: {
          status: "ACTIVE",
          endDate: { gt: now },
        },
      }),
      prisma.subscription.aggregate({
        _sum: {
          price: true,
        },
        where: {
          status: "ACTIVE",
        },
      }),
      prisma.subscription.count({
        where: {
          status: "ACTIVE",
          endDate: {
            gt: now,
            lt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000), // Next 30 days
          },
        },
      }),
    ]);

    res.json({
      totalSubscriptions,
      activeSubscriptions,
      expiredSubscriptions,
      cancelledSubscriptions,
      subscriptionsByPlan: subscriptionsByPlan.map(item => ({
        plan: item.plan,
        count: item._count.id,
      })),
      totalRevenue: totalRevenue._sum.price || 0,
      upcomingRenewals,
    });
  } catch (error) {
    console.error("Get subscription stats error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Create invoice for subscription
export const createInvoice = async (req, res) => {
  try {
    if (req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Forbidden: Only super admins can create invoices." });
    }

    const { subscriptionId, amount, dueDate } = req.body;

    if (!subscriptionId || !amount || !dueDate) {
      return res.status(400).json({ error: "subscriptionId, amount, and dueDate are required." });
    }

    // Check if subscription exists
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
    });

    if (!subscription) {
      return res.status(404).json({ error: "Subscription not found." });
    }

    // Generate invoice number
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const invoice = await prisma.invoice.create({
      data: {
        subscriptionId,
        amount,
        dueDate: new Date(dueDate),
        invoiceNumber,
      },
      include: {
        subscription: {
          include: {
            company: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    res.status(201).json({
      message: "Invoice created successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== COMPANY FUNCTIONS =====================

// Update subscription dates only (for ADMIN/moderator role)
export const updateSubscriptionDates = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { startDate, endDate, plan, status } = req.body;

    if (!startDate && !endDate && !plan && !status) {
      return res.status(400).json({ error: "At least one of startDate, endDate, plan, or status is required." });
    }

    // Only SUPER_ADMIN can change plan; ADMIN can toggle status between ACTIVE/CANCELLED (pause/resume)
    if (plan && req.user.role !== "SUPER_ADMIN") {
      return res.status(403).json({ error: "Only super admins can change plan." });
    }
    if (status && req.user.role !== "SUPER_ADMIN") {
      // Allow ADMIN to only pause/resume (ACTIVE <-> CANCELLED)
      if (req.user.role === "ADMIN" && (status === "ACTIVE" || status === "CANCELLED")) {
        // OK — moderator can pause/resume
      } else {
        return res.status(403).json({ error: "Only super admins can change subscription status." });
      }
    }

    // Check if the company is assigned to this admin (moderator)
    if (req.user.role === "ADMIN") {
      const assignment = await prisma.companyAdmin.findFirst({
        where: { adminId: req.user.id, companyId },
      });
      if (!assignment) {
        return res.status(403).json({ error: "You are not assigned to this company." });
      }
    }

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      // Auto-create a FREE subscription if none exists (for companies created before subscriptions were auto-assigned)
      const now = new Date();
      const oneYearLater = new Date(now);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

      const newSubscription = await prisma.subscription.create({
        data: {
          companyId,
          plan: plan || "FREE",
          status: status || "ACTIVE",
          startDate: startDate ? new Date(startDate) : now,
          endDate: endDate ? new Date(endDate) : oneYearLater,
          price: 0,
          autoRenew: true,
        },
        include: {
          company: {
            select: { id: true, username: true, email: true, fullName: true },
          },
        },
      });

      return res.json({
        message: "Subscription created successfully.",
        subscription: newSubscription,
      });
    }

    const updateData = {};
    if (startDate) {
      const start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({ error: "Invalid start date format." });
      }
      updateData.startDate = start;
    }
    if (endDate) {
      const end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({ error: "Invalid end date format." });
      }
      updateData.endDate = end;
    }
    if (plan) {
      const validPlans = ["FREE", "BASIC", "PREMIUM", "ENTERPRISE"];
      if (!validPlans.includes(plan)) {
        return res.status(400).json({ error: `Invalid plan. Must be one of: ${validPlans.join(", ")}` });
      }
      updateData.plan = plan;
    }
    if (status) {
      const validStatuses = ["ACTIVE", "EXPIRED", "CANCELLED", "PENDING"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` });
      }
      updateData.status = status;
    }

    // Validate end > start (only if dates are being updated)
    if (startDate || endDate) {
      const finalStart = updateData.startDate || subscription.startDate;
      const finalEnd = updateData.endDate || subscription.endDate;
      if (finalEnd <= finalStart) {
        return res.status(400).json({ error: "End date must be after start date." });
      }
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { companyId },
      data: updateData,
      include: {
        company: {
          select: { id: true, username: true, email: true, fullName: true },
        },
      },
    });

    res.json({
      message: "Subscription dates updated successfully.",
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Update subscription dates error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get current company's subscription (for company users)
export const getMySubscription = async (req, res) => {
  try {
    const companyId = req.user.id;

    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
      include: {
        features: {
          include: {
            feature: true,
          },
        },
        invoices: {
          where: {
            status: "PENDING",
          },
          orderBy: { dueDate: "asc" },
        },
      },
    });

    if (!subscription) {
      return res.status(404).json({ 
        message: "No subscription found.",
        hasSubscription: false,
      });
    }

    // Check subscription status
    const now = new Date();
    const isExpired = subscription.endDate < now;
    const isActive = subscription.status === "ACTIVE" && !isExpired;

    res.json({
      subscription,
      isActive,
      isExpired,
      daysRemaining: isExpired ? 0 : Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)),
    });
  } catch (error) {
    console.error("Get my subscription error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ===================== UTILITY FUNCTIONS =====================

// Check if company has active subscription (middleware helper)
export const checkSubscriptionStatus = async (companyId) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      return {
        hasSubscription: false,
        isActive: false,
        message: "No subscription found",
      };
    }

    const now = new Date();
    const isExpired = subscription.endDate < now;
    const isActive = subscription.status === "ACTIVE" && !isExpired;

    return {
      hasSubscription: true,
      isActive,
      isExpired,
      subscription,
      daysRemaining: isExpired ? 0 : Math.ceil((subscription.endDate - now) / (1000 * 60 * 60 * 24)),
    };
  } catch (error) {
    console.error("Check subscription error:", error);
    return {
      hasSubscription: false,
      isActive: false,
      message: "Error checking subscription",
    };
  }
};

// Update subscription statuses (cron job function)
export const updateExpiredSubscriptions = async () => {
  try {
    const now = new Date();
    
    const expiredSubscriptions = await prisma.subscription.updateMany({
      where: {
        status: "ACTIVE",
        endDate: { lt: now },
      },
      data: {
        status: "EXPIRED",
      },
    });

    console.log(`Updated ${expiredSubscriptions.count} expired subscriptions`);
    return expiredSubscriptions.count;
  } catch (error) {
    console.error("Update expired subscriptions error:", error);
    return 0;
  }
};