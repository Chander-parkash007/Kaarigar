# 🔨 HireLocal - Hyperlocal Service Marketplace

A platform connecting customers with verified local service providers (plumbers, electricians, tutors, carpenters, cleaners, etc.) in Pakistani cities.

## 🎯 Features

### For Customers
- 🔍 Browse service providers by category and location
- ⭐ View ratings and reviews
- 📞 Direct contact with workers
- 🏆 Filter by verified badge
- 📍 Area-based search

### For Service Providers
- 📝 Free profile creation
- 📸 Portfolio management (up to 10 photos)
- 💰 Flexible upgrade options (Boost & Verified Badge)
- 📊 Profile analytics (views, reviews, ratings)
- 💳 Easy payment via Easypaisa/JazzCash

### For Admin
- 👥 Worker management
- 💸 Payment approval workflow
- 📋 Activity logs
- 🚀 Manual boost/verification controls
- 📊 Platform statistics

## 💰 Revenue Model

| Plan | Price | Duration | Benefits |
|------|-------|----------|----------|
| **Free** | Rs. 0 | First 2 weeks | Basic profile listing |
| **Boost** | Rs. 50 | 7 days | Appear higher in search, Featured badge |
| **Verified** | Rs. 100 | 30 days | Top of results, ✅ Verified badge, Maximum trust |

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 4
- **Database:** Supabase (PostgreSQL)
- **Auth:** JWT (jsonwebtoken)
- **Storage:** Supabase Storage
- **Deployment:** Vercel (free tier)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- A Supabase account (free tier works)
- A Vercel account for deployment

### 1. Clone & Install

```bash
cd hirelocal
npm install
```

### 2. Setup Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** and run the entire `supabase/schema.sql` file
3. Go to **Storage** and create two buckets:
   - `worker-photos` (public access)
   - `payment-screenshots` (private access)

### 3. Configure Environment Variables

Copy `.env.local` and fill in your Supabase credentials:

```env
# Get these from Supabase > Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Generate a strong random string
ADMIN_JWT_SECRET=your-very-long-random-secret-here

# Your WhatsApp number (with country code)
NEXT_PUBLIC_ADMIN_WHATSAPP=923001234567

# Your Easypaisa/JazzCash number
NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER=03001234567
```

### 4. Change Default Admin Password

⚠️ **IMPORTANT:** The default admin credentials are `admin` / `admin123`.

To change the password:

1. Go to your Supabase dashboard > SQL Editor
2. Run:
```sql
-- Generate new password hash (replace 'your-new-password' with your actual password)
SELECT crypt('your-new-password', gen_salt('bf', 10));

-- Update admin password
UPDATE admin_users 
SET password_hash = 'paste-the-hash-from-above' 
WHERE username = 'admin';
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

### 6. Test the Platform

1. **Register as a worker:** http://localhost:3000/register
2. **Login as admin:** http://localhost:3000/admin/login (admin / admin123)
3. **Search workers:** http://localhost:3000/search

## 📦 Deployment to Vercel

### One-Click Deploy

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your GitHub repository
5. Add environment variables from `.env.local`
6. Click Deploy

### Environment Variables for Production

Make sure to add all these in Vercel dashboard:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_JWT_SECRET (use a strong random string!)
NEXT_PUBLIC_ADMIN_WHATSAPP
NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER
```

## 🔐 Security Checklist

Before going live, ensure you:

- [x] Changed default admin password
- [x] Set strong `ADMIN_JWT_SECRET` in production
- [x] Updated `NEXT_PUBLIC_ADMIN_WHATSAPP` to your real number
- [x] Updated `NEXT_PUBLIC_ADMIN_PAYMENT_NUMBER` to your real Easypaisa/JazzCash
- [x] Enabled Row Level Security (RLS) policies in Supabase (already in schema.sql)
- [x] Configured Supabase storage buckets with correct permissions

## 📱 Admin Panel Guide

### Accessing Admin Panel

URL: `https://your-domain.com/admin/login`

**Default Credentials (CHANGE IMMEDIATELY):**
- Username: `admin`
- Password: `admin123`

### Admin Features

#### 1. Dashboard (`/admin`)
- Overview statistics
- Pending payment requests count
- Quick navigation

#### 2. Workers Management (`/admin/workers`)
- View all workers
- Filter by: All, Verified, Boosted, Free, Pending Payments
- Search by name or phone
- Actions per worker:
  - Boost profile (7 days)
  - Verify badge (30 days)
  - Deactivate/Activate profile

#### 3. Pending Payments (`/admin/pending`)
- Review payment screenshots
- Approve or reject requests
- Automatically activates upgrades on approval

#### 4. Activity Logs (`/admin/logs`)
- Full audit trail of all admin actions
- Track who did what and when

## 💳 Payment Workflow

### For Workers (Current Implementation)

**Option 1: Upload Screenshot (Recommended)**
1. Worker goes to Dashboard
2. Clicks "Upgrade Now" on desired plan
3. Sends payment to admin Easypaisa/JazzCash number
4. Uploads payment screenshot
5. Admin reviews and approves within 24 hours
6. Upgrade activates automatically

**Option 2: WhatsApp**
1. Worker sends payment
2. Messages admin on WhatsApp with screenshot
3. Admin manually activates upgrade from admin panel

### For Admin

1. Go to `/admin/pending`
2. View payment screenshot
3. Click "Approve & Activate" or "Reject"
4. Worker's profile tier updates immediately
5. Action logged in activity logs

## 📊 Database Schema Overview

### Key Tables

- **workers** - Service provider profiles
- **reviews** - Customer ratings & feedback
- **portfolio_photos** - Worker work samples
- **payment_requests** - Upgrade payment submissions
- **activity_logs** - Admin action tracking
- **admin_users** - Admin credentials

See `supabase/schema.sql` for complete schema with indexes and triggers.

## 🎨 Customization

### Adding New Service Categories

Edit `lib/constants.ts`:

```typescript
export const CATEGORIES = [
  { value: 'plumber', label: 'Plumber', urdu: 'پلمبر', icon: '🔧' },
  // Add your new category here
  { value: 'driver', label: 'Driver', urdu: 'ڈرائیور', icon: '🚗' },
]
```

### Adding New Cities

Edit `lib/constants.ts`:

```typescript
export const CITIES: Record<string, string[]> = {
  Lahore: ['DHA', 'Gulberg', ...],
  Karachi: ['DHA', 'Clifton', ...],
  // Add your new city here
  Faisalabad: ['Peoples Colony', 'Gulberg', 'Samanabad', ...],
}
```

### Changing Pricing

Edit `lib/constants.ts`:

```typescript
export const BOOST_PRICE_WEEKLY = 50  // Change to your price
export const VERIFIED_PRICE_MONTHLY = 100  // Change to your price
```

## 🐛 Troubleshooting

### Workers can't upload photos
- Check Supabase Storage buckets are created
- Verify bucket permissions (worker-photos = public)
- Check file size limit (5MB max)

### Admin login fails
- Verify JWT secret is set in .env.local
- Check Supabase admin_users table has the admin record
- Try resetting admin password using SQL Editor

### Payment screenshots not appearing
- Create `payment-screenshots` bucket in Supabase Storage
- Set it to private access
- Check SUPABASE_SERVICE_ROLE_KEY is set

### Profile views not incrementing
- Check Supabase function `increment_profile_views()` exists
- Verify session storage is enabled in browser

## 📈 Future Enhancements

Potential features for Phase 2:

- [ ] Email notifications (SendGrid/Resend integration)
- [ ] SMS verification for phone numbers
- [ ] Automated payment gateway (Stripe/2Checkout)
- [ ] Worker response to reviews
- [ ] Customer accounts with booking history
- [ ] In-app messaging
- [ ] Push notifications
- [ ] Mobile apps (React Native)
- [ ] Multi-language support (full Urdu translation)
- [ ] Advanced analytics dashboard

## 📄 License

This project is created for educational purposes as part of an entrepreneurship course project.

## 🤝 Support

For any issues or questions:
- Check the issues in this repository
- Review the `supabase/schema.sql` for database structure
- Verify all environment variables are set correctly

---

**Built with ❤️ for the Pakistani market**

Apka Bharosa, Apka Kaam 🇵🇰
