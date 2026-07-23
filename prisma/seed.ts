import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString =
  process.env.DIRECT_DATABASE_URL ?? process.env.DATABASE_URL;
const userId = process.env.SEED_CLERK_USER_ID;
const storeId =
  process.env.SEED_STORE_ID ?? "00000000-0000-4000-8000-000000000001";

if (!connectionString) {
  throw new Error("DATABASE_URL or DIRECT_DATABASE_URL is required to seed.");
}

if (!userId) {
  throw new Error("SEED_CLERK_USER_ID is required to seed an accessible store.");
}

const seedUserId = userId;

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

const ids = {
  billboard: "00000000-0000-4000-8000-000000000101",
  category: "00000000-0000-4000-8000-000000000201",
  sizeSmall: "00000000-0000-4000-8000-000000000301",
  sizeMedium: "00000000-0000-4000-8000-000000000302",
  colorBlack: "00000000-0000-4000-8000-000000000401",
  colorWhite: "00000000-0000-4000-8000-000000000402",
  productOne: "00000000-0000-4000-8000-000000000501",
  productTwo: "00000000-0000-4000-8000-000000000502",
  imageOne: "00000000-0000-4000-8000-000000000601",
  imageTwo: "00000000-0000-4000-8000-000000000602",
};

async function main() {
  await prisma.store.upsert({
    where: { id: storeId },
    update: { name: "Revived Store", userId: seedUserId },
    create: { id: storeId, name: "Revived Store", userId: seedUserId },
  });

  await prisma.billboard.upsert({
    where: { id: ids.billboard },
    update: {
      label: "The revived collection",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/w_1600,h_600,c_fill/sample.jpg",
    },
    create: {
      id: ids.billboard,
      storeId,
      label: "The revived collection",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/w_1600,h_600,c_fill/sample.jpg",
    },
  });

  await prisma.category.upsert({
    where: { id: ids.category },
    update: { name: "Featured", billboardId: ids.billboard },
    create: {
      id: ids.category,
      storeId,
      billboardId: ids.billboard,
      name: "Featured",
    },
  });

  const sizes = [
    { id: ids.sizeSmall, name: "Small", value: "S" },
    { id: ids.sizeMedium, name: "Medium", value: "M" },
  ];
  for (const size of sizes) {
    await prisma.size.upsert({
      where: { id: size.id },
      update: { name: size.name, value: size.value },
      create: { ...size, storeId },
    });
  }

  const colors = [
    { id: ids.colorBlack, name: "Black", value: "#111111" },
    { id: ids.colorWhite, name: "White", value: "#f5f5f5" },
  ];
  for (const color of colors) {
    await prisma.color.upsert({
      where: { id: color.id },
      update: { name: color.name, value: color.value },
      create: { ...color, storeId },
    });
  }

  const products = [
    {
      id: ids.productOne,
      name: "Revived Essential",
      price: "49.00",
      sizeId: ids.sizeSmall,
      colorId: ids.colorBlack,
      imageId: ids.imageOne,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/w_900,h_900,c_fill/shoes.png",
    },
    {
      id: ids.productTwo,
      name: "Fresh Start",
      price: "79.00",
      sizeId: ids.sizeMedium,
      colorId: ids.colorWhite,
      imageId: ids.imageTwo,
      imageUrl: "https://res.cloudinary.com/demo/image/upload/w_900,h_900,c_fill/backpack.jpg",
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        price: product.price,
        isFeatured: true,
        isArchived: false,
        categoryId: ids.category,
        sizeId: product.sizeId,
        colorId: product.colorId,
      },
      create: {
        id: product.id,
        storeId,
        categoryId: ids.category,
        name: product.name,
        price: product.price,
        isFeatured: true,
        sizeId: product.sizeId,
        colorId: product.colorId,
      },
    });

    await prisma.image.upsert({
      where: { id: product.imageId },
      update: { url: product.imageUrl },
      create: {
        id: product.imageId,
        productId: product.id,
        url: product.imageUrl,
      },
    });
  }

  console.log(`Seeded store ${storeId}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
