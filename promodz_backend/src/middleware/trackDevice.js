// src/middleware/trackDevice.js
import { prisma } from "../utils/prisma.js";
import { UAParser } from "ua-parser-js";

export const trackDevice = async (req, res, next) => {
  try {
    const parser = new UAParser(req.headers["user-agent"]);
    const device = parser.getResult();

    // Map UAParser values to Prisma enum values
    const mapDeviceType = (type) => {
      switch (type) {
        case "mobile":
          return "MOBILE";
        case "tablet":
          return "TABLET";
        default:
          return "DESKTOP"; // fallback for undefined (desktop)
      }
    };

    await prisma.userActivity.create({
      data: {
        userId: req.user?.id || null,
        action: "visit",
        deviceType: mapDeviceType(device.device?.type),
        os: device.os?.name || "unknown",
        browser: device.browser?.name || "unknown",
        city: req.city || "unknown",
      },
    });

    next();
  } catch (error) {
    console.error("Device tracking failed:", error);
    next(); // don't block request flow
  }
};
