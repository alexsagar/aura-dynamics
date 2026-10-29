import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`about_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`heading_line1\` text,
    \`heading_line2\` text,
    \`intro\` text,
    \`hero_image_id\` integer,
    \`mission_eyebrow\` text,
    \`mission_heading\` text,
    \`mission_image_id\` integer,
    \`mission_closing\` text,
    \`studio_heading\` text,
    \`studio_subheading\` text,
    \`studio_image_large_id\` integer,
    \`studio_image_top_id\` integer,
    \`studio_image_bottom_id\` integer,
    \`local_heading\` text,
    \`local_body\` text,
    \`contact_heading\` text,
    \`contact_body\` text,
    \`contact_location_label\` text,
    \`contact_location\` text,
    \`contact_location_note\` text,
    \`contact_contact_label\` text,
    \`contact_email\` text,
    \`contact_phone\` text,
    \`contact_social_label\` text,
    \`seo_title\` text,
    \`seo_description\` text,
    \`updated_at\` text,
    \`created_at\` text,
    FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`mission_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`studio_image_large_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`studio_image_top_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`studio_image_bottom_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`about_page_hero_image_idx\` ON \`about_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_mission_mission_image_idx\` ON \`about_page\` (\`mission_image_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_studio_studio_image_large_idx\` ON \`about_page\` (\`studio_image_large_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_studio_studio_image_top_idx\` ON \`about_page\` (\`studio_image_top_id\`);`)
  await db.run(sql`CREATE INDEX \`about_page_studio_studio_image_bottom_idx\` ON \`about_page\` (\`studio_image_bottom_id\`);`)
  await db.run(sql`CREATE TABLE \`_about_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_heading_line1\` text,
    \`version_heading_line2\` text,
    \`version_intro\` text,
    \`version_hero_image_id\` integer,
    \`version_mission_eyebrow\` text,
    \`version_mission_heading\` text,
    \`version_mission_image_id\` integer,
    \`version_mission_closing\` text,
    \`version_studio_heading\` text,
    \`version_studio_subheading\` text,
    \`version_studio_image_large_id\` integer,
    \`version_studio_image_top_id\` integer,
    \`version_studio_image_bottom_id\` integer,
    \`version_local_heading\` text,
    \`version_local_body\` text,
    \`version_contact_heading\` text,
    \`version_contact_body\` text,
    \`version_contact_location_label\` text,
    \`version_contact_location\` text,
    \`version_contact_location_note\` text,
    \`version_contact_contact_label\` text,
    \`version_contact_email\` text,
    \`version_contact_phone\` text,
    \`version_contact_social_label\` text,
    \`version_seo_title\` text,
    \`version_seo_description\` text,
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_mission_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_studio_image_large_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_studio_image_top_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_studio_image_bottom_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_version_hero_image_idx\` ON \`_about_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_mission_version_mission_image_idx\` ON \`_about_page_v\` (\`version_mission_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_studio_version_studio_image_large_idx\` ON \`_about_page_v\` (\`version_studio_image_large_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_studio_version_studio_image_top_idx\` ON \`_about_page_v\` (\`version_studio_image_top_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_version_studio_version_studio_image_bottom_idx\` ON \`_about_page_v\` (\`version_studio_image_bottom_id\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_created_at_idx\` ON \`_about_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_about_page_v_updated_at_idx\` ON \`_about_page_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`materials_page\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`eyebrow\` text,
    \`heading\` text,
    \`intro\` text,
    \`primary_cta_label\` text,
    \`primary_cta_url\` text,
    \`secondary_cta_label\` text,
    \`secondary_cta_url\` text,
    \`hero_image_id\` integer,
    \`matrix_heading\` text,
    \`matrix_subheading\` text,
    \`quality_heading\` text,
    \`quality_body\` text,
    \`quality_image_id\` integer,
    \`cta_heading\` text,
    \`cta_body\` text,
    \`cta_button_label\` text,
    \`cta_button_url\` text,
    \`cta_card_title\` text,
    \`cta_card_url\` text,
    \`cta_image_id\` integer,
    \`seo_title\` text,
    \`seo_description\` text,
    \`updated_at\` text,
    \`created_at\` text,
    FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`quality_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`cta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`materials_page_hero_image_idx\` ON \`materials_page\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`materials_page_quality_quality_image_idx\` ON \`materials_page\` (\`quality_image_id\`);`)
  await db.run(sql`CREATE INDEX \`materials_page_cta_cta_image_idx\` ON \`materials_page\` (\`cta_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_materials_page_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_eyebrow\` text,
    \`version_heading\` text,
    \`version_intro\` text,
    \`version_primary_cta_label\` text,
    \`version_primary_cta_url\` text,
    \`version_secondary_cta_label\` text,
    \`version_secondary_cta_url\` text,
    \`version_hero_image_id\` integer,
    \`version_matrix_heading\` text,
    \`version_matrix_subheading\` text,
    \`version_quality_heading\` text,
    \`version_quality_body\` text,
    \`version_quality_image_id\` integer,
    \`version_cta_heading\` text,
    \`version_cta_body\` text,
    \`version_cta_button_label\` text,
    \`version_cta_button_url\` text,
    \`version_cta_card_title\` text,
    \`version_cta_card_url\` text,
    \`version_cta_image_id\` integer,
    \`version_seo_title\` text,
    \`version_seo_description\` text,
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_quality_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`version_cta_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_materials_page_v_version_version_hero_image_idx\` ON \`_materials_page_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_materials_page_v_version_quality_version_quality_image_idx\` ON \`_materials_page_v\` (\`version_quality_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_materials_page_v_version_cta_version_cta_image_idx\` ON \`_materials_page_v\` (\`version_cta_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_materials_page_v_created_at_idx\` ON \`_materials_page_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_materials_page_v_updated_at_idx\` ON \`_materials_page_v\` (\`updated_at\`);`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pc_about_mission_p\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_about_mission_p\`("_order", "_parent_id", "id", "text") SELECT "_order", "_parent_id", "id", "text" FROM \`pc_about_mission_p\`;`)
  await db.run(sql`DROP TABLE \`pc_about_mission_p\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_about_mission_p\` RENAME TO \`pc_about_mission_p\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_order_idx\` ON \`pc_about_mission_p\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_parent_id_idx\` ON \`pc_about_mission_p\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_about_social\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`about_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_about_social\`("_order", "_parent_id", "id", "label", "url") SELECT "_order", "_parent_id", "id", "label", "url" FROM \`pc_about_social\`;`)
  await db.run(sql`DROP TABLE \`pc_about_social\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_about_social\` RENAME TO \`pc_about_social\`;`)
  await db.run(sql`CREATE INDEX \`pc_about_social_order_idx\` ON \`pc_about_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_social_parent_id_idx\` ON \`pc_about_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_mat_matrix\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`material\` text,
    \`strength\` numeric,
    \`flex\` numeric,
    \`heat\` numeric,
    \`ease\` numeric,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`materials_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_mat_matrix\`("_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease") SELECT "_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease" FROM \`pc_mat_matrix\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_matrix\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_mat_matrix\` RENAME TO \`pc_mat_matrix\`;`)
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_order_idx\` ON \`pc_mat_matrix\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_parent_id_idx\` ON \`pc_mat_matrix\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_mat_dives\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`eyebrow\` text,
    \`heading\` text,
    \`body\` text,
    \`cta_label\` text,
    \`cta_url\` text,
    \`watermark\` text,
    \`image_id\` integer,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`materials_page\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_mat_dives\`("_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id") SELECT "_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id" FROM \`pc_mat_dives\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_dives\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_mat_dives\` RENAME TO \`pc_mat_dives\`;`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_order_idx\` ON \`pc_mat_dives\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_parent_id_idx\` ON \`pc_mat_dives\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_image_idx\` ON \`pc_mat_dives\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_about_mission_p_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_about_mission_p_v\`("_order", "_parent_id", "id", "text", "_uuid") SELECT "_order", "_parent_id", "id", "text", "_uuid" FROM \`_pc_about_mission_p_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_mission_p_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_about_mission_p_v\` RENAME TO \`_pc_about_mission_p_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_order_idx\` ON \`_pc_about_mission_p_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_parent_id_idx\` ON \`_pc_about_mission_p_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_about_social_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_about_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_about_social_v\`("_order", "_parent_id", "id", "label", "url", "_uuid") SELECT "_order", "_parent_id", "id", "label", "url", "_uuid" FROM \`_pc_about_social_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_social_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_about_social_v\` RENAME TO \`_pc_about_social_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_order_idx\` ON \`_pc_about_social_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_parent_id_idx\` ON \`_pc_about_social_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_mat_matrix_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`material\` text,
    \`strength\` numeric,
    \`flex\` numeric,
    \`heat\` numeric,
    \`ease\` numeric,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_materials_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_mat_matrix_v\`("_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease", "_uuid") SELECT "_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease", "_uuid" FROM \`_pc_mat_matrix_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_matrix_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_mat_matrix_v\` RENAME TO \`_pc_mat_matrix_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_order_idx\` ON \`_pc_mat_matrix_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_parent_id_idx\` ON \`_pc_mat_matrix_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_mat_dives_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`eyebrow\` text,
    \`heading\` text,
    \`body\` text,
    \`cta_label\` text,
    \`cta_url\` text,
    \`watermark\` text,
    \`image_id\` integer,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_materials_page_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_mat_dives_v\`("_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id", "_uuid") SELECT "_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id", "_uuid" FROM \`_pc_mat_dives_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_dives_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_mat_dives_v\` RENAME TO \`_pc_mat_dives_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_order_idx\` ON \`_pc_mat_dives_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_parent_id_idx\` ON \`_pc_mat_dives_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_image_idx\` ON \`_pc_mat_dives_v\` (\`image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`about_page\`;`)
  await db.run(sql`DROP TABLE \`_about_page_v\`;`)
  await db.run(sql`DROP TABLE \`materials_page\`;`)
  await db.run(sql`DROP TABLE \`_materials_page_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_pc_about_mission_p\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_about_mission_p\`("_order", "_parent_id", "id", "text") SELECT "_order", "_parent_id", "id", "text" FROM \`pc_about_mission_p\`;`)
  await db.run(sql`DROP TABLE \`pc_about_mission_p\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_about_mission_p\` RENAME TO \`pc_about_mission_p\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_order_idx\` ON \`pc_about_mission_p\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_parent_id_idx\` ON \`pc_about_mission_p\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_about_social\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_about_social\`("_order", "_parent_id", "id", "label", "url") SELECT "_order", "_parent_id", "id", "label", "url" FROM \`pc_about_social\`;`)
  await db.run(sql`DROP TABLE \`pc_about_social\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_about_social\` RENAME TO \`pc_about_social\`;`)
  await db.run(sql`CREATE INDEX \`pc_about_social_order_idx\` ON \`pc_about_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_social_parent_id_idx\` ON \`pc_about_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_about_mission_p_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_about_mission_p_v\`("_order", "_parent_id", "id", "text", "_uuid") SELECT "_order", "_parent_id", "id", "text", "_uuid" FROM \`_pc_about_mission_p_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_mission_p_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_about_mission_p_v\` RENAME TO \`_pc_about_mission_p_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_order_idx\` ON \`_pc_about_mission_p_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_parent_id_idx\` ON \`_pc_about_mission_p_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_about_social_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_about_social_v\`("_order", "_parent_id", "id", "label", "url", "_uuid") SELECT "_order", "_parent_id", "id", "label", "url", "_uuid" FROM \`_pc_about_social_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_social_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_about_social_v\` RENAME TO \`_pc_about_social_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_order_idx\` ON \`_pc_about_social_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_parent_id_idx\` ON \`_pc_about_social_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_mat_matrix\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`material\` text,
    \`strength\` numeric,
    \`flex\` numeric,
    \`heat\` numeric,
    \`ease\` numeric,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_mat_matrix\`("_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease") SELECT "_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease" FROM \`pc_mat_matrix\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_matrix\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_mat_matrix\` RENAME TO \`pc_mat_matrix\`;`)
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_order_idx\` ON \`pc_mat_matrix\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_parent_id_idx\` ON \`pc_mat_matrix\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new_pc_mat_dives\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`eyebrow\` text,
    \`heading\` text,
    \`body\` text,
    \`cta_label\` text,
    \`cta_url\` text,
    \`watermark\` text,
    \`image_id\` integer,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new_pc_mat_dives\`("_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id") SELECT "_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id" FROM \`pc_mat_dives\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_dives\`;`)
  await db.run(sql`ALTER TABLE \`__new_pc_mat_dives\` RENAME TO \`pc_mat_dives\`;`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_order_idx\` ON \`pc_mat_dives\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_parent_id_idx\` ON \`pc_mat_dives\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_image_idx\` ON \`pc_mat_dives\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_mat_matrix_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`material\` text,
    \`strength\` numeric,
    \`flex\` numeric,
    \`heat\` numeric,
    \`ease\` numeric,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_mat_matrix_v\`("_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease", "_uuid") SELECT "_order", "_parent_id", "id", "material", "strength", "flex", "heat", "ease", "_uuid" FROM \`_pc_mat_matrix_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_matrix_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_mat_matrix_v\` RENAME TO \`_pc_mat_matrix_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_order_idx\` ON \`_pc_mat_matrix_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_parent_id_idx\` ON \`_pc_mat_matrix_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`__new__pc_mat_dives_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`eyebrow\` text,
    \`heading\` text,
    \`body\` text,
    \`cta_label\` text,
    \`cta_url\` text,
    \`watermark\` text,
    \`image_id\` integer,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`INSERT INTO \`__new__pc_mat_dives_v\`("_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id", "_uuid") SELECT "_order", "_parent_id", "id", "eyebrow", "heading", "body", "cta_label", "cta_url", "watermark", "image_id", "_uuid" FROM \`_pc_mat_dives_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_dives_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__pc_mat_dives_v\` RENAME TO \`_pc_mat_dives_v\`;`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_order_idx\` ON \`_pc_mat_dives_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_parent_id_idx\` ON \`_pc_mat_dives_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_image_idx\` ON \`_pc_mat_dives_v\` (\`image_id\`);`)
}
