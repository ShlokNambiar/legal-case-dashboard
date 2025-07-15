# Fix Vercel Environment Variables

## Problem
Your Vercel deployment is using the wrong Supabase instance:
- **Current (Wrong)**: `https://iuhbvtvuugkccewysrci.supabase.co`
- **Correct**: `https://uqxmnrithfjttfvmbsgj.supabase.co`

## Solution
Update your Vercel environment variables:

### Step 1: Go to Vercel Dashboard
1. Go to https://vercel.com/dashboard
2. Click on your `legal-case-dashboard` project
3. Go to **Settings** tab
4. Click on **Environment Variables**

### Step 2: Update Variables
Update these environment variables:

**NEXT_PUBLIC_SUPABASE_URL**
- Current: `https://iuhbvtvuugkccewysrci.supabase.co`
- **Change to**: `https://uqxmnrithfjttfvmbsgj.supabase.co`

**NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Change to**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxeG1ucml0aGZqdHRmdm1ic2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1NDAzNTYsImV4cCI6MjA2ODExNjM1Nn0.8d8qxxGHaM6C2eOR-702mNeoR7Gz1AKC5PwncozZOD4`

### Step 3: Redeploy
After updating the environment variables:
1. Go to **Deployments** tab
2. Click the **...** menu on the latest deployment
3. Click **Redeploy**

## Expected Result
After redeployment, your dashboards should show all 1,046 legal cases properly filtered by Igatpuri and Trimbakeshwar.