import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-d1-sqlite'

// Hand-trimmed: payload migrate:create diffed against a stale schema snapshot
// and emitted spurious orders/site_settings changes already present in the
// live DBs (and a destructive site_settings rebuild in DOWN). This migration
// is reduced to the only real change — the new `page_content` global tables.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`page_content\` (
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
  await db.run(sql`CREATE TABLE \`_page_content_v\` (
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
  await db.run(sql`CREATE INDEX \`_page_content_v_created_at_idx\` ON \`_page_content_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_page_content_v_updated_at_idx\` ON \`_page_content_v\` (\`updated_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`_page_content_v\`;`)
  await db.run(sql`DROP TABLE \`page_content\`;`)
}
