import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20261125015422 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "showcase_entry" ("id" text not null, "entry_type" text check ("entry_type" in ('customer_feedback', 'store_visit')) not null, "category" text check ("category" in ('video_unboxing', 'video_review', 'in_store_pickup', 'open_box_check', 'audio_keyboard_demo', 'launch_event', 'customer_selfie', 'written_review')) not null, "media_kind" text check ("media_kind" in ('video', 'image', 'none')) not null default 'video', "status" text check ("status" in ('draft', 'published', 'archived')) not null default 'published', "title" text not null, "quote_or_caption" text not null, "author_name" text not null, "author_city" text not null default 'Muzaffarpur, Bihar', "hub_location" text check ("hub_location" in ('motijheel-842001', 'club-road-842002', 'online-pan-india')) not null default 'motijheel-842001', "rating" integer null, "product_handle" text null, "product_title" text null, "media_url" text null, "media_public_id" text null, "thumbnail_url" text null, "duration_seconds" real null, "media_width" integer null, "media_height" integer null, "mime_type" text null, "is_featured" boolean not null default false, "is_verified_buyer" boolean not null default true, "display_order" integer not null default 100, "visited_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "showcase_entry_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_showcase_entry_deleted_at" ON "showcase_entry" ("deleted_at") WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "showcase_entry" cascade;`);
  }

}
