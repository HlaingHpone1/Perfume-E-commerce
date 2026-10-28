import {
  PrismaClient,
  Concentration,
  AttachmentRecordType,
  GenderTarget,
  NoteType,
} from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "";

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed...");

  console.log("🧹 Cleaning existing data...");
  await prisma.attachment.deleteMany();
  await prisma.productNote.deleteMany();
  await prisma.inventoryBatch.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shippingAddress.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.note.deleteMany();
  await prisma.scent.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.auditLog.deleteMany();

  console.log("📦 Seeding Brands...");
  const chanel = await prisma.brand.create({
    data: { name: "Chanel", country: "France" },
  });
  const dior = await prisma.brand.create({
    data: { name: "Dior", country: "France" },
  });
  const tomFord = await prisma.brand.create({
    data: { name: "Tom Ford", country: "United States" },
  });
  const creed = await prisma.brand.create({
    data: { name: "Creed", country: "France" },
  });
  const versace = await prisma.brand.create({
    data: { name: "Versace", country: "Italy" },
  });

  console.log("📁 Seeding Categories...");
  const mensCategory = await prisma.category.create({
    data: { name: "Men's Fragrances", slug: "mens-fragrances" },
  });
  const womensCategory = await prisma.category.create({
    data: { name: "Women's Fragrances", slug: "womens-fragrances" },
  });
  const mensDesigner = await prisma.category.create({
    data: {
      name: "Designer",
      slug: "mens-designer",
      parentCategoryId: mensCategory.id,
    },
  });
  const mensLuxury = await prisma.category.create({
    data: {
      name: "Luxury",
      slug: "mens-luxury",
      parentCategoryId: mensCategory.id,
    },
  });
  const womensDesigner = await prisma.category.create({
    data: {
      name: "Designer",
      slug: "womens-designer",
      parentCategoryId: womensCategory.id,
    },
  });
  const womensLuxury = await prisma.category.create({
    data: {
      name: "Luxury",
      slug: "womens-luxury",
      parentCategoryId: womensCategory.id,
    },
  });

  console.log("🌬️ Seeding Scents...");
  const scentTitles = [
    "Aromatic Fougère",
    "Fresh Spicy",
    "Fruity Chypre",
    "Woody Oriental",
    "Oriental Floral",
    "Floral Fruity",
    "Floral Aldehyde",
    "Amber Floral",
  ] as const;
  const scents = Object.fromEntries(
    await Promise.all(
      scentTitles.map(async (title) => {
        const scent = await prisma.scent.create({ data: { title } });
        return [title, scent] as const;
      }),
    ),
  );

  console.log("🍋 Seeding Notes...");
  const noteTitles = [
    "Lemon",
    "Mint",
    "Bergamot",
    "Pepper",
    "Pineapple",
    "Apple",
    "Rosewood",
    "Cardamom",
    "Chinese Pepper",
    "Oud",
    "Sandalwood",
    "Vetiver",
    "Tonka Bean",
    "Vanilla",
    "Amber",
    "Orange",
    "Mandarin",
    "Pear",
    "Melon",
    "Aldehydes",
    "Ylang-Ylang",
    "Neroli",
    "Yuzu",
    "Pomegranate",
    "Black Cherry",
    "Almond",
    "Jasmine",
    "Patchouli",
    "Rose",
  ] as const;
  const notes = Object.fromEntries(
    await Promise.all(
      noteTitles.map(async (title) => {
        const note = await prisma.note.create({ data: { title } });
        return [title, note] as const;
      }),
    ),
  );

  async function linkNotes(
    productId: string,
    pyramid: { top?: string[]; middle?: string[]; base?: string[] },
  ) {
    const rows: {
      productId: string;
      noteId: string;
      type: NoteType;
      sortOrder: number;
    }[] = [];
    const push = (type: NoteType, titles: string[] = []) => {
      titles.forEach((title, i) => {
        const note = notes[title as keyof typeof notes];
        if (note) {
          rows.push({
            productId,
            noteId: note.id,
            type,
            sortOrder: i,
          });
        }
      });
    };
    push(NoteType.Top, pyramid.top);
    push(NoteType.Middle, pyramid.middle);
    push(NoteType.Base, pyramid.base);
    if (rows.length) {
      await prisma.productNote.createMany({ data: rows });
    }
  }

  console.log("🛍️ Seeding Products...");
  const bleuDeChanel = await prisma.product.create({
    data: {
      name: "Bleu de Chanel",
      description: "A fresh aromatic fragrance with citrus and woody notes.",
      categoryId: mensDesigner.id,
      brandId: chanel.id,
      scentId: scents["Aromatic Fougère"].id,
      genderTarget: GenderTarget.Men,
    },
  });
  await linkNotes(bleuDeChanel.id, {
    top: ["Lemon", "Mint"],
    middle: ["Jasmine"],
    base: ["Sandalwood", "Patchouli"],
  });

  const sauvage = await prisma.product.create({
    data: {
      name: "Sauvage",
      description: "A fresh and spicy fragrance with bergamot and ambroxan.",
      categoryId: mensDesigner.id,
      brandId: dior.id,
      scentId: scents["Fresh Spicy"].id,
      genderTarget: GenderTarget.Men,
    },
  });
  await linkNotes(sauvage.id, {
    top: ["Bergamot", "Pepper"],
    middle: ["Vetiver"],
    base: ["Amber"],
  });

  const aventus = await prisma.product.create({
    data: {
      name: "Aventus",
      description: "A fruity chypre fragrance with pineapple and birch.",
      categoryId: mensLuxury.id,
      brandId: creed.id,
      scentId: scents["Fruity Chypre"].id,
      genderTarget: GenderTarget.Men,
    },
  });
  await linkNotes(aventus.id, {
    top: ["Pineapple", "Apple"],
    middle: ["Rose"],
    base: ["Vanilla", "Patchouli"],
  });

  const oudWood = await prisma.product.create({
    data: {
      name: "Oud Wood",
      description: "A luxurious woody fragrance with oud and sandalwood.",
      categoryId: mensLuxury.id,
      brandId: tomFord.id,
      scentId: scents["Woody Oriental"].id,
      genderTarget: GenderTarget.Men,
    },
  });
  await linkNotes(oudWood.id, {
    top: ["Rosewood", "Cardamom", "Chinese Pepper"],
    middle: ["Oud", "Sandalwood", "Vetiver"],
    base: ["Tonka Bean", "Vanilla", "Amber"],
  });

  const cocoMademoiselle = await prisma.product.create({
    data: {
      name: "Coco Mademoiselle",
      description:
        "A modern oriental fragrance with orange, jasmine, and patchouli. Bold and feminine.",
      categoryId: womensDesigner.id,
      brandId: chanel.id,
      scentId: scents["Oriental Floral"].id,
      genderTarget: GenderTarget.Women,
    },
  });
  await linkNotes(cocoMademoiselle.id, {
    top: ["Orange", "Mandarin"],
    middle: ["Jasmine", "Rose"],
    base: ["Patchouli", "Vanilla"],
  });

  const jadore = await prisma.product.create({
    data: {
      name: "J'adore",
      description:
        "An iconic floral bouquet. Finely crafted down to the last detail, like a custom-made flower.",
      categoryId: womensLuxury.id,
      brandId: dior.id,
      scentId: scents["Floral Fruity"].id,
      genderTarget: GenderTarget.Women,
    },
  });
  await linkNotes(jadore.id, {
    top: ["Pear", "Melon"],
    middle: ["Jasmine", "Ylang-Ylang"],
    base: ["Vanilla"],
  });

  const chanelNo5 = await prisma.product.create({
    data: {
      name: "Chanel No. 5",
      description:
        "The now and forever fragrance. The ultimate floral aldehyde fragrance.",
      categoryId: womensLuxury.id,
      brandId: chanel.id,
      scentId: scents["Floral Aldehyde"].id,
      genderTarget: GenderTarget.Women,
    },
  });
  await linkNotes(chanelNo5.id, {
    top: ["Aldehydes", "Ylang-Ylang", "Neroli"],
    middle: ["Jasmine", "Rose"],
    base: ["Vanilla", "Sandalwood"],
  });

  const brightCrystal = await prisma.product.create({
    data: {
      name: "Bright Crystal",
      description:
        "Sheer sensuality, crystal transparency, and luminous brightness.",
      categoryId: womensDesigner.id,
      brandId: versace.id,
      scentId: scents["Floral Fruity"].id,
      genderTarget: GenderTarget.Women,
    },
  });
  await linkNotes(brightCrystal.id, {
    top: ["Yuzu", "Pomegranate"],
    middle: ["Rose", "Jasmine"],
    base: ["Amber", "Vanilla"],
  });

  const lostCherry = await prisma.product.create({
    data: {
      name: "Lost Cherry",
      description:
        "A full-bodied journey into the once-forbidden; a contrasting scent that reveals a tempting dichotomy of playful, candy-like gleam on the outside and luscious flesh on the inside.",
      categoryId: womensLuxury.id,
      brandId: tomFord.id,
      scentId: scents["Amber Floral"].id,
      genderTarget: GenderTarget.Women,
    },
  });
  await linkNotes(lostCherry.id, {
    top: ["Black Cherry", "Almond"],
    middle: ["Rose", "Jasmine"],
    base: ["Vanilla", "Tonka Bean"],
  });

  console.log("📦 Seeding Product Variants...");
  const bdcEdt50 = await prisma.productVariant.create({
    data: {
      sku: "CHAN-BDC-EDT-50",
      name: "Bleu de Chanel EDT 50ml",
      concentration: Concentration.EDT,
      volumeMl: 50,
      stockLevel: 100,
      productId: bleuDeChanel.id,
      price: 90.0,
      specifications: { intensity: "Moderate" },
    },
  });
  const bdcEdp100 = await prisma.productVariant.create({
    data: {
      sku: "CHAN-BDC-EDP-100",
      name: "Bleu de Chanel EDP 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      stockLevel: 75,
      productId: bleuDeChanel.id,
      price: 120.0,
      specifications: { intensity: "Strong" },
    },
  });
  const sauvageEdt100 = await prisma.productVariant.create({
    data: {
      sku: "DIOR-SAU-EDT-100",
      name: "Sauvage EDT 100ml",
      concentration: Concentration.EDT,
      volumeMl: 100,
      stockLevel: 120,
      productId: sauvage.id,
      price: 95.0,
      specifications: { intensity: "Strong" },
    },
  });
  const aventusEdp50 = await prisma.productVariant.create({
    data: {
      sku: "CREED-AVE-EDP-50",
      name: "Aventus EDP 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      stockLevel: 50,
      productId: aventus.id,
      price: 285.0,
      specifications: { intensity: "Strong" },
    },
  });
  const oudWoodEdp50 = await prisma.productVariant.create({
    data: {
      sku: "TF-OW-EDP-50",
      name: "Oud Wood Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      stockLevel: 40,
      productId: oudWood.id,
      price: 295.0,
      specifications: {
        intensity: "Moderate to Strong",
        longevity: "8-10 hours",
      },
    },
  });
  const oudWoodEdp100 = await prisma.productVariant.create({
    data: {
      sku: "TF-OW-EDP-100",
      name: "Oud Wood Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      stockLevel: 25,
      productId: oudWood.id,
      price: 445.0,
      specifications: {
        intensity: "Moderate to Strong",
        longevity: "8-10 hours",
      },
    },
  });
  const cocoMademoiselleEdp50 = await prisma.productVariant.create({
    data: {
      sku: "CHAN-CM-EDP-50",
      name: "Coco Mademoiselle EDP 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      stockLevel: 70,
      productId: cocoMademoiselle.id,
      price: 115.0,
      specifications: { intensity: "Strong" },
    },
  });
  const jadoreEdp50 = await prisma.productVariant.create({
    data: {
      sku: "DIOR-JAD-EDP-50",
      name: "J'adore Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      stockLevel: 80,
      productId: jadore.id,
      price: 110.0,
      specifications: { intensity: "Moderate" },
    },
  });
  const jadoreEdp100 = await prisma.productVariant.create({
    data: {
      sku: "DIOR-JAD-EDP-100",
      name: "J'adore Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      stockLevel: 60,
      productId: jadore.id,
      price: 155.0,
      specifications: { intensity: "Moderate" },
    },
  });
  const chanelNo5Parfum30 = await prisma.productVariant.create({
    data: {
      sku: "CHAN-N5-PARFUM-30",
      name: "Chanel No. 5 Parfum 30ml",
      concentration: Concentration.Parfum,
      volumeMl: 30,
      stockLevel: 20,
      productId: chanelNo5.id,
      price: 340.0,
      specifications: { intensity: "Very Strong" },
    },
  });
  const chanelNo5Edp100 = await prisma.productVariant.create({
    data: {
      sku: "CHAN-N5-EDP-100",
      name: "Chanel No. 5 Eau de Parfum 100ml",
      concentration: Concentration.EDP,
      volumeMl: 100,
      stockLevel: 45,
      productId: chanelNo5.id,
      price: 165.0,
      specifications: { intensity: "Strong" },
    },
  });
  const brightCrystalEdt90 = await prisma.productVariant.create({
    data: {
      sku: "VERS-BC-EDT-90",
      name: "Bright Crystal Eau de Toilette 90ml",
      concentration: Concentration.EDT,
      volumeMl: 90,
      stockLevel: 110,
      productId: brightCrystal.id,
      price: 95.0,
      specifications: { intensity: "Moderate" },
    },
  });
  const lostCherryEdp50 = await prisma.productVariant.create({
    data: {
      sku: "TF-LC-EDP-50",
      name: "Lost Cherry Eau de Parfum 50ml",
      concentration: Concentration.EDP,
      volumeMl: 50,
      stockLevel: 30,
      productId: lostCherry.id,
      price: 395.0,
      specifications: { intensity: "Strong" },
    },
  });

  console.log("📎 Seeding Attachments...");
  await prisma.attachment.createMany({
    data: [
      {
        fileUrl: "/images/products/bleu-de-chanel.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 1500,
        purpose: "Main Campaign Image",
        recordType: AttachmentRecordType.Product,
        recordId: bleuDeChanel.id,
      },
      {
        fileUrl: "/images/products/sauvage.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 2100,
        purpose: "Hero Banner",
        recordType: AttachmentRecordType.Product,
        recordId: sauvage.id,
      },
      {
        fileUrl: "/images/products/aventus.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 1800,
        purpose: "Lifestyle Shot",
        recordType: AttachmentRecordType.Product,
        recordId: aventus.id,
      },
      {
        fileUrl: "/images/products/oud-wood.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 1800,
        purpose: "Lifestyle Shot",
        recordType: AttachmentRecordType.Product,
        recordId: oudWood.id,
      },
    ],
  });

  await prisma.attachment.createMany({
    data: [
      {
        fileUrl: "/images/variants/chanel-bdc-50ml-front.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 500,
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: bdcEdt50.id,
      },
      {
        fileUrl: "/images/variants/chanel-bdc-100ml-front.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 550,
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: bdcEdp100.id,
      },
      {
        fileUrl: "/images/variants/dior-sauvage-100ml-angle.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 600,
        purpose: "Angled Shot",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: sauvageEdt100.id,
      },
      {
        fileUrl: "/images/variants/creed-aventus-50ml-zoom.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 800,
        purpose: "Atomizer Zoom",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: aventusEdp50.id,
      },
      {
        fileUrl: "/images/variants/tf-oud-wood-50ml-front.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 520,
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: oudWoodEdp50.id,
      },
      {
        fileUrl: "/images/variants/tf-oud-wood-100ml-angle.jpg",
        fileType: "image/jpeg",
        fileSizeKb: 610,
        purpose: "Angled Shot",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: oudWoodEdp100.id,
      },
      {
        fileUrl: "/images/variants/chanel-coco-50ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: cocoMademoiselleEdp50.id,
      },
      {
        fileUrl: "/images/variants/dior-jadore-50ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: jadoreEdp50.id,
      },
      {
        fileUrl: "/images/variants/dior-jadore-100ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: jadoreEdp100.id,
      },
      {
        fileUrl: "/images/variants/chanel-no5-parfum-30ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: chanelNo5Parfum30.id,
      },
      {
        fileUrl: "/images/variants/chanel-no5-edp-100ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: chanelNo5Edp100.id,
      },
      {
        fileUrl: "/images/variants/versace-bright-crystal-90ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: brightCrystalEdt90.id,
      },
      {
        fileUrl: "/images/variants/tf-lost-cherry-50ml.jpg",
        fileType: "image/jpeg",
        purpose: "Front View",
        recordType: AttachmentRecordType.ProductVariant,
        recordId: lostCherryEdp50.id,
      },
    ],
  });

  console.log("✅ Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
