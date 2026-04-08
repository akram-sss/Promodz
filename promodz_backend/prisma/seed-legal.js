import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sections = [
  {
    title: "Terms of Service",
    description:
      "Welcome to Promodz. By accessing our platform, you agree to comply with our terms of service. Users are responsible for ensuring their actions comply with all applicable laws and regulations. Promodz reserves the right to modify these terms at any time. Continued use of the platform signifies acceptance of any changes.",
    position: 0,
  },
  {
    title: "User Rights and Responsibilities",
    description:
      "Users have the right to access and use the platform for lawful purposes. Any misuse, including but not limited to unauthorized access, distribution of harmful content, and infringement of intellectual property rights, is strictly prohibited. Users are responsible for maintaining the confidentiality of their account information.",
    position: 1,
  },
  {
    title: "Privacy Policy",
    description:
      "Promodz is committed to protecting user privacy. We collect, store, and use personal data in accordance with relevant laws and regulations. User data is used to enhance the platform's functionality and user experience. We do not share personal data with third parties without user consent, except as required by law.",
    position: 2,
  },
  {
    title: "Data Collection and Use",
    description:
      "We collect data to provide and improve our services. This includes information users provide during account registration, as well as data collected through user interactions with the platform. Collected data is used to personalize user experiences, troubleshoot issues, and conduct research and analysis.",
    position: 3,
  },
  {
    title: "Data Storage and Security",
    description:
      "User data is stored securely using industry-standard encryption and security practices. Access to personal data is restricted to authorized personnel only. We implement various measures to protect user data from unauthorized access, alteration, and disclosure.",
    position: 4,
  },
];

async function seed() {
  const existing = await prisma.legalSection.count();
  if (existing > 0) {
    console.log(`Already has ${existing} sections, skipping seed.`);
  } else {
    for (const s of sections) {
      await prisma.legalSection.create({ data: s });
    }
    console.log("Seeded 5 legal sections.");
  }

  const all = await prisma.legalSection.findMany({ orderBy: { position: "asc" } });
  console.log("Total sections:", all.length);
  all.forEach((s) => console.log("  -", s.title));

  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
