# Client Setup Guide

## 1. Run Locally
1. Install [Node.js](https://nodejs.org).
2. Install dependencies:
   ```bash
   npm install
   npm install -g vercel
   ```
3. Start the server:
   ```bash
   vercel dev
   ```

## 2. Supabase Setup (Database & Storage)
1. Go to [Supabase](https://supabase.com), create a project.
2. In the **SQL Editor**, paste the entire contents of `supabase/schema.sql` and click **Run**.
3. Under **Storage**, create a new **Public** bucket named `gallery`.

## 3. Resend Setup (Emails)
1. Create a [Resend](https://resend.com) account.
2. Verify your domain, and create an **API Key**.

## 4. Vercel Deployment
1. Import your project repository into [Vercel](https://vercel.com).
2. Add these Environment Variables under **Project Settings**:
   * `VITE_SUPABASE_URL` (Supabase Project URL)
   * `VITE_SUPABASE_ANON_KEY` (Supabase Public Anon Key)
   * `SUPABASE_SERVICE_ROLE_KEY` (Supabase Secret Service Role Key)
   * `RESEND_API_KEY` (Resend API Key)
   * `EMAIL_FROM` (Verified Resend email, e.g. `bookings@yourdomain.com`)
   * `BOOKING_NOTIFY_EMAIL` (Owner email address to get booking notifications)
   * `VITE_SITE_URL` (Your production Vercel URL, e.g. `https://yourdomain.com`)
3. Click **Deploy**.

## 5. Create Admin Account
1. In **Supabase Dashboard** -> **Authentication** -> **Users**, click **Add User** -> **Create User**.
2. Promote the user to admin in the **SQL Editor** by running:
   ```sql
   UPDATE public.profiles 
   SET role = 'admin' 
   WHERE id = (SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com');
   ```
   *(Change `admin@yourdomain.com` to your registered admin email).*
3. Go to `/admin` on your website to log in.