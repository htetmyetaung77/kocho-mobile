# Automatic Sales Reports

The bot sends sales summaries to every chat ID configured in `ADMIN_ID`.

## Schedule (Myanmar time)

- **Daily:** Every day at **20:00** (`Asia/Yangon`)
- **Weekly:** Every Sunday at **20:05** (`Asia/Yangon`)

A report includes approved orders (`confirmed` and `delivered`), total order count, total units, total revenue, and the top products by revenue.

## Manual reports

Admins can request an immediate report from Telegram:

- `/dailyreport`
- `/weeklyreport`

Or open `/admin` and choose **Daily Report** or **Weekly Report**.

## Notes

- The bot records `approved_at` when an order becomes `confirmed`.
- Existing confirmed/delivered orders without `approved_at` fall back to their original `created_at` for reporting.
- Report delivery is deduplicated per period using the persistent `settings` table.
- The Render process must be running at the scheduled time. The existing health pings and self-ping reduce the chance of the free service sleeping, but Render's free plan can still sleep or restart.
