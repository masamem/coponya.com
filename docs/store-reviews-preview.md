# Store reviews preview

1. Use an isolated Supabase project or branch with the catalog schema and an active test store. Apply `database/store-reviews.sql` after the catalog schema. Use `database/store-reviews.test.sql` on a disposable database to exercise the review permissions and workflow.
2. Configure Supabase email OTP delivery for the preview environment. Include `{{ .Token }}` in the email template used for passwordless sign-in and verify delivery to the test accounts. Add a preview admin to `public.admin_users`.
3. Scope `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, and `VITE_STORE_REVIEWS=true` to the reviews branch in the Vercel Preview environment. Rebuild after setting these variables.
4. On a store page, sign in by email code and submit an ordinary review. With another account, submit a review containing a URL and verify it stays out of the public list. Open `/admin` to review it. Report a published review from another account, then hide it in the admin queue and verify it disappears from the store page.

The database permits one review per account per store. The screening rules send flagged content to an admin and publish reviews with no flags. Admin decisions and reports are stored in the database.
