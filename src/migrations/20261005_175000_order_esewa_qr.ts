import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // Add order fields
  await db.run(sql`ALTER TABLE \`orders\` ADD \`order_number\` text;`)
  await db.run(sql`CREATE UNIQUE INDEX \`orders_order_number_idx\` ON \`orders\` (\`order_number\`);`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`payment_method\` text DEFAULT 'esewa_qr';`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`payment_status\` text DEFAULT 'awaiting_verification';`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`payment_reference\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`subtotal\` numeric;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`shipping\` numeric;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`order_notes\` text;`)
  await db.run(sql`ALTER TABLE \`orders\` ADD \`items_snapshot\` text;`)

  // Add site_settings payment fields
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`payment_settings_esewa_qr_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`site_settings_payment_settings_esewa_qr_image_idx\` ON \`site_settings\` (\`payment_settings_esewa_qr_image_id\`);`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`payment_settings_esewa_merchant_name\` text;`)
  await db.run(sql`ALTER TABLE \`site_settings\` ADD \`payment_settings_esewa_id\` text;`)

  // Add _site_settings_v payment fields
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_payment_settings_esewa_qr_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_payment_settings_esewa_qr_image_idx\` ON \`_site_settings_v\` (\`version_payment_settings_esewa_qr_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_payment_settings_esewa_merchant_name\` text;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` ADD \`version_payment_settings_esewa_id\` text;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP INDEX IF EXISTS \`orders_order_number_idx\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`order_number\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`payment_method\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`payment_status\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`payment_reference\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`subtotal\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`shipping\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`order_notes\`;`)
  await db.run(sql`ALTER TABLE \`orders\` DROP COLUMN \`items_snapshot\`;`)

  await db.run(sql`DROP INDEX IF EXISTS \`site_settings_payment_settings_esewa_qr_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`payment_settings_esewa_qr_image_id\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`payment_settings_esewa_merchant_name\`;`)
  await db.run(sql`ALTER TABLE \`site_settings\` DROP COLUMN \`payment_settings_esewa_id\`;`)

  await db.run(sql`DROP INDEX IF EXISTS \`_site_settings_v_version_payment_settings_esewa_qr_image_idx\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_payment_settings_esewa_qr_image_id\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_payment_settings_esewa_merchant_name\`;`)
  await db.run(sql`ALTER TABLE \`_site_settings_v\` DROP COLUMN \`version_payment_settings_esewa_id\`;`)
}
