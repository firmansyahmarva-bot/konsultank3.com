# Project Roadmap & Action Checklist
**Project:** `KonsultanK3.com` Domain Rebirth & Lead-Gen Funnel for `wahanatotalita.com`  

---

## Phase 1: Domain Acquisition & Pre-Flight Setup (Days 1–3)
- [ ] Complete domain registration/transfer for `konsultank3.com`.
- [ ] Connect domain nameservers to Cloudflare (free plan is sufficient).
- [ ] Enable SSL/TLS encryption (Full Strict mode on Cloudflare).
- [ ] Add domain property to **Google Search Console** (via DNS verification TXT record).

---

## Phase 2: Defensive SEO & Purge Rules (Days 4–7)
- [ ] Configure server-level / Cloudflare Page Rules:
  - Return **`410 Gone`** for all legacy doorway patterns (`*-[0-9]{3,4}.html`).
  - Return **`410 Gone`** for all `/pdf/*` URLs.
  - Return **`410 Gone`** for all legacy `/training/*.html` thin pages.
- [ ] Set up exact **`301 Redirect`** for high-value cited URLs:
  - `http://www.konsultank3.com/program-pengendalian-kebisingan-331.html` $\rightarrow$ `https://konsultank3.com/program-pengendalian-kebisingan/`
- [ ] Deploy WordPress or lightweight CMS using a modern, fast theme (e.g., GeneratePress, Astra, or custom Next.js/HTML).

---

## Phase 3: Core Content Publication & Link Reclamation (Weeks 2–3)
- [ ] **Pillar 1 Content (Reclaim Backlinks):**
  - Publish `/program-pengendalian-kebisingan/` (Comprehensive Guide to Noise Control & NAB).
  - Publish `/panduan-alat-pelindung-diri-k3/` (PPE / APD Standards).
  - Publish `/penyakit-akibat-kerja/` (Occupational Illnesses & Prevention).
  - Publish `/panduan-penerapan-smk3/` (PP No. 50/2012 Compliance).
- [ ] **Commercial Training Pages (Top Transactional Queries):**
  - Publish `/pelatihan-ahli-k3-umum/` (Course info, schedule, Kemnaker certificate).
  - Publish `/pelatihan-k3-kebakaran/` (Kelas D, C, B, A).
  - Publish `/pelatihan-k3-listrik/`.
- [ ] **Corporate Pages:**
  - `/tentang-kami/` (Introducing KonsultanK3.com in association with PT Wahana Totalita).
  - `/kontak/` (Direct phone, WhatsApp, office address in Sleman, Yogyakarta).

---

## Phase 4: Lead Generation & Funnel Activation (Week 4)
- [ ] Install Floating WhatsApp Lead Button linked to PT Wahana Totalita's sales team.
- [ ] Create downloadable lead magnet (e.g., *Checklist Mandiri Audit SMK3 166 Kriteria*).
- [ ] Implement Google Analytics 4 (GA4) with custom events for `whatsapp_click` and `consultation_form_submit`.
- [ ] Implement JSON-LD Structured Data (`Organization`, `Course`, `FAQPage`).

---

## Phase 5: Monitoring & Scale-Up (Month 2+)
- [ ] Inspect Google Search Console indexing status:
  - Verify that the 1,600+ doorway pages are progressively marked as 410/excluded.
  - Confirm that new pillar articles are indexed and receiving impressions.
- [ ] Expand publishing schedule: 2 to 4 high-quality OHS articles per month.
- [ ] Monitor referral conversions and training inquiries passing to `wahanatotalita.com`.
