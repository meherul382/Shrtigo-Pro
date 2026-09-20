# Shrtigo Pro Subscription Setup

The manual subscription database migration is in `supabase/subscriptions.sql`.

## Setup

1. Open Supabase Dashboard → SQL Editor.
2. Run `supabase/schema.sql` if it has not been run already.
3. Run `supabase/subscriptions.sql`.
4. Create your custom plans in `subscription_plans`.
5. Add your own Supabase Auth user ID to `admin_users`.
6. Keep the Supabase service-role key server-side only; never expose it in `NEXT_PUBLIC_*` variables.

## Manual payment flow

1. User signs in and selects a plan.
2. User submits payment method (`bkash` or `nagad`), sender phone number, transaction ID, and optional note.
3. An order is saved with `pending` status.
4. Admin verifies the payment outside the application.
5. Admin calls `approve_subscription_order(order_id, null)` to approve, or `approve_subscription_order(order_id, 'reason')` to reject.
6. Approval creates an active subscription using the plan duration.

## Important production rules

- Do not activate Premium from the browser.
- Validate ownership and admin access on the server/database.
- Add rate limits and duplicate transaction-ID checks before launch.
- Configure an admin dashboard endpoint using authenticated server-side checks.
- Review the RLS policies before exposing any order-management UI.
