# Custom domain website — agent-observatory.dev

Host the marketing site at a **project-branded domain** (not `github.io`, not your personal name, not Vercel/Netlify).

**Recommended stack:** [Cloudflare Pages](https://pages.cloudflare.com/) + domain from [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) or [Porkbun](https://porkbun.com/).

---

## What you're deploying

| Item | Path |
|------|------|
| Static landing site | `website/` in this repo |
| Product dashboard | Still **local** at `127.0.0.1:7420` (not hosted) |

The website is marketing + install docs. The tool itself always runs on the user's machine.

---

## Step 1 — Pick and buy a domain

Choose one TLD (check availability):

| Domain | Vibe | Typical price |
|--------|------|---------------|
| **agent-observatory.dev** | Developer tool (HTTPS required) | ~$12/yr |
| **agent-observatory.com** | Most professional | ~$10–15/yr |
| **agent-observatory.xyz** | Cheap, startup-y | ~$2/yr |
| **agent-observatory.in** | India presence | ~₹500–800/yr |

**Where to buy**

1. **[Cloudflare Registrar](https://www.cloudflare.com/products/registrar/)** — at-cost pricing, easy DNS + Pages (best if using Cloudflare Pages)
2. **[Porkbun](https://porkbun.com/)** — cheap, good UI; point DNS to Cloudflare later
3. **Namecheap / Google Domains** — also fine

Search: `agent-observatory` on the registrar. Buy **only the domain** — you don't need their website builder.

---

## Step 2 — Deploy with Cloudflare Pages (recommended)

Why Cloudflare Pages (and not Vercel/Netlify/github.io):

- ✅ Custom domain: `https://agent-observatory.dev`
- ✅ Free SSL (HTTPS)
- ✅ Free hosting for static sites
- ✅ Connects to GitHub — auto-deploy on push
- ❌ Not Vercel, Netlify, or `username.github.io`

### 2a. Create Cloudflare account

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com/sign-up)
2. Add your domain (if bought elsewhere, update nameservers to Cloudflare)

### 2b. Create Pages project

1. **Workers & Pages** → **Create** → **Pages** → **Connect to Git**
2. Select repo: `Ayush7614/agent-observatory`
3. Build settings:

| Setting | Value |
|---------|--------|
| Production branch | `main` |
| Framework preset | **None** |
| Build command | *(leave empty)* |
| Build output directory | **`website`** |

4. **Save and Deploy**

Your site will get a temporary URL like `agent-observatory.pages.dev` — we'll replace that with your custom domain.

### 2c. Attach custom domain

1. Pages project → **Custom domains** → **Set up a custom domain**
2. Enter: `agent-observatory.dev` (or your chosen domain)
3. Also add: `www.agent-observatory.dev` → redirect to apex (optional)
4. Cloudflare creates DNS records automatically if the domain is on Cloudflare

Wait 2–10 minutes for SSL. Visit `https://agent-observatory.dev`.

---

## Step 3 — DNS (if domain is NOT on Cloudflare)

If you bought on Porkbun/Namecheap:

1. Add domain to Cloudflare (free plan)
2. Update nameservers at your registrar to Cloudflare's NS records
3. In Cloudflare DNS, Pages will add a `CNAME` for `@` or `www` when you connect custom domain

Or manually:

```
CNAME  www   agent-observatory.pages.dev
CNAME  @     agent-observatory.pages.dev   (or use Cloudflare flattening)
```

---

## Alternative hosts (no Vercel/Netlify)

| Host | Custom domain | Notes |
|------|---------------|-------|
| **Cloudflare Pages** | ✅ | Recommended — free, fast |
| **AWS S3 + CloudFront** | ✅ | More setup, pennies/month |
| **Hetzner / DO VPS** | ✅ | Nginx serving `website/` — full control |
| **GitHub Pages + custom domain** | ✅ | URL is yours, but uses GitHub infra |
| **Surge.sh** | ✅ | CLI deploy, custom domain on paid |

---

## Step 4 — Update links after domain is live

Once `https://agent-observatory.dev` works:

1. Update `website/index.html` `og:url` meta tag
2. Add website URL to GitHub repo **About** → Website field
3. Optional: add to README badge

---

## Local preview

```bash
cd website
npx --yes serve .
# open http://localhost:3000
```

Or Python:

```bash
cd website && python3 -m http.server 8080
```

---

## What NOT to host in the cloud

- Session data (`~/.agent-observatory/`)
- The dashboard API (port 7420)
- User transcripts

Those stay **local-first** per [SECURITY.md](./SECURITY.md).

---

## Checklist

- [ ] Buy `agent-observatory.dev` (or .com / .xyz / .in)
- [ ] Cloudflare Pages → connect GitHub → output `website`
- [ ] Custom domain attached + HTTPS green lock
- [ ] GitHub repo Website field updated
- [ ] README links to live site
