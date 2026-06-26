Sanity Studio schema examples for Filipino Apostolate blog

What this folder contains
- `schemas/post.ts` - a Sanity schema for blog posts (title, slug, publishedAt, author, main image, body, tags)
- `schemas/author.ts` - a simple author schema

How to use
1. Create a Sanity project (if you don't have one yet):
   - Install the Sanity CLI: `npm install -g @sanity/cli`
   - Create a new project: `sanity init` and follow prompts (choose a dataset, projectId, etc.).
2. In your Sanity Studio project, copy the files from `sanity/schemas/` into your Studio's `schemas/` directory.
3. Update your studio's `schema.js` or `schema/index.ts` to import and include these schemas.
4. Start the studio: `sanity start` and create a couple of posts.

Quick notes
- These schemas use Portable Text for `body` so editors can build rich content with blocks and images.
- The `mainImage` uses `hotspot` enabled so you can crop and focus images in the Studio.

Environment and Next.js
- After you create a project, set these env vars in your Next.js project (or .env.local):
  - NEXT_PUBLIC_SANITY_PROJECT_ID
  - NEXT_PUBLIC_SANITY_DATASET (usually `production`)
  - SANITY_API_TOKEN (only if you need preview/draft reads from the API)

Once your Studio publishes posts, the Next.js example pages in `/app/blog` will fetch them and render.
