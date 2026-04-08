import { prisma } from "./prisma.js";

const CATEGORIES = [
  {
    name: "Fashion & Apparel",
    subcategories: ["Men's Clothing", "Women's Clothing", "Kids' Clothing", "Shoes", "Accessories & Jewelry"],
  },
  {
    name: "Electronics & Gadgets",
    subcategories: ["Smartphones", "Computers & Laptops", "TVs & Audio", "Smartwatches", "Tech Accessories"],
  },
  {
    name: "Home & Living",
    subcategories: ["Furniture", "Kitchenware", "Home Decor", "Lighting", "Bedding & Bath"],
  },
  {
    name: "Groceries & Food",
    subcategories: ["Fresh Produce", "Packaged Food", "Snacks & Drinks", "Organic & Gourmet", "Household Essentials"],
  },
  {
    name: "Beauty & Personal Care",
    subcategories: ["Skincare", "Haircare", "Makeup", "Fragrances", "Men's Grooming"],
  },
  {
    name: "Health & Fitness",
    subcategories: ["Supplements & Vitamins", "Fitness Equipment", "Medical Devices", "Yoga & Wellness"],
  },
  {
    name: "Toys, Hobbies & Entertainment",
    subcategories: ["Toys & Games", "Books & Comics", "Art & Crafts", "Musical Instruments", "Collectibles"],
  },
  {
    name: "Automotive & Tools",
    subcategories: ["Car Accessories", "Tools & Equipment", "Tires & Batteries", "Motorbike Gear", "DIY & Workshop"],
  },
  {
    name: "Travel & Tourism",
    subcategories: ["Flight Tickets", "Hotel Deals", "Vacation Packages", "Car Rentals", "Cruises", "Travel Insurance", "Airport Transfers"],
  },
];

export async function syncCategoriesToDB() {
  try {
    let created = 0;

    for (const cat of CATEGORIES) {
      const category = await prisma.category.upsert({
        where: { name: cat.name },
        update: {},
        create: { name: cat.name },
      });

      for (const subName of cat.subcategories) {
        const existing = await prisma.subCategory.findUnique({
          where: { name_categoryId: { name: subName, categoryId: category.id } },
        });
        if (!existing) {
          await prisma.subCategory.create({
            data: { name: subName, categoryId: category.id },
          });
          created++;
        }
      }
    }

    if (created > 0) {
      console.log(`Categories synced: ${created} new subcategories added.`);
    } else {
      console.log("Categories synced: all up to date.");
    }
  } catch (error) {
    console.error("Failed to sync categories on startup:", error.message);
  }
}
