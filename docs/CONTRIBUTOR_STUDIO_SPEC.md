# Sports Rewritten Contributor Studio

## Purpose

Contributor Studio is the private editorial workspace for Sports Rewritten. It allows approved writers to create and revise articles without touching GitHub or source code.

## Roles

- **Admin** — manages contributors, editorial settings, publishing, and all articles.
- **Editor** — reviews, requests changes, schedules, and publishes articles.
- **Contributor** — creates and edits their own drafts and submits them for review.

Contributors do not publish directly in Version 1. Every contributor article passes through editorial review.

## Article workflow

`Draft → In Review → Changes Requested → In Review → Scheduled/Published`

Editors can also archive an article.

## Editor fields

Each article supports:

- Headline
- Subtitle/deck
- Slug
- Sport/category
- Scenario type
- Tags
- Excerpt
- Hero image
- Hero image alt text
- Article sections
- Section headings
- Free/premium section control
- Source notes
- SEO title
- SEO description
- Social/Discover image
- Estimated reading time
- Draft notes

## Media workflow

Contributors will upload images through the Studio instead of committing media to GitHub.

The production backend should use two storage areas:

1. **Private draft media** for unpublished uploads.
2. **Public published media** for images attached to published articles and crawlable article previews.

Only approved final assets move into the published-media area.

## Review workflow

1. Contributor creates a draft.
2. Draft autosaves.
3. Contributor previews the article in the Sports Rewritten layout.
4. Contributor submits for review.
5. Editor can approve, edit, or request changes with notes.
6. Contributor receives requested changes and resubmits.
7. Editor schedules or publishes.

## Security rules

- A contributor can read and edit only their own unpublished articles.
- Editors/admins can access all editorial articles.
- Only editors/admins can publish or schedule.
- Authorization roles must not be stored in user-editable profile metadata.
- Database tables exposed through the Supabase Data API must use Row Level Security.
- Service-role credentials must never be sent to the browser.

## Current checkpoint

The `/studio` route is an interactive front-end prototype. It supports article fields, sections, local draft autosave, hero-image preview, and review-state simulation while the dedicated Sports Rewritten Supabase backend is being created.

The production connection will replace browser-local persistence with Supabase Auth, Postgres, Storage, and editorial role policies without changing the contributor-facing workflow.
