# Spring Up LMS — Deployment Guide

Deploy to **Vercel** for a fast, free demo. Follow these steps.

---

## 1. Push your code to GitHub

1. Create a new repo at [github.com/new](https://github.com/new) (e.g. `springup-lms`)
2. In your project folder, run:

```powershell
cd c:\Users\HP\Desktop\Dev\springup-lms\springup-lms

# If git isn't initialized yet:
git init

git add .
git commit -m "Spring Up LMS - ready for deployment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/springup-lms.git
git push -u origin main
```

---

## 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in (GitHub recommended)
2. Click **Add New** → **Project**
3. Import your `springup-lms` repo
4. Vercel will detect Next.js — keep the default settings
5. Before deploying, add environment variables (see below)
6. Click **Deploy**

---

## 3. Environment variables

In Vercel: **Project → Settings → Environment Variables**

Add these for **Production** (and Preview if you want):

| Name | Value | Notes |
|------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | From Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | Same place as above |

Copy the values from your local `.env.local` file.

---

## 4. Supabase configuration

In **Supabase Dashboard → Authentication → URL Configuration**:

- **Site URL**: `https://your-app.vercel.app` (your Vercel URL after first deploy)
- **Redirect URLs**: add `https://your-app.vercel.app/**` and `https://your-app.vercel.app/login`

---

## 5. Verify deployment

1. Visit your Vercel URL (e.g. `https://springup-lms-xxx.vercel.app`)
2. Test login/signup
3. Check the marketing page and dashboard

---

## Quick deploy (Vercel CLI)

```powershell
npm i -g vercel
cd c:\Users\HP\Desktop\Dev\springup-lms\springup-lms
vercel
```

Follow the prompts and add env vars when asked.

---

## Troubleshooting

- **Build fails**: Run `npm run build` locally and fix any errors
- **Auth redirects fail**: Update Supabase redirect URLs with your Vercel domain
- **Images 404**: `next.config.ts` already includes `images.unsplash.com` and `img.youtube.com`
