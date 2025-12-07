# DyneTap: Open Source SaaS Online Menu System 🌐

## Overview 📖

DyneTap is a cutting-edge, open-source SaaS online menu system for restaurants. Based on this [template](https://github.com/jakubczarnowski/t3-starter-supabase-i18n/blob/main/README.md?plain=1). Made by [Tryhards Inc.](https://tryhards.space/)

## Key Features 🔑

- **QR Code Generation**: Facilitate ordering with unique QR codes.
- **Real-time Menu and Price Management**: Update menus and prices as needed.
- **Ready to print pdf templates**: Customize your own Menu QR Card!

## Technology Stack 💻

- **Frontend**: Next.js 14 with App Directory
- **Backend**: Supabase for Auth, Migrations, Multiple Environments, CI/CD, and Storage
- **Payments**: Integration with LemonSqueezy
- **Data Handling**: TRPC, Prisma, and Postgres
- **UI**: Tailwind CSS and Shadcn UI
- **Deployment**: Edge Ready with Vercel Edge
- **Analytics**: Umami
- **Internalization**: i18next

For more details, visit [DyneTap](https://dynetap.com).

## What's next? How do I start this? 🚀

- Clone this project
- Run

- Open Git Bash Terminal and run the following commands

```
npm install -g pnpm
```

```
pnpm install
```

- Copy the .env.example into .env and fill out the envs

- To use docker desktop, you need to install WSL

```
wsl --install
```

- then run 

```
pnpm db:start
```

```
pnpm prisma generate
```

## Run these initial commands 🧑‍💻

Every time you change something on local instance:

```
pnpm prepare:local
```

- If you develop on cloud supabase run:

```
pnpm prepare:remote
```

- Run the project

```
pnpm dev
```

If you are not familiar with the different technologies used in this project, please refer to the respective docs. 📚

- [Next.js app router](https://nextjs.org/docs)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)
- [Supabase](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

## If you add new fields to scheme.prisma

E.g.

```
// Example change in schema.prisma
model Menu {
  id                    String
  name                  String
  newfield              String
}
```

Then run the command to add a new migration to supabase

```
pnpm supabase migration new add_logo_image_urls
```

Then in this new migration file, add the changes, E.g.

```
-- Add the new columns to the public.menus table

ALTER TABLE "public"."menus" 
ADD COLUMN "newfiled" TEXT;
```

Lastly run this command to apply the changes to the database

```
pnpm supabase migration up
```

Then run

```
pnpm prisma generate
```

## If you want to develop on local supabase instance, follow the steps below: 👨‍💻

Then go to supabase/config.toml file and change your service name.

Log into supabase on browser first, then run 

- pnpm supabase login

Link the project with your supabase instance:

- supabase link --project-ref *<*project-id*>*

- E.g. pnpm supabase link --project-ref htrrbkpacijwddyfbtmj

Then lastly

- pnpm supabase db push

#### If you want to create migrations by hand, go ahead and use this command: ✍️

- supabase migration new <_migration_name_>

E.g

```
pnpm supabase migration new add_logo_image_urls
```

Then go to supabase/migrations folder and add your SQL there.

#### If you want to make changes with studio, use 🎨

- pnpm db:diff <_migration_name_>

## Learn More 🧐

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this? 🚢

Follow deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.

## Don't need Internalization? 🤔

I know, that's a rare request to have. Check out [this](https://github.com/Jaaneek/t3-supabase-app-router) repo for a more 'lightweight' version!

## Authors

👤 **Devon Yeung**

<!-- - Twitter: [@twitter.com/jaaneek/](https://twitter.com/jaaneek) -->
- Github: [@Devon0216](https://github.com/Devon0216)
- LinkedIn: [@www.linkedin.com/in/devon-yeung-769071217](www.linkedin.com/in/devon-yeung-769071217)
