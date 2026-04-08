import { checkSubscriptionStatus } from "../controllers/subscriptionController.js";

// Middleware to check if company has active subscription
export const requireActiveSubscription = async (req, res, next) => {
  try {
    // Only check for company users
    if (req.user.role !== "ENTREPRENEUR") {
      return next();
    }

    const subscriptionStatus = await checkSubscriptionStatus(req.user.id);

    if (!subscriptionStatus.hasSubscription) {
      return res.status(402).json({
        error: "Payment Required",
        message: "You need an active subscription to access this feature.",
      });
    }

    if (!subscriptionStatus.isActive) {
      return res.status(402).json({
        error: "Subscription Expired",
        message: "Your subscription has expired. Please renew to continue using our services.",
        daysRemaining: subscriptionStatus.daysRemaining,
      });
    }

    // Attach subscription info to request
    req.subscription = subscriptionStatus.subscription;
    next();
  } catch (error) {
    console.error("Subscription middleware error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Middleware to check specific subscription feature
export const checkSubscriptionFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      if (req.user.role !== "ENTREPRENEUR") {
        return next();
      }

      const subscription = await prisma.subscription.findUnique({
        where: { companyId: req.user.id },
        include: {
          features: {
            include: {
              feature: true,
            },
          },
        },
      });

      if (!subscription) {
        return res.status(402).json({
          error: "No Subscription",
          message: "You need a subscription to access this feature.",
        });
      }

      const feature = subscription.features.find(
        (f) => f.feature.name === featureName && f.isActive
      );

      if (!feature) {
        return res.status(403).json({
          error: "Feature Not Available",
          message: `This feature (${featureName}) is not available in your current plan.`,
        });
      }

      next();
    } catch (error) {
      console.error("Check feature middleware error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  };
};