// src/middleware/trackLocation.js
import { prisma } from "../utils/prisma.js";

import geoip from "geoip-lite"; 

export const trackLocation = async (req, res, next) => {
  try {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    console.log("Tracking location for IP:", ip);
    // Lookup geolocation
    const geo = geoip.lookup(ip);

    if (geo && geo.country === "DZ") { // "DZ" = Algeria
      await prisma.userActivity.create({
        data: {
          userId: req.user?.id || null,
          city: geo.city || "Unknown",
          country: "Algeria",
        },
      });
    }
  } catch (err) {
    console.error("Error tracking location:", err);
  }

  next();
};
