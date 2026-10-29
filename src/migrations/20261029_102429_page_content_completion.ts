import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`pc_coll_cards\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`title\` text,
    \`subtitle\` text,
    \`url\` text,
    \`image_id\` integer,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pc_coll_cards_order_idx\` ON \`pc_coll_cards\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_coll_cards_parent_id_idx\` ON \`pc_coll_cards\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pc_coll_cards_image_idx\` ON \`pc_coll_cards\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`pc_about_mission_p\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_order_idx\` ON \`pc_about_mission_p\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_mission_p_parent_id_idx\` ON \`pc_about_mission_p\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pc_about_social\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`page_content\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pc_about_social_order_idx\` ON \`pc_about_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_about_social_parent_id_idx\` ON \`pc_about_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pc_mat_matrix\` (
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
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_order_idx\` ON \`pc_mat_matrix\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_matrix_parent_id_idx\` ON \`pc_mat_matrix\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pc_mat_dive_pts\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` text NOT NULL,
    \`id\` text PRIMARY KEY NOT NULL,
    \`text\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`pc_mat_dives\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`pc_mat_dive_pts_order_idx\` ON \`pc_mat_dive_pts\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dive_pts_parent_id_idx\` ON \`pc_mat_dive_pts\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`pc_mat_dives\` (
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
  await db.run(sql`CREATE INDEX \`pc_mat_dives_order_idx\` ON \`pc_mat_dives\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_parent_id_idx\` ON \`pc_mat_dives\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`pc_mat_dives_image_idx\` ON \`pc_mat_dives\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_coll_cards_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`title\` text,
    \`subtitle\` text,
    \`url\` text,
    \`image_id\` integer,
    \`_uuid\` text,
    FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pc_coll_cards_v_order_idx\` ON \`_pc_coll_cards_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_coll_cards_v_parent_id_idx\` ON \`_pc_coll_cards_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pc_coll_cards_v_image_idx\` ON \`_pc_coll_cards_v\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_about_mission_p_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_order_idx\` ON \`_pc_about_mission_p_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_mission_p_v_parent_id_idx\` ON \`_pc_about_mission_p_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_about_social_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`label\` text,
    \`url\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_page_content_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_order_idx\` ON \`_pc_about_social_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_about_social_v_parent_id_idx\` ON \`_pc_about_social_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_mat_matrix_v\` (
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
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_order_idx\` ON \`_pc_mat_matrix_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_matrix_v_parent_id_idx\` ON \`_pc_mat_matrix_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_mat_dive_pts_v\` (
    \`_order\` integer NOT NULL,
    \`_parent_id\` integer NOT NULL,
    \`id\` integer PRIMARY KEY NOT NULL,
    \`text\` text,
    \`_uuid\` text,
    FOREIGN KEY (\`_parent_id\`) REFERENCES \`_pc_mat_dives_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_pc_mat_dive_pts_v_order_idx\` ON \`_pc_mat_dive_pts_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dive_pts_v_parent_id_idx\` ON \`_pc_mat_dive_pts_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_pc_mat_dives_v\` (
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
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_order_idx\` ON \`_pc_mat_dives_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_parent_id_idx\` ON \`_pc_mat_dives_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_pc_mat_dives_v_image_idx\` ON \`_pc_mat_dives_v\` (\`image_id\`);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`collections_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`collections_categories_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_heading_line1\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_heading_line2\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_mission_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_mission_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_mission_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_mission_closing\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_studio_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_studio_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_studio_image_large_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_studio_image_top_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_studio_image_bottom_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_local_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_local_body\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_body\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_location_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_location\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_location_note\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_contact_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_email\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`about_contact_social_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_primary_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_primary_cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_secondary_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_secondary_cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_matrix_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_matrix_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_quality_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_quality_body\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_quality_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_body\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_button_url\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_card_url\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`materials_cta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`privacy_body\` text;`)
  await db.run(sql`ALTER TABLE \`page_content\` ADD \`terms_body\` text;`)
  await db.run(sql`CREATE INDEX \`page_content_about_about_hero_image_idx\` ON \`page_content\` (\`about_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_mission_about_mission_image_idx\` ON \`page_content\` (\`about_mission_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_studio_about_studio_image_large_idx\` ON \`page_content\` (\`about_studio_image_large_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_studio_about_studio_image_top_idx\` ON \`page_content\` (\`about_studio_image_top_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_about_studio_about_studio_image_bottom_idx\` ON \`page_content\` (\`about_studio_image_bottom_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_materials_materials_hero_image_idx\` ON \`page_content\` (\`materials_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_materials_quality_materials_quality_image_idx\` ON \`page_content\` (\`materials_quality_image_id\`);`)
  await db.run(sql`CREATE INDEX \`page_content_materials_cta_materials_cta_image_idx\` ON \`page_content\` (\`materials_cta_image_id\`);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_collections_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_collections_categories_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_heading_line1\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_heading_line2\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_mission_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_mission_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_mission_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_mission_closing\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_studio_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_studio_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_studio_image_large_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_studio_image_top_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_studio_image_bottom_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_local_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_local_body\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_body\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_location_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_location\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_location_note\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_contact_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_email\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_phone\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_about_contact_social_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_eyebrow\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_primary_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_primary_cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_secondary_cta_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_secondary_cta_url\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_hero_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_matrix_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_matrix_subheading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_quality_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_quality_body\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_quality_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_heading\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_body\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_button_label\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_button_url\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_card_title\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_card_url\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_materials_cta_image_id\` integer REFERENCES media(id);`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_privacy_body\` text;`)
  await db.run(sql`ALTER TABLE \`_page_content_v\` ADD \`version_terms_body\` text;`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_about_version_about_hero_image_idx\` ON \`_page_content_v\` (\`version_about_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_about_mission_version_about_miss_idx\` ON \`_page_content_v\` (\`version_about_mission_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_about_studio_version_about_studi_idx\` ON \`_page_content_v\` (\`version_about_studio_image_large_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_about_studio_version_about_stu_1_idx\` ON \`_page_content_v\` (\`version_about_studio_image_top_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_about_studio_version_about_stu_2_idx\` ON \`_page_content_v\` (\`version_about_studio_image_bottom_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_materials_version_materials_hero_idx\` ON \`_page_content_v\` (\`version_materials_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_materials_quality_version_materi_idx\` ON \`_page_content_v\` (\`version_materials_quality_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_version_materials_cta_version_materials__idx\` ON \`_page_content_v\` (\`version_materials_cta_image_id\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`pc_coll_cards\`;`)
  await db.run(sql`DROP TABLE \`pc_about_mission_p\`;`)
  await db.run(sql`DROP TABLE \`pc_about_social\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_matrix\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_dive_pts\`;`)
  await db.run(sql`DROP TABLE \`pc_mat_dives\`;`)
  await db.run(sql`DROP TABLE \`_pc_coll_cards_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_mission_p_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_about_social_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_matrix_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_dive_pts_v\`;`)
  await db.run(sql`DROP TABLE \`_pc_mat_dives_v\`;`)
  await db.run(sql`PRAGMA foreign_keys=OFF;`)
  await db.run(sql`CREATE TABLE \`__new_page_content\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`filaments_heading\` text,
    \`filaments_intro\` text,
    \`filaments_seo_title\` text,
    \`filaments_seo_description\` text,
    \`prints_heading\` text,
    \`prints_intro\` text,
    \`prints_seo_title\` text,
    \`prints_seo_description\` text,
    \`collections_heading\` text,
    \`collections_intro\` text,
    \`collections_seo_title\` text,
    \`collections_seo_description\` text,
    \`about_intro\` text,
    \`about_seo_title\` text,
    \`about_seo_description\` text,
    \`materials_heading\` text,
    \`materials_intro\` text,
    \`materials_seo_title\` text,
    \`materials_seo_description\` text,
    \`privacy_heading\` text,
    \`privacy_intro\` text,
    \`privacy_seo_title\` text,
    \`privacy_seo_description\` text,
    \`terms_heading\` text,
    \`terms_intro\` text,
    \`terms_seo_title\` text,
    \`terms_seo_description\` text,
    \`updated_at\` text,
    \`created_at\` text
  );
  `)
  await db.run(sql`INSERT INTO \`__new_page_content\`("id", "filaments_heading", "filaments_intro", "filaments_seo_title", "filaments_seo_description", "prints_heading", "prints_intro", "prints_seo_title", "prints_seo_description", "collections_heading", "collections_intro", "collections_seo_title", "collections_seo_description", "about_intro", "about_seo_title", "about_seo_description", "materials_heading", "materials_intro", "materials_seo_title", "materials_seo_description", "privacy_heading", "privacy_intro", "privacy_seo_title", "privacy_seo_description", "terms_heading", "terms_intro", "terms_seo_title", "terms_seo_description", "updated_at", "created_at") SELECT "id", "filaments_heading", "filaments_intro", "filaments_seo_title", "filaments_seo_description", "prints_heading", "prints_intro", "prints_seo_title", "prints_seo_description", "collections_heading", "collections_intro", "collections_seo_title", "collections_seo_description", "about_intro", "about_seo_title", "about_seo_description", "materials_heading", "materials_intro", "materials_seo_title", "materials_seo_description", "privacy_heading", "privacy_intro", "privacy_seo_title", "privacy_seo_description", "terms_heading", "terms_intro", "terms_seo_title", "terms_seo_description", "updated_at", "created_at" FROM \`page_content\`;`)
  await db.run(sql`DROP TABLE \`page_content\`;`)
  await db.run(sql`ALTER TABLE \`__new_page_content\` RENAME TO \`page_content\`;`)
  await db.run(sql`PRAGMA foreign_keys=ON;`)
  await db.run(sql`CREATE TABLE \`__new__page_content_v\` (
    \`id\` integer PRIMARY KEY NOT NULL,
    \`version_filaments_heading\` text,
    \`version_filaments_intro\` text,
    \`version_filaments_seo_title\` text,
    \`version_filaments_seo_description\` text,
    \`version_prints_heading\` text,
    \`version_prints_intro\` text,
    \`version_prints_seo_title\` text,
    \`version_prints_seo_description\` text,
    \`version_collections_heading\` text,
    \`version_collections_intro\` text,
    \`version_collections_seo_title\` text,
    \`version_collections_seo_description\` text,
    \`version_about_intro\` text,
    \`version_about_seo_title\` text,
    \`version_about_seo_description\` text,
    \`version_materials_heading\` text,
    \`version_materials_intro\` text,
    \`version_materials_seo_title\` text,
    \`version_materials_seo_description\` text,
    \`version_privacy_heading\` text,
    \`version_privacy_intro\` text,
    \`version_privacy_seo_title\` text,
    \`version_privacy_seo_description\` text,
    \`version_terms_heading\` text,
    \`version_terms_intro\` text,
    \`version_terms_seo_title\` text,
    \`version_terms_seo_description\` text,
    \`version_updated_at\` text,
    \`version_created_at\` text,
    \`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
    \`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`INSERT INTO \`__new__page_content_v\`("id", "version_filaments_heading", "version_filaments_intro", "version_filaments_seo_title", "version_filaments_seo_description", "version_prints_heading", "version_prints_intro", "version_prints_seo_title", "version_prints_seo_description", "version_collections_heading", "version_collections_intro", "version_collections_seo_title", "version_collections_seo_description", "version_about_intro", "version_about_seo_title", "version_about_seo_description", "version_materials_heading", "version_materials_intro", "version_materials_seo_title", "version_materials_seo_description", "version_privacy_heading", "version_privacy_intro", "version_privacy_seo_title", "version_privacy_seo_description", "version_terms_heading", "version_terms_intro", "version_terms_seo_title", "version_terms_seo_description", "version_updated_at", "version_created_at", "created_at", "updated_at") SELECT "id", "version_filaments_heading", "version_filaments_intro", "version_filaments_seo_title", "version_filaments_seo_description", "version_prints_heading", "version_prints_intro", "version_prints_seo_title", "version_prints_seo_description", "version_collections_heading", "version_collections_intro", "version_collections_seo_title", "version_collections_seo_description", "version_about_intro", "version_about_seo_title", "version_about_seo_description", "version_materials_heading", "version_materials_intro", "version_materials_seo_title", "version_materials_seo_description", "version_privacy_heading", "version_privacy_intro", "version_privacy_seo_title", "version_privacy_seo_description", "version_terms_heading", "version_terms_intro", "version_terms_seo_title", "version_terms_seo_description", "version_updated_at", "version_created_at", "created_at", "updated_at" FROM \`_page_content_v\`;`)
  await db.run(sql`DROP TABLE \`_page_content_v\`;`)
  await db.run(sql`ALTER TABLE \`__new__page_content_v\` RENAME TO \`_page_content_v\`;`)
  await db.run(sql`CREATE INDEX \`_page_content_v_created_at_idx\` ON \`_page_content_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_updated_at_idx\` ON \`_page_content_v\` (\`updated_at\`);`)
}
