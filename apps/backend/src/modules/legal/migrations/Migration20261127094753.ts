import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261127094753 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "legal_document" drop constraint if exists "legal_document_slug_unique";`);
    this.addSql(`create table if not exists "legal_document" ("id" text not null, "slug" text not null, "title" text not null, "badge" text not null default 'LEGAL & POLICY', "category" text check ("category" in ('privacy', 'terms', 'warranty', 'shipping', 'tax_gst', 'returns')) not null default 'privacy', "summary" text not null, "content_markdown" text not null, "status" text check ("status" in ('draft', 'published')) not null default 'published', "show_in_footer" boolean not null default true, "display_order" integer not null default 100, "version_label" text not null default 'v1.0', "effective_date" text null, "updated_by" text null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "legal_document_pkey" primary key ("id"));`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_legal_document_slug_unique" ON "legal_document" ("slug") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_legal_document_deleted_at" ON "legal_document" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "legal_document" cascade;`);
  }

}
