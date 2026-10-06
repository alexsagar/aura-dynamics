import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add idempotency_key to orders table with unique index
  await db.run(sql`ALTER TABLE \`orders\` ADD \`idempotency_key\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`orders_idempotency_key_idx\` ON \`orders\` (\`idempotency_key\`);`)

  // Add shippingSettings fields to site_settings table
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`shipping_settings_shipping_fee\` numeric DEFAULT 150;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`shipping_settings_free_shipping_threshold\` numeric DEFAULT 5000;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`shipping_settings_free_shipping_enabled\` integer DEFAULT 1;`)

  // Add shippingSettings fields to _site_settings_v table
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_shipping_settings_shipping_fee\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_shipping_settings_free_shipping_threshold\` numeric;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_shipping_settings_free_shipping_enabled\` integer;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`orders_idempotency_key_idx\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`idempotency_key\`;`)

  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`shipping_settings_shipping_fee\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`shipping_settings_free_shipping_threshold\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`shipping_settings_free_shipping_enabled\`;`)

  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_shipping_settings_shipping_fee\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_shipping_settings_free_shipping_threshold\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_shipping_settings_free_shipping_enabled\`;`)
}
