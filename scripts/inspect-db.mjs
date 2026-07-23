import "dotenv/config";
import { Client } from "pg";

const tables = [
  "Store",
  "Billboard",
  "Category",
  "Size",
  "Color",
  "Product",
  "Image",
  "Order",
  "OrderItem",
];

const integrityChecks = {
  billboardWithoutStore:
    'SELECT COUNT(*)::int AS count FROM "Billboard" child LEFT JOIN "Store" parent ON parent.id = child."storeId" WHERE parent.id IS NULL',
  categoryWithoutStore:
    'SELECT COUNT(*)::int AS count FROM "Category" child LEFT JOIN "Store" parent ON parent.id = child."storeId" WHERE parent.id IS NULL',
  categoryWithoutBillboard:
    'SELECT COUNT(*)::int AS count FROM "Category" child LEFT JOIN "Billboard" parent ON parent.id = child."billboardId" WHERE parent.id IS NULL',
  productWithoutStore:
    'SELECT COUNT(*)::int AS count FROM "Product" child LEFT JOIN "Store" parent ON parent.id = child."storeId" WHERE parent.id IS NULL',
  productWithoutCategory:
    'SELECT COUNT(*)::int AS count FROM "Product" child LEFT JOIN "Category" parent ON parent.id = child."categoryId" WHERE parent.id IS NULL',
  productWithoutSize:
    'SELECT COUNT(*)::int AS count FROM "Product" child LEFT JOIN "Size" parent ON parent.id = child."sizeId" WHERE parent.id IS NULL',
  productWithoutColor:
    'SELECT COUNT(*)::int AS count FROM "Product" child LEFT JOIN "Color" parent ON parent.id = child."colorId" WHERE parent.id IS NULL',
  imageWithoutProduct:
    'SELECT COUNT(*)::int AS count FROM "Image" child LEFT JOIN "Product" parent ON parent.id = child."productId" WHERE parent.id IS NULL',
  orderWithoutStore:
    'SELECT COUNT(*)::int AS count FROM "Order" child LEFT JOIN "Store" parent ON parent.id = child."storeId" WHERE parent.id IS NULL',
  orderItemWithoutOrder:
    'SELECT COUNT(*)::int AS count FROM "OrderItem" child LEFT JOIN "Order" parent ON parent.id = child."orderId" WHERE parent.id IS NULL',
  orderItemWithoutProduct:
    'SELECT COUNT(*)::int AS count FROM "OrderItem" child LEFT JOIN "Product" parent ON parent.id = child."productId" WHERE parent.id IS NULL',
};

function normalizeConnectionString(value) {
  if (!value) {
    throw new Error("DATABASE_URL is missing.");
  }

  return value
    .replace(/^DATABASE_URL\s*=\s*["']?/, "")
    .replace(/["']$/, "");
}

async function main() {
  const client = new Client({
    connectionString: normalizeConnectionString(process.env.DATABASE_URL),
  });
  await client.connect();

  const counts = {};
  for (const table of tables) {
    const result = await client.query(
      `SELECT COUNT(*)::int AS count FROM "${table}"`,
    );
    counts[table] = result.rows[0].count;
  }

  const orphans = {};
  for (const [name, query] of Object.entries(integrityChecks)) {
    const result = await client.query(query);
    orphans[name] = result.rows[0].count;
  }

  const storesResult = await client.query(
    'SELECT id, name, "userId" FROM "Store" ORDER BY "createdAt"',
  );
  const stores = storesResult.rows.map((store) => ({
    id: store.id,
    name: store.name,
    userMatchesConfiguredSeed:
      Boolean(process.env.SEED_CLERK_USER_ID) &&
      store.userId === process.env.SEED_CLERK_USER_ID,
  }));

  const migrationResult = await client.query(
    "SELECT to_regclass($1) AS name",
    ['public."_prisma_migrations"'],
  );

  let clerk = { configured: false, connected: false, allStoreOwnersFound: false };
  if (process.env.CLERK_SECRET_KEY) {
    const response = await fetch("https://api.clerk.com/v1/users?limit=100", {
      headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` },
    });
    const users = response.ok ? await response.json() : [];
    const userIds = new Set(users.map((user) => user.id));
    clerk = {
      configured: true,
      connected: response.ok,
      allStoreOwnersFound:
        response.ok && storesResult.rows.every((store) => userIds.has(store.userId)),
    };
  }

  await client.end();

  console.log(
    JSON.stringify(
      {
        counts,
        orphans,
        stores,
        clerk,
        migrationTable: Boolean(migrationResult.rows[0].name),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
