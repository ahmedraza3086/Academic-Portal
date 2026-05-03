# Academic Portal Frontend

This frontend is implemented with vanilla JavaScript modules and a centralized store.

## Structure

```
assets/js/
	app/
		core/
			auth.js
			config.js
			http.js
			session.js
			store.js
		services/
			authService.js
			adminService.js
			facultyService.js
			studentService.js
		pages/
			loginPage.js
			adminPage.js
			facultyPage.js
			studentPage.js
		ui/
			forms.js
			notifications.js
		utils/
			formatters.js
			validators.js
	login.js
	admin.js
	faculty.js
	student.js
```

## State Management

- A shared store is implemented in `assets/js/app/core/store.js`.
- Each page writes to its own state slice (`admin`, `faculty`, `student`, `auth`).
- UI rendering is subscription-driven: page controllers subscribe to store changes and rerender targeted sections.

## Authentication Flow

1. Login page submits credentials to `POST /api/auth/login`.
2. Token and user payload are persisted via `session.js`.
3. Role-based guard in `auth.js` redirects users to their dashboard.
4. Every authenticated API request sends `Authorization: Bearer <token>`.

## API Integration Coverage

- Admin: students, faculty, courses, enrollments, course assignment
- Faculty: own courses, enrolled students, attendance create/update/delete, marks create/update/delete, student performance
- Student: profile, attendance, marks

## Running

1. Start backend (`npm run dev` in `backend/`).
2. (Optional but recommended) reset demo credentials: `npm run reset:demo-passwords` in `backend/`.
3. Open `frontend/login.html` using a static server or VS Code Live Server.
4. Login with records that exist in your database.

## Notes

- `auth-config.js` no longer bypasses authentication.
- Unauthorized API responses trigger automatic logout and redirect to login.
