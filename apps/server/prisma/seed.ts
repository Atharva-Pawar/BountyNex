import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Platform Admin";

  if (email && password) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (!existing) {
      const hash = await bcrypt.hash(password, 12);
      await prisma.user.create({
        data: { email, name, passwordHash: hash, role: Role.ADMIN, isVerified: true },
      });
      console.log(`Seeded admin user: ${email}`);
    } else {
      console.log("Admin user already exists, skipping.");
    }
  } else {
    console.log("ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin seed.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
