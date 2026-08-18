import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`hp_cat_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_cat_items_order_idx\` ON \`hp_cat_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_cat_items_parent_id_idx\` ON \`hp_cat_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_cat_items_image_idx\` ON \`hp_cat_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_mat_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`material_id\` integer,
  	\`display_name\` text,
  	\`description\` text,
  	\`url\` text,
  	FOREIGN KEY (\`material_id\`) REFERENCES \`materials\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_mat_items_order_idx\` ON \`hp_mat_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_mat_items_parent_id_idx\` ON \`hp_mat_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_mat_items_material_idx\` ON \`hp_mat_items\` (\`material_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_uc_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_uc_items_order_idx\` ON \`hp_uc_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_uc_items_parent_id_idx\` ON \`hp_uc_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_uc_items_image_idx\` ON \`hp_uc_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_cmp_cols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`best_for\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_cmp_cols_order_idx\` ON \`hp_cmp_cols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_cmp_cols_parent_id_idx\` ON \`hp_cmp_cols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_cmp_scores\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`score\` numeric,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`hp_cmp_rows\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_cmp_scores_order_idx\` ON \`hp_cmp_scores\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_cmp_scores_parent_id_idx\` ON \`hp_cmp_scores\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_cmp_rows\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_cmp_rows_order_idx\` ON \`hp_cmp_rows\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_cmp_rows_parent_id_idx\` ON \`hp_cmp_rows\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_testi_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`role\` text,
  	\`avatar_id\` integer,
  	\`is_placeholder\` integer DEFAULT true,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_testi_items_order_idx\` ON \`hp_testi_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_testi_items_parent_id_idx\` ON \`hp_testi_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_testi_items_avatar_idx\` ON \`hp_testi_items\` (\`avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_why_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_why_items_order_idx\` ON \`hp_why_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_why_items_parent_id_idx\` ON \`hp_why_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`hp_learn_items\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`meta\` text,
  	\`title\` text,
  	\`summary\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hp_learn_items_order_idx\` ON \`hp_learn_items\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hp_learn_items_parent_id_idx\` ON \`hp_learn_items\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`hp_learn_items_image_idx\` ON \`hp_learn_items\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`homepage\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`hero_heading\` text,
  	\`hero_subheading\` text,
  	\`hero_image_id\` integer,
  	\`hero_primary_cta_label\` text,
  	\`hero_primary_cta_url\` text,
  	\`hero_secondary_cta_label\` text,
  	\`hero_secondary_cta_url\` text,
  	\`categories_enabled\` integer DEFAULT true,
  	\`popular_enabled\` integer DEFAULT true,
  	\`popular_heading\` text,
  	\`materials_section_enabled\` integer DEFAULT true,
  	\`materials_section_heading\` text,
  	\`use_cases_enabled\` integer DEFAULT true,
  	\`use_cases_heading\` text,
  	\`fresh_prints_enabled\` integer DEFAULT true,
  	\`fresh_prints_heading\` text,
  	\`fresh_prints_view_all_label\` text,
  	\`fresh_prints_view_all_url\` text,
  	\`staff_pick_enabled\` integer DEFAULT true,
  	\`staff_pick_eyebrow\` text,
  	\`staff_pick_heading\` text,
  	\`staff_pick_body\` text,
  	\`staff_pick_image_id\` integer,
  	\`staff_pick_product_id\` integer,
  	\`staff_pick_cta_label\` text,
  	\`staff_pick_cta_url\` text,
  	\`compare_enabled\` integer DEFAULT true,
  	\`compare_heading\` text,
  	\`testimonials_enabled\` integer DEFAULT false,
  	\`testimonials_heading\` text,
  	\`why_aura_enabled\` integer DEFAULT true,
  	\`why_aura_heading\` text,
  	\`why_aura_subheading\` text,
  	\`learning_hub_enabled\` integer DEFAULT false,
  	\`learning_hub_heading\` text,
  	\`learning_hub_view_all_label\` text,
  	\`learning_hub_view_all_url\` text,
  	\`_status\` text DEFAULT 'draft',
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`staff_pick_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`staff_pick_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_hero_hero_image_idx\` ON \`homepage\` (\`hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_staff_pick_staff_pick_image_idx\` ON \`homepage\` (\`staff_pick_image_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_staff_pick_staff_pick_product_idx\` ON \`homepage\` (\`staff_pick_product_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage__status_idx\` ON \`homepage\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`homepage_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`homepage\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`homepage_rels_order_idx\` ON \`homepage_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_parent_idx\` ON \`homepage_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_path_idx\` ON \`homepage_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`homepage_rels_products_id_idx\` ON \`homepage_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_cat_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_cat_items_v_order_idx\` ON \`_hp_cat_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_cat_items_v_parent_id_idx\` ON \`_hp_cat_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_cat_items_v_image_idx\` ON \`_hp_cat_items_v\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_mat_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`material_id\` integer,
  	\`display_name\` text,
  	\`description\` text,
  	\`url\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`material_id\`) REFERENCES \`materials\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_mat_items_v_order_idx\` ON \`_hp_mat_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_mat_items_v_parent_id_idx\` ON \`_hp_mat_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_mat_items_v_material_idx\` ON \`_hp_mat_items_v\` (\`material_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_uc_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`subtitle\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_uc_items_v_order_idx\` ON \`_hp_uc_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_uc_items_v_parent_id_idx\` ON \`_hp_uc_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_uc_items_v_image_idx\` ON \`_hp_uc_items_v\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_cmp_cols_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`best_for\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_cmp_cols_v_order_idx\` ON \`_hp_cmp_cols_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_cmp_cols_v_parent_id_idx\` ON \`_hp_cmp_cols_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_cmp_scores_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`score\` numeric,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_hp_cmp_rows_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_cmp_scores_v_order_idx\` ON \`_hp_cmp_scores_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_cmp_scores_v_parent_id_idx\` ON \`_hp_cmp_scores_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_cmp_rows_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_cmp_rows_v_order_idx\` ON \`_hp_cmp_rows_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_cmp_rows_v_parent_id_idx\` ON \`_hp_cmp_rows_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_testi_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`quote\` text,
  	\`attribution\` text,
  	\`role\` text,
  	\`avatar_id\` integer,
  	\`is_placeholder\` integer DEFAULT true,
  	\`_uuid\` text,
  	FOREIGN KEY (\`avatar_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_testi_items_v_order_idx\` ON \`_hp_testi_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_testi_items_v_parent_id_idx\` ON \`_hp_testi_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_testi_items_v_avatar_idx\` ON \`_hp_testi_items_v\` (\`avatar_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_why_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`body\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_why_items_v_order_idx\` ON \`_hp_why_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_why_items_v_parent_id_idx\` ON \`_hp_why_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_hp_learn_items_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`meta\` text,
  	\`title\` text,
  	\`summary\` text,
  	\`url\` text,
  	\`image_id\` integer,
  	\`_uuid\` text,
  	FOREIGN KEY (\`image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hp_learn_items_v_order_idx\` ON \`_hp_learn_items_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hp_learn_items_v_parent_id_idx\` ON \`_hp_learn_items_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_hp_learn_items_v_image_idx\` ON \`_hp_learn_items_v\` (\`image_id\`);`)
  await db.run(sql`CREATE TABLE \`_homepage_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_hero_heading\` text,
  	\`version_hero_subheading\` text,
  	\`version_hero_image_id\` integer,
  	\`version_hero_primary_cta_label\` text,
  	\`version_hero_primary_cta_url\` text,
  	\`version_hero_secondary_cta_label\` text,
  	\`version_hero_secondary_cta_url\` text,
  	\`version_categories_enabled\` integer DEFAULT true,
  	\`version_popular_enabled\` integer DEFAULT true,
  	\`version_popular_heading\` text,
  	\`version_materials_section_enabled\` integer DEFAULT true,
  	\`version_materials_section_heading\` text,
  	\`version_use_cases_enabled\` integer DEFAULT true,
  	\`version_use_cases_heading\` text,
  	\`version_fresh_prints_enabled\` integer DEFAULT true,
  	\`version_fresh_prints_heading\` text,
  	\`version_fresh_prints_view_all_label\` text,
  	\`version_fresh_prints_view_all_url\` text,
  	\`version_staff_pick_enabled\` integer DEFAULT true,
  	\`version_staff_pick_eyebrow\` text,
  	\`version_staff_pick_heading\` text,
  	\`version_staff_pick_body\` text,
  	\`version_staff_pick_image_id\` integer,
  	\`version_staff_pick_product_id\` integer,
  	\`version_staff_pick_cta_label\` text,
  	\`version_staff_pick_cta_url\` text,
  	\`version_compare_enabled\` integer DEFAULT true,
  	\`version_compare_heading\` text,
  	\`version_testimonials_enabled\` integer DEFAULT false,
  	\`version_testimonials_heading\` text,
  	\`version_why_aura_enabled\` integer DEFAULT true,
  	\`version_why_aura_heading\` text,
  	\`version_why_aura_subheading\` text,
  	\`version_learning_hub_enabled\` integer DEFAULT false,
  	\`version_learning_hub_heading\` text,
  	\`version_learning_hub_view_all_label\` text,
  	\`version_learning_hub_view_all_url\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`version_hero_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_staff_pick_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_staff_pick_product_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_homepage_v_version_hero_version_hero_image_idx\` ON \`_homepage_v\` (\`version_hero_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_version_staff_pick_version_staff_pick_image_idx\` ON \`_homepage_v\` (\`version_staff_pick_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_version_staff_pick_version_staff_pick_produc_idx\` ON \`_homepage_v\` (\`version_staff_pick_product_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_version_version__status_idx\` ON \`_homepage_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_created_at_idx\` ON \`_homepage_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_updated_at_idx\` ON \`_homepage_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_latest_idx\` ON \`_homepage_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_homepage_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`products_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_homepage_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`products_id\`) REFERENCES \`products\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_order_idx\` ON \`_homepage_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_parent_idx\` ON \`_homepage_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_path_idx\` ON \`_homepage_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_homepage_v_rels_products_id_idx\` ON \`_homepage_v_rels\` (\`products_id\`);`)
  await db.run(sql`CREATE TABLE \`hdr_nav\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`header\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`hdr_nav_order_idx\` ON \`hdr_nav\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`hdr_nav_parent_id_idx\` ON \`hdr_nav\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`header\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`announcement_enabled\` integer DEFAULT false,
  	\`announcement_text\` text,
  	\`announcement_url\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`_hdr_nav_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_header_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_hdr_nav_v_order_idx\` ON \`_hdr_nav_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_hdr_nav_v_parent_id_idx\` ON \`_hdr_nav_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_header_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_announcement_enabled\` integer DEFAULT false,
  	\`version_announcement_text\` text,
  	\`version_announcement_url\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`_header_v_created_at_idx\` ON \`_header_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_header_v_updated_at_idx\` ON \`_header_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`ftr_col_links\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` text NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`ftr_cols\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ftr_col_links_order_idx\` ON \`ftr_col_links\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ftr_col_links_parent_id_idx\` ON \`ftr_col_links\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ftr_cols\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ftr_cols_order_idx\` ON \`ftr_cols\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ftr_cols_parent_id_idx\` ON \`ftr_cols\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ftr_social\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ftr_social_order_idx\` ON \`ftr_social\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ftr_social_parent_id_idx\` ON \`ftr_social\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`ftr_legal\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`footer\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`ftr_legal_order_idx\` ON \`ftr_legal\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`ftr_legal_parent_id_idx\` ON \`ftr_legal\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`footer\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`brand_heading\` text,
  	\`brand_copy\` text,
  	\`newsletter_heading\` text,
  	\`contact_company_name\` text,
  	\`contact_address\` text,
  	\`contact_phone\` text,
  	\`contact_email\` text,
  	\`copyright\` text,
  	\`updated_at\` text,
  	\`created_at\` text
  );
  `)
  await db.run(sql`CREATE TABLE \`_ftr_col_links_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_ftr_cols_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_ftr_col_links_v_order_idx\` ON \`_ftr_col_links_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_ftr_col_links_v_parent_id_idx\` ON \`_ftr_col_links_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_ftr_cols_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_ftr_cols_v_order_idx\` ON \`_ftr_cols_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_ftr_cols_v_parent_id_idx\` ON \`_ftr_cols_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_ftr_social_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`platform\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_ftr_social_v_order_idx\` ON \`_ftr_social_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_ftr_social_v_parent_id_idx\` ON \`_ftr_social_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_ftr_legal_v\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`label\` text NOT NULL,
  	\`url\` text NOT NULL,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_footer_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_ftr_legal_v_order_idx\` ON \`_ftr_legal_v\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_ftr_legal_v_parent_id_idx\` ON \`_ftr_legal_v\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_footer_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_brand_heading\` text,
  	\`version_brand_copy\` text,
  	\`version_newsletter_heading\` text,
  	\`version_contact_company_name\` text,
  	\`version_contact_address\` text,
  	\`version_contact_phone\` text,
  	\`version_contact_email\` text,
  	\`version_copyright\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`_footer_v_created_at_idx\` ON \`_footer_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_footer_v_updated_at_idx\` ON \`_footer_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE TABLE \`site_settings\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`site_name\` text,
  	\`default_seo_title\` text,
  	\`default_seo_description\` text,
  	\`default_seo_og_image_id\` integer,
  	\`updated_at\` text,
  	\`created_at\` text,
  	FOREIGN KEY (\`default_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`site_settings_default_seo_default_seo_og_image_idx\` ON \`site_settings\` (\`default_seo_og_image_id\`);`)
  await db.run(sql`CREATE TABLE \`_site_settings_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`version_site_name\` text,
  	\`version_default_seo_title\` text,
  	\`version_default_seo_description\` text,
  	\`version_default_seo_og_image_id\` integer,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`version_default_seo_og_image_id\`) REFERENCES \`media\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_site_settings_v_version_default_seo_version_default_seo_idx\` ON \`_site_settings_v\` (\`version_default_seo_og_image_id\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_created_at_idx\` ON \`_site_settings_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_site_settings_v_updated_at_idx\` ON \`_site_settings_v\` (\`updated_at\`);`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`caption\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`migration_key\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`source_url\` text;`)
  await db.run(sql`ALTER TABLE \`media\` ADD \`temporary_asset\` integer DEFAULT false;`)
  await db.run(sql`CREATE UNIQUE INDEX \`media_migration_key_idx\` ON \`media\` (\`migration_key\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`hp_cat_items\`;`)
  await db.run(sql`DROP TABLE \`hp_mat_items\`;`)
  await db.run(sql`DROP TABLE \`hp_uc_items\`;`)
  await db.run(sql`DROP TABLE \`hp_cmp_cols\`;`)
  await db.run(sql`DROP TABLE \`hp_cmp_scores\`;`)
  await db.run(sql`DROP TABLE \`hp_cmp_rows\`;`)
  await db.run(sql`DROP TABLE \`hp_testi_items\`;`)
  await db.run(sql`DROP TABLE \`hp_why_items\`;`)
  await db.run(sql`DROP TABLE \`hp_learn_items\`;`)
  await db.run(sql`DROP TABLE \`homepage\`;`)
  await db.run(sql`DROP TABLE \`homepage_rels\`;`)
  await db.run(sql`DROP TABLE \`_hp_cat_items_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_mat_items_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_uc_items_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_cmp_cols_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_cmp_scores_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_cmp_rows_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_testi_items_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_why_items_v\`;`)
  await db.run(sql`DROP TABLE \`_hp_learn_items_v\`;`)
  await db.run(sql`DROP TABLE \`_homepage_v\`;`)
  await db.run(sql`DROP TABLE \`_homepage_v_rels\`;`)
  await db.run(sql`DROP TABLE \`hdr_nav\`;`)
  await db.run(sql`DROP TABLE \`header\`;`)
  await db.run(sql`DROP TABLE \`_hdr_nav_v\`;`)
  await db.run(sql`DROP TABLE \`_header_v\`;`)
  await db.run(sql`DROP TABLE \`ftr_col_links\`;`)
  await db.run(sql`DROP TABLE \`ftr_cols\`;`)
  await db.run(sql`DROP TABLE \`ftr_social\`;`)
  await db.run(sql`DROP TABLE \`ftr_legal\`;`)
  await db.run(sql`DROP TABLE \`footer\`;`)
  await db.run(sql`DROP TABLE \`_ftr_col_links_v\`;`)
  await db.run(sql`DROP TABLE \`_ftr_cols_v\`;`)
  await db.run(sql`DROP TABLE \`_ftr_social_v\`;`)
  await db.run(sql`DROP TABLE \`_ftr_legal_v\`;`)
  await db.run(sql`DROP TABLE \`_footer_v\`;`)
  await db.run(sql`DROP TABLE \`site_settings\`;`)
  await db.run(sql`DROP TABLE \`_site_settings_v\`;`)
  await db.run(sql`DROP INDEX \`media_migration_key_idx\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`caption\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`migration_key\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`source_url\`;`)
  await db.run(sql`ALTER TABLE \`media\` DROP COLUMN \`temporary_asset\`;`)
}
