# 🚀 HireLocal - Complete Setup Guide for Presentation

This guide will help you deploy HireLocal and have it ready for your presentation by August 18.

## ⏰ Timeline (2 Days)

### Day 1: Setup & Deploy
- [ ] Setup Supabase database
- [ ] Configure environment variables
- [ ] Deploy to Vercel
- [ ] Test basic functionality

### Day 2: Content & Polish
- [ ] Create sample worker profiles
- [ ] Add sample reviews
- [ ] Upload portfolio photos
- [ ] Test payment workflow
- [ ] Prepare presentation demo

---

## 📋 Step-by-Step Setup

### STEP 1: Create Supabase Project (15 minutes)

1. Go to **[supabase.com](https://supabase.com)**
2. Click "Start your project" → Sign up with GitHub
3. Click "New Project"
   - Name: `hirelocal`
   - Database Password: Choose a strong password (save it!)
   - Region: Select closest to Pakistan (Singapore or Mumbai)
4. Wait 2-3 minutes for project creation

### STEP 2: Setup Database (10 minutes)

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click "New Query"
3. Open the file `d:\Rozee.pk\hirelocal\supabase\schema.sql` on your computer
4. **Copy the ENTIRE file content** and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see: "Success. No rows returned"

✅ Your database is now ready with all tables, indexes, and functions!

### STEP 3: Create Storage Buckets (5 minutes)

1. In Supabase dashboard, go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**

**Bucket 1: worker-photos**
- Name: `worker-photos`
- Public bucket: ✅ **ON**
- Click "Create bucket"

**Bucket 2: payment-screenshots**
- Name: `payment-screenshots`
- Public bucket: ❌ **OFF** (keep private)
- Click "Create bucket"

### STEP 4: Get Your Supabase Keys (5 minutes)

1. Go to **Settings** (gear icon) → **API**
2. Copy these 3 values (you'll need them):

```
Project URL: https://xxxxx.supabase.co
anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (this one is secret!)
```

### STEP 5: Configure Environment Variables (5 minutes)

1. Open the file `d:\Rozee.pk\hirelocal\.env.local`
2. Replace the placeholder values with your actual Supabase keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Change this to any random long string (mash your keyboard!)
ADMIN_JWT_SECRET=askdjh2138y912hekjasdhkjashd9812h3kjahsd

# Your WhatsApp number (with 92 country code)
NEXT_PUBLIC_ADMIN_WHATSAPP=923001234567

# Your Easypaisa/JazzCash number
NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER=03001234567
```

3. **Save the file**

### STEP 6: Test Locally (10 minutes)

1. Open terminal/command prompt in `d:\Rozee.pk\hirelocal`
2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open browser: http://localhost:3000
5. You should see the HireLocal homepage! 🎉

**Quick Test Checklist:**
- [ ] Homepage loads
- [ ] Click "Join as Professional" → Registration form appears
- [ ] Click "Browse Services" → Search page appears
- [ ] Go to http://localhost:3000/admin/login → Admin login appears

If everything works, press `Ctrl+C` to stop the server.

### STEP 7: Deploy to Vercel (15 minutes)

#### 7a. Push to GitHub (if not already)

1. Create a new repository on GitHub
2. In terminal:
```bash
git init
git add .
git commit -m "Initial commit - HireLocal"
git remote add origin https://github.com/your-username/hirelocal.git
git push -u origin main
```

#### 7b. Deploy to Vercel

1. Go to **[vercel.com](https://vercel.com)**
2. Sign up with GitHub
3. Click **"Add New..." → "Project"**
4. Select your `hirelocal` repository
5. **Configure Environment Variables:**
   - Click "Environment Variables"
   - Add each variable from your `.env.local` file:

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGci... (IMPORTANT: Don't skip this!)
ADMIN_JWT_SECRET = your-random-string
NEXT_PUBLIC_ADMIN_WHATSAPP = 923001234567
NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER = 03001234567
```

6. Click **"Deploy"**
7. Wait 2-3 minutes
8. Click the generated URL (e.g., `hirelocal-xxxxx.vercel.app`)

✅ **Your app is now live!**

### STEP 8: Change Admin Password (CRITICAL!) (5 minutes)

1. Go to Supabase dashboard → **SQL Editor**
2. Generate a new password hash. Run this:

```sql
SELECT crypt('YourNewPassword123', gen_salt('bf', 10));
```

3. Copy the result (it looks like: `$2a$10$xxxx...`)
4. Update the admin password:

```sql
UPDATE admin_users 
SET password_hash = '$2a$10$paste-your-hash-here' 
WHERE username = 'admin';
```

5. Test login at: `your-vercel-url.vercel.app/admin/login`
   - Username: `admin`
   - Password: `YourNewPassword123`

---

## 📝 Creating Demo Data (Day 2)

### Add Sample Workers (30 minutes)

1. Go to your deployed site: `your-url.vercel.app/register`
2. Create 5-10 worker profiles with different categories:

**Example Workers:**

| Name | Category | City | Area | Phone |
|------|----------|------|------|-------|
| Ahmed Khan | Plumber | Lahore | DHA | 03001234501 |
| Sara Ali | Tutor | Lahore | Gulberg | 03001234502 |
| Bilal Carpenter | Carpenter | Karachi | Clifton | 03001234503 |
| Fatima Cleaner | Cleaner | Islamabad | F-7 | 03001234504 |
| Usman Electrician | Electrician | Lahore | Johar Town | 03001234505 |

**Tips:**
- Use real-looking profile photos (download from UI Faces or ThisPersonDoesNotExist)
- Write realistic "About" sections (e.g., "10 saal ka tajurba, ghar aur office dono mein kaam karta hoon")
- Use different phone numbers for each

### Add Portfolio Photos (20 minutes)

1. Login as each worker
2. Go to Dashboard
3. Upload 3-5 work photos per worker
   - Download free stock images from Pexels/Unsplash
   - Search: "plumbing work", "carpentry", "cleaning service", etc.

### Add Reviews (15 minutes)

1. Visit each worker's public profile: `your-url/worker/{id}`
2. Scroll to reviews section
3. Add 3-4 reviews per worker:

**Sample Reviews:**

> **Sara Ahmed** ⭐⭐⭐⭐⭐  
> "Bohot acha kaam kiya. Very professional and on time!"

> **Ali Raza** ⭐⭐⭐⭐⭐  
> "Highly recommended. Sasta aur quality work."

> **Zainab Khan** ⭐⭐⭐⭐  
> "Good service. Will hire again."

### Test Payment Workflow (15 minutes)

1. Login as a worker
2. Go to Dashboard
3. Click "Upgrade Now" on Profile Boost
4. Upload a fake payment screenshot (any image)
5. Go to admin panel: `your-url/admin/login`
6. Go to "Pending Payments"
7. Review the screenshot
8. Click "Approve & Activate"
9. Go back to worker dashboard → Verify boost is active

---

## 🎤 Presentation Demo Flow (3 Minutes)

### Opening (30 seconds)
"Every day, thousands of people in Pakistan need a plumber, electrician, or tutor — but finding a trusted one is painful. You ask around, get random numbers, and hope for the best. **HireLocal solves this.**"

### Demo Flow (2 minutes)

**1. Show Homepage (15 seconds)**
- "Here's our platform. Clean, simple, mobile-friendly."
- Point out: Search bar, categories with Urdu labels

**2. Search & Browse (30 seconds)**
- Click "Plumber"
- "Customers can filter by area, rating, verified badge"
- "See how verified workers appear at the top? That's our revenue model."

**3. Worker Profile (30 seconds)**
- Click on a verified worker
- "Full profile with reviews, ratings, work photos"
- "One-click call or WhatsApp — customers pay cash directly"

**4. Worker Dashboard (30 seconds)**
- "For workers, we have a simple dashboard"
- Show profile stats
- "They can upgrade for Rs. 50/week — less than a chai"
- Show upgrade modal with payment instructions

**5. Admin Panel (15 seconds)**
- Quick switch to admin panel
- "Admins review payment screenshots and approve upgrades"
- Show pending payments page

### Closing (30 seconds)
"Our revenue streams are subscription-based — no commission anxiety. Workers pay Rs. 50/week for boost or Rs. 100/month for verified badge. With 500 paying workers, that's Rs. 250,000/month. Total startup cost? Rs. 3,000 for a domain. Everything else is free. **This is built for Pakistan — practical, profitable, and ready to scale.**"

---

## ✅ Pre-Presentation Checklist

**Day Before Presentation:**
- [ ] Site is deployed and accessible
- [ ] At least 8-10 worker profiles created
- [ ] Each worker has 2-3 reviews
- [ ] Portfolio photos uploaded
- [ ] One payment request in "Pending" (don't approve yet - show live during demo)
- [ ] Admin login works
- [ ] Test on mobile (your presentation room might have WiFi issues - prepare backup)

**Backup Plan (If Internet Fails):**
- [ ] Record 2-minute video of the demo
- [ ] Take screenshots of key pages
- [ ] Run locally on laptop with mobile hotspot

---

## 🎯 Business Model Canvas (For Presentation)

Have this printed/displayed:

### Customer Segments
- **Customers:** Homeowners, students, busy professionals
- **Workers:** Freelance plumbers, tutors, electricians, cleaners

### Value Propositions
- **For Customers:** Find trusted workers in 2 minutes, see reviews, no haggling
- **For Workers:** Get consistent clients, build reputation, free to join

### Revenue Streams
- Profile Boost: Rs. 50/week (appear higher in search)
- Verified Badge: Rs. 100/month (top placement + trust badge)

### Key Resources
- Website platform (Next.js + Supabase - free)
- Worker database
- Review system

### Cost Structure
- Startup: Rs. 3,000 (domain only)
- Monthly: Rs. 0 (free hosting on Vercel + Supabase)

### Key Metrics
- Month 1: 50 workers × Rs. 500 = Rs. 25,000
- Month 6: 500 workers × Rs. 500 = Rs. 250,000/month

---

## ❓ Expected Questions & Answers

**Q: How will you get workers to join?**
A: "First 2 weeks free. Once they see 2-3 customer calls coming in, Rs. 50/week becomes obvious value. We'll also partner with local hardware shops where workers gather."

**Q: What about payment fraud?**
A: "We manually verify screenshots via WhatsApp in Phase 1. This builds trust and is normal in Pakistan. Later, we'll integrate Easypaisa API."

**Q: Why no commission like InDrive?**
A: "Commission creates trust issues. 'Will they take my money?' With subscriptions, workers know exactly what they pay — like renting a shop window. No surprises."

**Q: What's your competitive advantage?**
A: "Three things: 1) Hyper-local (neighborhood level), 2) Verified badges build trust, 3) No app download needed — works on any phone browser."

**Q: How will you scale?**
A: "Start in one neighborhood (e.g., DHA Lahore). Perfect the model. Then expand to other areas, then other cities. Trust is built locally, not nationally overnight."

---

## 🎉 You're Ready!

If you followed this guide, you now have:
- ✅ A fully functional platform deployed to Vercel
- ✅ Working admin panel with payment approvals
- ✅ Sample workers with reviews and portfolios
- ✅ A clear 3-minute demo flow
- ✅ Business model backed by real code

**Good luck with your presentation! 🚀**

---

*Need help? Check the main README.md for troubleshooting or contact your team.*
