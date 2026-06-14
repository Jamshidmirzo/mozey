import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const REGIONS = [
  { slug: 'toshkent-shahar', name: { uz: 'Toshkent', ru: 'Ташкент', en: 'Tashkent' }, orderIdx: 0 },
  { slug: 'toshkent-viloyati', name: { uz: 'Toshkent viloyati', ru: 'Ташкентская обл.', en: 'Tashkent region' }, orderIdx: 1 },
  { slug: 'samarqand', name: { uz: 'Samarqand', ru: 'Самарканд', en: 'Samarkand' }, orderIdx: 2 },
  { slug: 'buxoro', name: { uz: 'Buxoro', ru: 'Бухара', en: 'Bukhara' }, orderIdx: 3 },
  { slug: 'xorazm', name: { uz: 'Xorazm', ru: 'Хорезм', en: 'Khorezm' }, orderIdx: 4 },
  { slug: 'surxondaryo', name: { uz: 'Surxondaryo', ru: 'Сурхандарья', en: 'Surkhandarya' }, orderIdx: 5 },
  { slug: 'qashqadaryo', name: { uz: 'Qashqadaryo', ru: 'Кашкадарья', en: 'Kashkadarya' }, orderIdx: 6 },
  { slug: 'fargona', name: { uz: "Farg'ona", ru: 'Фергана', en: 'Fergana' }, orderIdx: 7 },
  { slug: 'andijon', name: { uz: 'Andijon', ru: 'Андижан', en: 'Andijan' }, orderIdx: 8 },
  { slug: 'namangan', name: { uz: 'Namangan', ru: 'Наманган', en: 'Namangan' }, orderIdx: 9 },
  { slug: 'navoiy', name: { uz: 'Navoiy', ru: 'Навои', en: 'Navoi' }, orderIdx: 10 },
  { slug: 'jizzax', name: { uz: 'Jizzax', ru: 'Джизак', en: 'Jizzakh' }, orderIdx: 11 },
  { slug: 'sirdaryo', name: { uz: 'Sirdaryo', ru: 'Сырдарья', en: 'Sirdarya' }, orderIdx: 12 },
  { slug: 'qoraqalpogiston', name: { uz: "Qoraqalpog'iston", ru: 'Каракалпакстан', en: 'Karakalpakstan' }, orderIdx: 13 },
];

async function main() {
  // Seed admin users
  const seedEmail = process.env.ADMIN_SEED_EMAIL || 'admin@mozey.uz';
  const seedPassword = process.env.ADMIN_SEED_PASSWORD || 'admin123456';

  const superadminHash = await bcrypt.hash(seedPassword, 12);
  const superadmin = await prisma.admin.upsert({
    where: { email: seedEmail },
    update: {},
    create: {
      email: seedEmail,
      passwordHash: superadminHash,
      role: 'superadmin',
    },
  });
  console.log(`Superadmin: ${superadmin.email}`);

  const editorHash = await bcrypt.hash('editor123456', 12);
  const editor = await prisma.admin.upsert({
    where: { email: 'editor@mozey.uz' },
    update: {},
    create: {
      email: 'editor@mozey.uz',
      passwordHash: editorHash,
      role: 'editor',
    },
  });
  console.log(`Editor: ${editor.email}`);

  // Seed regions
  for (const r of REGIONS) {
    const region = await prisma.region.upsert({
      where: { slug: r.slug },
      update: { name: r.name, orderIdx: r.orderIdx },
      create: { slug: r.slug, name: r.name, orderIdx: r.orderIdx },
    });
    console.log(`Region: ${r.slug} (${region.id})`);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
