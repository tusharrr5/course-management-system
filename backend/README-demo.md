# Demo data (development only)

The course catalog is empty on a new database. This command fills it with 10 sample courses for a demo.

## How to seed

From the `backend` folder:

```
CONFIRM_DEMO_SEED=yes npm run seed:demo
```

On Windows (Command Prompt): `set CONFIRM_DEMO_SEED=yes&& npm run seed:demo`
On Windows (PowerShell): `$env:CONFIRM_DEMO_SEED="yes"; npm run seed:demo`

## About the demo content

- The courses and instructors are made up. They are demo content, not real educational offerings or real people.
- Every description starts with `[Demo]` so the demo courses are easy to spot.
- The data is in `data/demoCourses.js` and the script is in `scripts/seedDemoCourses.js`.

## Safety

- It is never run when the server starts. You have to run it yourself.
- It uses `MONGO_URI` from your `backend/.env`. Check that it points to your development or demo database first, because the script prints which database it connected to.
- It stops before connecting to the database unless `CONFIRM_DEMO_SEED=yes` is set. Any other value, such as `true` or `1`, is refused.
- It also refuses to run if `NODE_ENV` is `production`.
- Do not run it against a production database. Never commit your `.env` file or real passwords.

## Running it again

- It is safe to run again. A course is only added if no course with the same title exists, so there are no duplicates.
- It never deletes or changes existing courses, so admin-created courses and admin edits are kept.
- If an admin deletes a demo course, running the command again adds it back.
