import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`branding\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`logo_id\` integer,
  	\`logo_on_dark_id\` integer,
  	\`favicon_id\` integer,
  	\`partner_logo_id\` integer,
  	\`partner_name\` text,
  	\`partner_url\` text,
  	\`login_image_id\` integer,
  	\`register_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`logo_on_dark_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`partner_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`login_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`register_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`branding_logo_idx\` ON \`branding\` (\`logo_id\`);`)
  await db.run(sql`CREATE INDEX \`branding_logo_on_dark_idx\` ON \`branding\` (\`logo_on_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`branding_favicon_idx\` ON \`branding\` (\`favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`branding_partner_logo_idx\` ON \`branding\` (\`partner_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`branding_login_image_idx\` ON \`branding\` (\`login_image_id\`);`)
  await db.run(sql`CREATE INDEX \`branding_register_image_idx\` ON \`branding\` (\`register_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_branding_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_logo_id\` integer,
  	\`version_logo_on_dark_id\` integer,
  	\`version_favicon_id\` integer,
  	\`version_partner_logo_id\` integer,
  	\`version_partner_name\` text,
  	\`version_partner_url\` text,
  	\`version_login_image_id\` integer,
  	\`version_register_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_logo_on_dark_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_favicon_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_partner_logo_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_login_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_register_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_logo_idx\` ON \`_branding_v\` (\`version_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_logo_on_dark_idx\` ON \`_branding_v\` (\`version_logo_on_dark_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_favicon_idx\` ON \`_branding_v\` (\`version_favicon_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_partner_logo_idx\` ON \`_branding_v\` (\`version_partner_logo_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_login_image_idx\` ON \`_branding_v\` (\`version_login_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_version_version_register_image_idx\` ON \`_branding_v\` (\`version_register_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_created_at_idx\` ON \`_branding_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_branding_v_updated_at_idx\` ON \`_branding_v\` (\`updated_at\`);`)
  await db.run(sql`ALTER TABLE \`variants\` ADD \`custom_price\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`_variants_v\` ADD \`version_custom_price\` integer DEFAULT false;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`spool_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`products\` ADD \`refill_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_spool_price_in_n_p_r\` numeric;`)
  await db.run(sql`ALTER TABLE \`_products_v\` ADD \`version_refill_price_in_n_p_r\` numeric;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`branding\`;`)
  await db.run(sql`DROP TABLE \`_branding_v\`;`)
  await db.run(sql`ALTER TABLE \`variants\` DROP COLUMN \`custom_price\`;`)
  await db.run(sql`ALTER TABLE \`_variants_v\` DROP COLUMN \`version_custom_price\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`spool_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`products\` DROP COLUMN \`refill_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_spool_price_in_n_p_r\`;`)
  await db.run(sql`ALTER TABLE \`_products_v\` DROP COLUMN \`version_refill_price_in_n_p_r\`;`)
}
