-- Sports Rewritten editorial backend blueprint.
-- This is intentionally a design file, not a Supabase migration.
-- When the dedicated Sports Rewritten Supabase project is connected, create an official
-- migration with the current Supabase CLI/MCP workflow, review it, run advisors, and commit it.

create extension if not exists pgcrypto;

create table public.editorial_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null check (role in ('contributor','editor','admin')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users(id),
  title text not null default '',
  subtitle text not null default '',
  slug text unique,
  sport text not null,
  scenario_type text,
  tags text[] not null default '{}',
  excerpt text not null default '',
  hero_draft_path text,
  hero_public_url text,
  hero_alt text not null default '',
  seo_title text not null default '',
  seo_description text not null default '',
  editor_notes text not null default '',
  status text not null default 'draft' check (status in ('draft','in_review','changes_requested','scheduled','published','archived')),
  access_level text not null default 'premium' check (access_level in ('free','premium')),
  submitted_at timestamptz,
  scheduled_for timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.article_sections (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  heading text not null default '',
  body text not null default '',
  display_order integer not null,
  is_premium boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(article_id, display_order)
);

create table public.editorial_feedback (
  id uuid primary key default gen_random_uuid(),
  article_id uuid not null references public.articles(id) on delete cascade,
  author_id uuid not null references auth.users(id),
  body text not null,
  created_at timestamptz not null default now()
);

alter table public.editorial_memberships enable row level security;
alter table public.articles enable row level security;
alter table public.article_sections enable row level security;
alter table public.editorial_feedback enable row level security;

-- Explicit grants are included because new Supabase projects no longer necessarily expose
-- newly-created public-schema tables to the Data API automatically.
grant select on public.editorial_memberships to authenticated;
grant select, insert, update on public.articles to authenticated;
grant select on public.articles to anon;
grant select, insert, update, delete on public.article_sections to authenticated;
grant select on public.article_sections to anon;
grant select, insert, update, delete on public.editorial_feedback to authenticated;

create policy "members can read their own editorial membership"
on public.editorial_memberships for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "published articles are public"
on public.articles for select
to anon, authenticated
using (status = 'published');

create policy "contributors can read their own articles"
on public.articles for select
to authenticated
using ((select auth.uid()) = author_id);

create policy "editors can read all articles"
on public.articles for select
to authenticated
using (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
));

create policy "members can create their own drafts"
on public.articles for insert
to authenticated
with check (
  (select auth.uid()) = author_id
  and status = 'draft'
  and exists (
    select 1 from public.editorial_memberships m
    where m.user_id = (select auth.uid()) and m.active and m.role in ('contributor','editor','admin')
  )
);

create policy "contributors can update their own editorial drafts"
on public.articles for update
to authenticated
using (
  (select auth.uid()) = author_id
  and status in ('draft','changes_requested','in_review')
)
with check (
  (select auth.uid()) = author_id
  and status in ('draft','changes_requested','in_review')
);

create policy "editors can update all articles"
on public.articles for update
to authenticated
using (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
))
with check (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
));

create policy "published article sections are public"
on public.article_sections for select
to anon, authenticated
using (exists (
  select 1 from public.articles a
  where a.id = article_id and a.status = 'published'
));

create policy "authors can manage sections for their own editable articles"
on public.article_sections for all
to authenticated
using (exists (
  select 1 from public.articles a
  where a.id = article_id
    and a.author_id = (select auth.uid())
    and a.status in ('draft','changes_requested','in_review')
))
with check (exists (
  select 1 from public.articles a
  where a.id = article_id
    and a.author_id = (select auth.uid())
    and a.status in ('draft','changes_requested','in_review')
));

create policy "editors can manage all article sections"
on public.article_sections for all
to authenticated
using (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
))
with check (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
));

create policy "authors can read feedback on their articles"
on public.editorial_feedback for select
to authenticated
using (exists (
  select 1 from public.articles a
  where a.id = article_id and a.author_id = (select auth.uid())
));

create policy "editors can manage editorial feedback"
on public.editorial_feedback for all
to authenticated
using (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
))
with check (exists (
  select 1 from public.editorial_memberships m
  where m.user_id = (select auth.uid()) and m.active and m.role in ('editor','admin')
));

-- Production Storage design:
--   article-drafts: private bucket, contributor-owned upload paths
--   article-public: public bucket, editor-approved final assets only
-- Storage policies will be added only after the dedicated project and buckets exist.
