# RLS Policy Generator

A visual builder for **Supabase Row Level Security** policies. Define your table, toggle access per role, and copy production-ready SQL — without typing a single `auth.uid()` by hand.

> **Live demo:** https://rls-policy-generator.vercel.app

![Screenshot](./public/screenshot.png)

## Why

Supabase's row-level security is one of the most powerful features in Postgres, but writing the SQL is repetitive and easy to get wrong:

- Forgetting `WITH CHECK` on `INSERT` / `UPDATE`
- Mixing up `USING` and `WITH CHECK` semantics
- Inconsistent policy naming
- Skipping `ALTER TABLE … ENABLE ROW LEVEL SECURITY` entirely

This tool generates the boilerplate for you and includes a row-preview overlay so you can _see_ exactly which rows each role can read and write.

## Features

- **Schema builder** — name your table, add typed columns
- **Access matrix** — toggle SELECT / INSERT / UPDATE / DELETE per role (`anon`, `authenticated`, `owner`)
- **Owner detection** — auto-detects `user_id`, `owner_id`, or `created_by` for `auth.uid()` checks
- **Live SQL output** — syntax-highlighted, with copy and download
- **Preset templates** — Blog, SaaS, Ecommerce, Public Read-Only, Private Notes
- **Row preview** — visual map of what each role can read / write per row

## Tech stack

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38BDF8?logo=tailwindcss&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-RLS-3ECF8E?logo=supabase&logoColor=white)

- **Next.js 14** App Router
- **TypeScript**
- **Tailwind CSS** with a custom dark theme (`#0a0a0b` base, `#3ECF8E` accent)
- **shadcn/ui** patterns (lightweight, no runtime deps)
- **lucide-react** icons
- **DM Sans** + **JetBrains Mono** typography

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

```bash
npm i -g vercel    # one-time CLI install
vercel             # preview deployment
vercel --prod      # production deployment
```

Or push to GitHub and import the repo from [vercel.com/new](https://vercel.com/new).

## File structure

```
rls-policy-generator/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── ui/panel.tsx
│   ├── access-rules.tsx
│   ├── header.tsx
│   ├── preset-selector.tsx
│   ├── row-preview.tsx
│   ├── schema-builder.tsx
│   └── sql-output.tsx
├── lib/
│   ├── presets.ts
│   ├── sample-data.ts
│   ├── sql-generator.ts
│   ├── syntax-highlighter.ts
│   ├── types.ts
│   └── utils.ts
└── public/
```

## License

MIT
