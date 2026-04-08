import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const categories = [
  {
    name: "Fashion & Apparel",
    subcategories: [
      "Men's Clothing",
      "Women's Clothing",
      "Kids' Clothing",
      "Shoes",
      "Accessories & Jewelry"
    ]
  },
  {
    name: "Electronics & Gadgets",
    subcategories: [
      "Smartphones",
      "Computers & Laptops",
      "TVs & Audio",
      "Smartwatches",
      "Tech Accessories"
    ]
  },
  {
    name: "Home & Living",
    subcategories: [
      "Furniture",
      "Kitchenware",
      "Home Decor",
      "Lighting",
      "Bedding & Bath"
    ]
  },
  {
    name: "Groceries & Food",
    subcategories: [
      "Fresh Produce",
      "Packaged Food",
      "Snacks & Drinks",
      "Organic & Gourmet",
      "Household Essentials"
    ]
  },
  {
    name: "Beauty & Personal Care",
    subcategories: [
      "Skincare",
      "Haircare",
      "Makeup",
      "Fragrances",
      "Men's Grooming"
    ]
  },
  {
    name: "Health & Fitness",
    subcategories: [
      "Supplements & Vitamins",
      "Fitness Equipment",
      "Medical Devices",
      "Yoga & Wellness"
    ]
  },
  {
    name: "Toys, Hobbies & Entertainment",
    subcategories: [
      "Toys & Games",
      "Books & Comics",
      "Art & Crafts",
      "Musical Instruments",
      "Collectibles"
    ]
  },
  {
    name: "Automotive & Tools",
    subcategories: [
      "Car Accessories",
      "Tools & Equipment",
      "Tires & Batteries",
      "Motorbike Gear",
      "DIY & Workshop"
    ]
  },
  {
    name: "Travel & Tourism",
    subcategories: [
      "Flight Tickets",
      "Hotel Deals",
      "Vacation Packages",
      "Car Rentals",
      "Cruises",
      "Travel Insurance",
      "Airport Transfers"
    ]
  }
];

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function main() {
  console.log("Starting comprehensive database seeding...");

  // Clear existing data in correct order (respect foreign keys)
  console.log("Clearing existing data...");
  try {
    await prisma.topCompany.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.ad.deleteMany();
    await prisma.companyFollow.deleteMany();
    await prisma.companyAdmin.deleteMany();
    await prisma.subscriptionFeature.deleteMany();
    await prisma.feature.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.productRating.deleteMany();
    await prisma.productFavorite.deleteMany();
    await prisma.productClick.deleteMany();
    await prisma.companyClick.deleteMany();
    await prisma.product.deleteMany();
    await prisma.subCategory.deleteMany();
    await prisma.category.deleteMany();
    await prisma.userActivity.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.log("Some tables may not exist yet, continuing...", error.message);
  }

  // 1. Seed Categories and SubCategories
  console.log("Seeding categories and subcategories...");
  for (const cat of categories) {
    const createdCategory = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name }
    });

    for (const sub of cat.subcategories) {
      await prisma.subCategory.upsert({
        where: { name_categoryId: { name: sub, categoryId: createdCategory.id } },
        update: {},
        create: {
          name: sub,
          categoryId: createdCategory.id
        }
      });
    }
  }
  console.log("Categories and subcategories seeded!");

  // 2. Seed Users
  console.log("Seeding users...");

  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@promodz.com" },
    update: {},
    create: {
      email: "superadmin@promodz.com",
      username: "superadmin",
      fullName: "Super Administrator",
      phoneNumber: "+1234567890",
      password: await hashPassword("admin123"),
      role: "SUPER_ADMIN",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=1"
    }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@promodz.com" },
    update: {},
    create: {
      email: "admin@promodz.com",
      username: "admin",
      fullName: "Administrator",
      phoneNumber: "+1234567891",
      password: await hashPassword("admin123"),
      role: "ADMIN",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=2"
    }
  });

  // Company 1 - Huawei
  const companyUser = await prisma.user.upsert({
    where: { email: "huawei@promodz.com" },
    update: {},
    create: {
      email: "huawei@promodz.com",
      username: "huawei_tech",
      fullName: "HUAWEI",
      phoneNumber: "+861234567890",
      password: await hashPassword("huawei123"),
      role: "ENTREPRISE",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=3",
      website: "https://www.huawei.com",
      handle: "@huawei",
      companyName: "Huawei Technologies",
      address: "56 ABBANE RENOHANE",
      rc: "123456789",
      city: "ALGIERS",
      postalCode: "10000 - ALGER",
      country: "Algeria",
      description: "Leading global provider of ICT infrastructure and smart devices"
    }
  });

  // Company 2 - Samsung
  const samsung = await prisma.user.upsert({
    where: { email: "samsung@promodz.com" },
    update: {},
    create: {
      email: "samsung@promodz.com",
      username: "samsung_dz",
      fullName: "SAMSUNG",
      phoneNumber: "+821234567890",
      password: await hashPassword("samsung123"),
      role: "ENTREPRISE",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=5",
      website: "https://www.samsung.com",
      handle: "@samsung",
      companyName: "Samsung Electronics",
      address: "12 RUE DIDOUCHE MOURAD",
      rc: "987654321",
      city: "ORAN",
      postalCode: "31000 - ORAN",
      country: "Algeria",
      description: "Global leader in technology, innovation and design"
    }
  });

  // Company 3 - Zara
  const zara = await prisma.user.upsert({
    where: { email: "zara@promodz.com" },
    update: {},
    create: {
      email: "zara@promodz.com",
      username: "zara_dz",
      fullName: "ZARA",
      phoneNumber: "+341234567890",
      password: await hashPassword("zara123"),
      role: "ENTREPRISE",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=6",
      website: "https://www.zara.com",
      handle: "@zara",
      companyName: "Zara Algeria",
      address: "24 RUE LARBI BEN M'HIDI",
      rc: "456789123",
      city: "CONSTANTINE",
      postalCode: "25000 - CONSTANTINE",
      country: "Algeria",
      description: "International fashion retailer with latest trends"
    }
  });

  // Company 4 - Decathlon
  const decathlon = await prisma.user.upsert({
    where: { email: "decathlon@promodz.com" },
    update: {},
    create: {
      email: "decathlon@promodz.com",
      username: "decathlon_dz",
      fullName: "DECATHLON",
      phoneNumber: "+331234567890",
      password: await hashPassword("decathlon123"),
      role: "ENTREPRISE",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=7",
      website: "https://www.decathlon.dz",
      handle: "@decathlon",
      companyName: "Decathlon Algeria",
      address: "Centre Commercial Bab Ezzouar",
      rc: "789123456",
      city: "ALGIERS",
      postalCode: "16000 - ALGER",
      country: "Algeria",
      description: "Sports equipment and clothing for all"
    }
  });

  // Regular User
  const regularUser = await prisma.user.upsert({
    where: { email: "user@promodz.com" },
    update: {},
    create: {
      email: "user@promodz.com",
      username: "regular_user",
      fullName: "John Doe",
      phoneNumber: "+1234567892",
      password: await hashPassword("user123"),
      role: "USER",
      active: true,
      image: "https://i.pravatar.cc/150?img=4"
    }
  });

  // Moderator (ADMIN role with restricted permissions)
  const moderator = await prisma.user.upsert({
    where: { email: "moderator@promodz.com" },
    update: {},
    create: {
      email: "moderator@promodz.com",
      username: "moderator",
      fullName: "Moderator User",
      phoneNumber: "+1234567893",
      password: await hashPassword("moderator123"),
      role: "ADMIN",
      active: true,
      verified: true,
      image: "https://i.pravatar.cc/150?img=8",
      city: "ALGIERS",
      country: "Algeria"
    }
  });

  console.log("Users seeded! (8 total: SuperAdmin, Admin, Moderator, 4 Companies, 1 User)");

  // 3. Seed Subscriptions for Companies
  console.log("Seeding subscriptions...");
  const companies = [companyUser, samsung, zara, decathlon];
  const subscriptions = [];
  for (const co of companies) {
    const sub = await prisma.subscription.upsert({
      where: { companyId: co.id },
      update: {},
      create: {
        companyId: co.id,
        plan: "PREMIUM",
        status: "ACTIVE",
        startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
        price: 99.99,
        autoRenew: true,
        paymentMethod: "Credit Card",
        lastPaymentDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    });
    subscriptions.push(sub);
  }
  console.log("Subscriptions seeded!");

  // 4. Seed Features
  console.log("Seeding features...");
  const features = [
    { name: "product_limit", description: "Maximum number of products", type: "NUMBER", defaultValue: "100" },
    { name: "unlimited_products", description: "Unlimited products", type: "BOOLEAN", defaultValue: "false" },
    { name: "analytics", description: "Access to analytics dashboard", type: "BOOLEAN", defaultValue: "true" },
    { name: "priority_support", description: "Priority customer support", type: "BOOLEAN", defaultValue: "true" },
    { name: "custom_domain", description: "Custom domain support", type: "BOOLEAN", defaultValue: "false" },
    { name: "ad_free", description: "Ad-free experience", type: "BOOLEAN", defaultValue: "true" },
  ];

  for (const feature of features) {
    await prisma.feature.upsert({
      where: { name: feature.name },
      update: {},
      create: feature
    });
  }
  console.log("Features seeded!");

  // 5. Assign features to all subscriptions
  console.log("Assigning features to subscriptions...");
  const allFeatures = await prisma.feature.findMany();
  for (const sub of subscriptions) {
    for (const feature of allFeatures) {
      await prisma.subscriptionFeature.upsert({
        where: { subscriptionId_featureId: { subscriptionId: sub.id, featureId: feature.id } },
        update: {},
        create: {
          subscriptionId: sub.id,
          featureId: feature.id,
          isActive: true,
          value: feature.defaultValue
        }
      });
    }
  }
  console.log("Subscription features assigned!");

  // 6. Seed Products for all Companies
  console.log("Seeding products...");

  const getCatSub = async (catName, subName) => {
    const cat = await prisma.category.findFirst({ where: { name: catName } });
    const sub = await prisma.subCategory.findFirst({ where: { name: subName, categoryId: cat.id } });
    return { categoryId: cat.id, subCategoryId: sub.id };
  };

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  const productDefs = [
    // === Electronics & Gadgets (Huawei) ===
    { name: "Huawei P60 Pro", desc: "Flagship smartphone with Leica camera", price: 999.99, discount: 15, cat: "Electronics & Gadgets", sub: "Smartphones", company: companyUser, link: "https://www.huawei.com/p60-pro", images: ["https://picsum.photos/seed/p60/400/400","https://picsum.photos/seed/p60b/400/400"] },
    { name: "Huawei MateBook X Pro", desc: "Ultra-slim laptop with touchscreen", price: 1499.99, discount: 10, cat: "Electronics & Gadgets", sub: "Computers & Laptops", company: companyUser, link: "https://www.huawei.com/matebook", images: ["https://picsum.photos/seed/matebook/400/400"] },
    { name: "Huawei Watch GT 4", desc: "Premium smartwatch with 14-day battery life", price: 349.99, discount: 20, cat: "Electronics & Gadgets", sub: "Smartwatches", company: companyUser, link: "https://www.huawei.com/watch-gt4", images: ["https://picsum.photos/seed/gt4/400/400"] },
    { name: "Huawei FreeBuds Pro 3", desc: "Active noise cancelling earbuds with Hi-Fi sound", price: 199.99, discount: 25, cat: "Electronics & Gadgets", sub: "Tech Accessories", company: companyUser, link: "https://www.huawei.com/freebuds-pro3", images: ["https://picsum.photos/seed/freebuds/400/400"] },
    { name: "Huawei Vision S 65", desc: "65-inch 4K smart TV with Harmony OS", price: 899.99, discount: 12, cat: "Electronics & Gadgets", sub: "TVs & Audio", company: companyUser, link: "https://www.huawei.com/vision-s65", images: ["https://picsum.photos/seed/visions/400/400"] },

    // === Electronics & Gadgets (Samsung) ===
    { name: "Samsung Galaxy S24 Ultra", desc: "AI-powered smartphone with S Pen", price: 1199.99, discount: 10, cat: "Electronics & Gadgets", sub: "Smartphones", company: samsung, link: "https://www.samsung.com/s24-ultra", images: ["https://picsum.photos/seed/s24/400/400","https://picsum.photos/seed/s24b/400/400"] },
    { name: "Samsung Galaxy Book4 Pro", desc: "Intel Core Ultra laptop with AMOLED display", price: 1399.99, discount: 15, cat: "Electronics & Gadgets", sub: "Computers & Laptops", company: samsung, link: "https://www.samsung.com/galaxy-book4", images: ["https://picsum.photos/seed/book4/400/400"] },
    { name: "Samsung Galaxy Watch 6", desc: "Health and fitness smartwatch with BioActive sensor", price: 299.99, discount: 20, cat: "Electronics & Gadgets", sub: "Smartwatches", company: samsung, link: "https://www.samsung.com/watch6", images: ["https://picsum.photos/seed/watch6/400/400"] },
    { name: "Samsung 65 OLED TV", desc: "4K OLED with AI upscaling and Dolby Atmos", price: 1599.99, discount: 18, cat: "Electronics & Gadgets", sub: "TVs & Audio", company: samsung, link: "https://www.samsung.com/oled-tv", images: ["https://picsum.photos/seed/oledtv/400/400"] },
    { name: "Samsung Galaxy Buds FE", desc: "Premium sound with active noise cancelling", price: 99.99, discount: 30, cat: "Electronics & Gadgets", sub: "Tech Accessories", company: samsung, link: "https://www.samsung.com/buds-fe", images: ["https://picsum.photos/seed/budsfe/400/400"] },

    // === Fashion & Apparel (Zara) ===
    { name: "Zara Linen Blazer", desc: "Relaxed fit linen blazer in sand", price: 89.99, discount: 30, cat: "Fashion & Apparel", sub: "Men's Clothing", company: zara, link: "https://www.zara.com/linen-blazer", images: ["https://picsum.photos/seed/blazer/400/400"] },
    { name: "Zara Floral Midi Dress", desc: "Elegant floral print midi dress for summer", price: 69.99, discount: 25, cat: "Fashion & Apparel", sub: "Women's Clothing", company: zara, link: "https://www.zara.com/floral-dress", images: ["https://picsum.photos/seed/dress/400/400","https://picsum.photos/seed/dressb/400/400"] },
    { name: "Zara Kids Denim Jacket", desc: "Classic denim jacket for kids ages 6-12", price: 39.99, discount: 20, cat: "Fashion & Apparel", sub: "Kids' Clothing", company: zara, link: "https://www.zara.com/kids-denim", images: ["https://picsum.photos/seed/kidsdenim/400/400"] },
    { name: "Zara Leather Sneakers", desc: "Minimalist white leather sneakers", price: 79.99, discount: 15, cat: "Fashion & Apparel", sub: "Shoes", company: zara, link: "https://www.zara.com/sneakers", images: ["https://picsum.photos/seed/sneakers/400/400"] },
    { name: "Zara Gold Chain Necklace", desc: "18K gold-plated chain necklace", price: 29.99, discount: 10, cat: "Fashion & Apparel", sub: "Accessories & Jewelry", company: zara, link: "https://www.zara.com/gold-necklace", images: ["https://picsum.photos/seed/necklace/400/400"] },

    // === Health & Fitness (Decathlon) ===
    { name: "Decathlon Treadmill 520", desc: "Foldable treadmill with 16 km/h max speed", price: 599.99, discount: 20, cat: "Health & Fitness", sub: "Fitness Equipment", company: decathlon, link: "https://www.decathlon.dz/treadmill-520", images: ["https://picsum.photos/seed/treadmill/400/400"] },
    { name: "Decathlon Yoga Mat Pro", desc: "Non-slip 6mm thick yoga mat with carry strap", price: 29.99, discount: 15, cat: "Health & Fitness", sub: "Yoga & Wellness", company: decathlon, link: "https://www.decathlon.dz/yoga-mat", images: ["https://picsum.photos/seed/yogamat/400/400"] },
    { name: "Whey Protein Isolate 2kg", desc: "Premium whey protein with 25g per serving", price: 49.99, discount: 10, cat: "Health & Fitness", sub: "Supplements & Vitamins", company: decathlon, link: "https://www.decathlon.dz/whey-protein", images: ["https://picsum.photos/seed/whey/400/400"] },
    { name: "Resistance Bands Set", desc: "5-level resistance bands for home workouts", price: 19.99, discount: 25, cat: "Health & Fitness", sub: "Fitness Equipment", company: decathlon, link: "https://www.decathlon.dz/resistance-bands", images: ["https://picsum.photos/seed/bands/400/400"] },

    // === Home & Living ===
    { name: "Samsung Smart Fridge", desc: "Family Hub smart refrigerator with touchscreen", price: 2499.99, discount: 10, cat: "Home & Living", sub: "Kitchenware", company: samsung, link: "https://www.samsung.com/smart-fridge", images: ["https://picsum.photos/seed/fridge/400/400"] },
    { name: "Zara Home Velvet Cushion", desc: "Luxury velvet cushion cover 45x45cm", price: 19.99, discount: 20, cat: "Home & Living", sub: "Home Decor", company: zara, link: "https://www.zara.com/home-cushion", images: ["https://picsum.photos/seed/cushion/400/400"] },
    { name: "Samsung LED Desk Lamp", desc: "Wireless charging desk lamp with dimmer", price: 89.99, discount: 25, cat: "Home & Living", sub: "Lighting", company: samsung, link: "https://www.samsung.com/desk-lamp", images: ["https://picsum.photos/seed/desklamp/400/400"] },
    { name: "Zara Cotton Bedding Set", desc: "100% organic cotton king-size bedding set", price: 129.99, discount: 15, cat: "Home & Living", sub: "Bedding & Bath", company: zara, link: "https://www.zara.com/bedding", images: ["https://picsum.photos/seed/bedding/400/400"] },

    // === Beauty & Personal Care ===
    { name: "Zara Red Vanilla EDP", desc: "Eau de Parfum 100ml warm and sensual", price: 25.99, discount: 15, cat: "Beauty & Personal Care", sub: "Fragrances", company: zara, link: "https://www.zara.com/red-vanilla", images: ["https://picsum.photos/seed/perfume/400/400"] },
    { name: "Zara Night Pour Homme", desc: "Fresh woody fragrance for men 100ml", price: 22.99, discount: 20, cat: "Beauty & Personal Care", sub: "Men's Grooming", company: zara, link: "https://www.zara.com/night-homme", images: ["https://picsum.photos/seed/cologne/400/400"] },

    // === Groceries & Food ===
    { name: "Organic Energy Bar Pack", desc: "12-pack natural energy bars for athletes", price: 14.99, discount: 25, cat: "Groceries & Food", sub: "Snacks & Drinks", company: decathlon, link: "https://www.decathlon.dz/energy-bars", images: ["https://picsum.photos/seed/energybars/400/400"] },

    // === Toys, Hobbies & Entertainment ===
    { name: "Samsung Galaxy Tab S9 FE", desc: "Creative tablet for drawing and entertainment", price: 449.99, discount: 12, cat: "Toys, Hobbies & Entertainment", sub: "Art & Crafts", company: samsung, link: "https://www.samsung.com/tab-s9-fe", images: ["https://picsum.photos/seed/tabs9/400/400"] },

    // === Automotive & Tools ===
    { name: "Decathlon Car Emergency Kit", desc: "Complete roadside emergency kit", price: 39.99, discount: 10, cat: "Automotive & Tools", sub: "Car Accessories", company: decathlon, link: "https://www.decathlon.dz/car-kit", images: ["https://picsum.photos/seed/carkit/400/400"] },
    { name: "Decathlon Multi-Tool Set", desc: "48-piece precision tool set for home repairs", price: 59.99, discount: 20, cat: "Automotive & Tools", sub: "Tools & Equipment", company: decathlon, link: "https://www.decathlon.dz/tool-set", images: ["https://picsum.photos/seed/toolset/400/400"] },
  ];

  let productCount = 0;
  for (const p of productDefs) {
    const { categoryId, subCategoryId } = await getCatSub(p.cat, p.sub);
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        discount: p.discount,
        link: p.link,
        images: p.images,
        status: "ACTIVE",
        expiresAt: new Date(now + (30 + Math.floor(Math.random() * 60)) * day),
        companyId: p.company.id,
        createdById: p.company.id,
        categoryId,
        subCategoryId,
      }
    });
    productCount++;
  }
  console.log(productCount + " Products seeded!");

  // 7. Seed Company Admin relationships
  console.log("Seeding company admin relationships...");
  // Admin gets all 4 companies with full permissions
  for (const co of companies) {
    const existing = await prisma.companyAdmin.findFirst({
      where: { adminId: admin.id, companyId: co.id }
    });
    if (!existing) {
      await prisma.companyAdmin.create({
        data: {
          adminId: admin.id,
          companyId: co.id,
          canViews: true,
          canEdit: true,
          canDelete: false,
          canAdd: true
        }
      });
    }
  }
  // Moderator gets only Huawei and Samsung with limited permissions
  const moderatorCompanies = [companyUser, samsung];
  for (const co of moderatorCompanies) {
    const existing = await prisma.companyAdmin.findFirst({
      where: { adminId: moderator.id, companyId: co.id }
    });
    if (!existing) {
      await prisma.companyAdmin.create({
        data: {
          adminId: moderator.id,
          companyId: co.id,
          canViews: true,
          canEdit: true,
          canDelete: false,
          canAdd: false
        }
      });
    }
  }
  console.log("Company admin relationships seeded!");

  // 8. Seed Follow relationships
  console.log("Seeding follow relationships...");
  for (const co of companies) {
    await prisma.companyFollow.upsert({
      where: { userId_companyId: { userId: regularUser.id, companyId: co.id } },
      update: {},
      create: {
        userId: regularUser.id,
        companyId: co.id
      }
    });
  }
  console.log("Follow relationships seeded!");

  // 9. Seed some product clicks for analytics
  console.log("Seeding product clicks for analytics...");
  const allProducts = await prisma.product.findMany();
  for (const product of allProducts) {
    const clickCount = 5 + Math.floor(Math.random() * 20);
    for (let i = 0; i < clickCount; i++) {
      await prisma.productClick.create({
        data: {
          productId: product.id,
          createdAt: new Date(now - Math.floor(Math.random() * 30) * day),
        }
      });
    }
  }
  console.log("Product clicks seeded!");

  // 10. Seed company clicks for analytics
  console.log("Seeding company clicks for analytics...");
  for (const co of companies) {
    const clickCount = 10 + Math.floor(Math.random() * 30);
    for (let i = 0; i < clickCount; i++) {
      await prisma.companyClick.create({
        data: {
          companyId: co.id,
          createdAt: new Date(now - Math.floor(Math.random() * 30) * day),
        }
      });
    }
  }
  console.log("Company clicks seeded!");

  // 11. Seed user activity for analytics
  console.log("Seeding user activity...");
  const cities = ["Algiers", "Oran", "Constantine", "Annaba", "Blida", "Setif", "Batna"];
  const deviceTypes = ["MOBILE", "DESKTOP", "TABLET"];
  for (let i = 0; i < 50; i++) {
    await prisma.userActivity.create({
      data: {
        action: "page_view",
        city: cities[Math.floor(Math.random() * cities.length)],
        country: "Algeria",
        deviceType: deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
        createdAt: new Date(now - Math.floor(Math.random() * 30) * day),
      }
    });
  }
  console.log("User activity seeded!");

  // 12. Seed Ads
  console.log("Seeding ads...");
  await prisma.ad.create({
    data: {
      title: "Summer Sale 2024",
      description: "Get up to 50% off on all electronics",
      link: "https://promodz.com/summer-sale",
      imageUrl: "https://picsum.photos/seed/summersale/800/400",
      position: "explore-feed",
      isActive: true,
      createdById: superAdmin.id,
      expiresAt: new Date(now + 60 * day)
    }
  });
  await prisma.ad.create({
    data: {
      title: "Back to School",
      description: "Best deals on laptops and tablets",
      link: "https://promodz.com/back-to-school",
      imageUrl: "https://picsum.photos/seed/backtoschool/800/400",
      position: "home-banner",
      isActive: true,
      createdById: superAdmin.id,
      expiresAt: new Date(now + 45 * day)
    }
  });
  console.log("Ads seeded!");

  // 13. Seed Feedback
  console.log("Seeding feedback...");
  const huaweiProduct = await prisma.product.findFirst({ where: { name: "Huawei P60 Pro" } });
  if (huaweiProduct) {
    await prisma.feedback.create({
      data: {
        message: "Great platform! Love the product variety.",
        type: "feature",
        status: "reviewed",
        userId: regularUser.id,
        productId: huaweiProduct.id
      }
    });
  }
  console.log("Feedback seeded!");

  // 14. Seed Notifications
  console.log("Seeding notifications...");
  for (const co of companies) {
    await prisma.notification.create({
      data: {
        userId: co.id,
        title: "Subscription Activated",
        message: "Your PREMIUM subscription has been activated successfully",
        type: "subscription",
        isRead: false
      }
    });
  }
  console.log("Notifications seeded!");

  // 15. Seed some ratings
  console.log("Seeding product ratings...");
  for (const product of allProducts.slice(0, 10)) {
    await prisma.productRating.upsert({
      where: { userId_productId: { userId: regularUser.id, productId: product.id } },
      update: {},
      create: {
        userId: regularUser.id,
        productId: product.id,
        rating: 3 + Math.floor(Math.random() * 3), // 3-5 stars
      }
    });
  }
  console.log("Ratings seeded!");

  // 16. Seed some favorites
  console.log("Seeding favorites...");
  for (const product of allProducts.slice(0, 6)) {
    await prisma.productFavorite.upsert({
      where: { userId_productId: { userId: regularUser.id, productId: product.id } },
      update: {},
      create: {
        userId: regularUser.id,
        productId: product.id,
      }
    });
  }
  console.log("Favorites seeded!");

  // 17. Seed some DELETED products for deleted promotions feature
  console.log("Seeding deleted products...");
  const deletedProductDefs = [
    { name: "Huawei Nova 11 [DELETED]", desc: "Mid-range phone discontinued", price: 449.99, discount: 30, cat: "Electronics & Gadgets", sub: "Smartphones", company: companyUser, deletedBy: superAdmin },
    { name: "Samsung Galaxy A15 [DELETED]", desc: "Budget phone removed from catalog", price: 199.99, discount: 40, cat: "Electronics & Gadgets", sub: "Smartphones", company: samsung, deletedBy: admin },
    { name: "Zara Summer Shorts [DELETED]", desc: "Out of season product", price: 34.99, discount: 50, cat: "Fashion & Apparel", sub: "Men's Clothing", company: zara, deletedBy: zara },
    { name: "Decathlon Yoga Block [DELETED]", desc: "Product recalled", price: 12.99, discount: 15, cat: "Health & Fitness", sub: "Yoga & Wellness", company: decathlon, deletedBy: superAdmin },
    { name: "Samsung 32 Monitor [DELETED]", desc: "Replaced by newer model", price: 399.99, discount: 20, cat: "Electronics & Gadgets", sub: "TVs & Audio", company: samsung, deletedBy: samsung },
  ];

  for (const p of deletedProductDefs) {
    const { categoryId, subCategoryId } = await getCatSub(p.cat, p.sub);
    await prisma.product.create({
      data: {
        name: p.name,
        description: p.desc,
        price: p.price,
        discount: p.discount,
        link: `https://promodz.com/deleted/${p.name.replace(/\s/g, '-').toLowerCase()}`,
        images: ["https://picsum.photos/seed/deleted/400/400"],
        status: "DELETED",
        expiresAt: new Date(now - 5 * day),
        companyId: p.company.id,
        createdById: p.company.id,
        categoryId,
        subCategoryId,
        deletedById: p.deletedBy.id,
      }
    });
  }
  console.log("Deleted products seeded!");

  // 18. Seed Top Companies
  console.log("Seeding top companies...");
  const topCompanyDefs = [
    { company: companyUser, name: "Huawei Technologies", text: "Leading global provider of ICT infrastructure", logo: "https://i.pravatar.cc/150?img=3", image: "https://picsum.photos/seed/huawei/600/300", companyLink: "https://www.huawei.com", position: 1 },
    { company: samsung, name: "Samsung Electronics", text: "Global leader in technology and innovation", logo: "https://i.pravatar.cc/150?img=5", image: "https://picsum.photos/seed/samsung/600/300", companyLink: "https://www.samsung.com", position: 2 },
    { company: zara, name: "Zara Algeria", text: "International fashion retailer with latest trends", logo: "https://i.pravatar.cc/150?img=6", image: "https://picsum.photos/seed/zara/600/300", companyLink: "https://www.zara.com", position: 3 },
    { company: decathlon, name: "Decathlon Algeria", text: "Sports equipment and clothing for all", logo: "https://i.pravatar.cc/150?img=7", image: "https://picsum.photos/seed/decathlon/600/300", companyLink: "https://www.decathlon.dz", position: 4 },
  ];

  for (const tc of topCompanyDefs) {
    await prisma.topCompany.create({
      data: {
        companyId: tc.company.id,
        name: tc.name,
        text: tc.text,
        logo: tc.logo,
        image: tc.image,
        companyLink: tc.companyLink,
        position: tc.position,
      }
    });
  }
  console.log("Top companies seeded!");

  // 19. Update user statistics
  console.log("Updating user statistics...");
  for (const co of companies) {
    const prodCount = await prisma.product.count({ where: { companyId: co.id } });
    const followerCount = await prisma.companyFollow.count({ where: { companyId: co.id } });
    const clickCount = await prisma.companyClick.count({ where: { companyId: co.id } });
    await prisma.user.update({
      where: { id: co.id },
      data: {
        totalProducts: prodCount,
        totalFollowers: followerCount,
        totalClicks: clickCount
      }
    });
  }
  console.log("User statistics updated!");

  // Summary
  console.log("\nSeeding completed successfully!");
  console.log("========================================");
  console.log("SEEDING SUMMARY:");
  console.log("  Categories: " + categories.length);
  console.log("  Users: 8 (SuperAdmin, Admin, Moderator, 4 Companies, 1 User)");
  console.log("  Subscriptions: 4 Premium plans");
  console.log("  Features: " + features.length);
  console.log("  Products: " + productCount + " active + 5 deleted");
  console.log("  Top Companies: 4");
  console.log("  Ads: 2 active ads");
  console.log("  Analytics: product clicks, company clicks, user activity");
  console.log("  Ratings & Favorites: seeded for regular user");
  console.log("========================================\n");

  console.log("Test Credentials:");
  console.log("Super Admin: superadmin@promodz.com / admin123");
  console.log("Admin: admin@promodz.com / admin123");
  console.log("Moderator: moderator@promodz.com / moderator123");
  console.log("Company (Huawei): huawei@promodz.com / huawei123");
  console.log("Company (Samsung): samsung@promodz.com / samsung123");
  console.log("Company (Zara): zara@promodz.com / zara123");
  console.log("Company (Decathlon): decathlon@promodz.com / decathlon123");
  console.log("Regular User: user@promodz.com / user123");
  console.log("\nDatabase is ready for testing!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
