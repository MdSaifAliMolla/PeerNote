# Admin Feature Setup

## 1. Run the migration to add `is_admin` to Users

This repo is not wired up for `sequelize-cli`, so add the column manually:
```sql
ALTER TABLE Users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE NOT NULL;
```

## 2. Promote a user to admin (first time only)

Option A: Via SQLite CLI
```bash
cd backend-node
sqlite3 db.sqlite3
UPDATE Users SET is_admin = 1 WHERE username = 'your_username';
.exit
```

Option B: Via any SQLite GUI (DB Browser for SQLite)

## 3. Access the admin dashboard

- Log in as the admin user.
- An "Admin" link will appear in the navbar.
- Visit `/admin` to see all users and toggle admin status.

## 4. Admin routes

- `GET /api/admin/users/` — list all users (admin only)
- `POST /api/admin/users/:userId/toggle-admin/` — toggle admin flag (admin only)

## 5. Frontend behavior

- Admin link only shows for users with `is_admin: true`.
- Session stores `isAdmin` flag from login response.
- Logout clears both token and admin flag.
