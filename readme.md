
npm install

npm install next react react-dom

npm install mongoose bcryptjs jsonwebtoken cookie

npm install tailwind-merge clsx tailwindcss-animate

npm install pg

npm install tailwindcss@3 postcss autoprefixer

npm install fs dotenv

npm install -D nodemon

npm run dev

FOR THE DATABASE SETUP:

first:
psql -U postgres -c "CREATE DATABASE enrollment_system;"

*use the following credentials
host: localhost
port: 5432
username: postgres
password: 123456

to run the scripting for the db:

node runMigrations.js
node runScripts.js

## User Roles

The system supports three user roles:

1. **Student** - Can view available sections, enroll in courses, and view their grades
2. **Faculty** - Can view their assigned sections, manage enrollments, and upload grades
3. **Admin** - Can view all faculty members, students, courses, and sections (read-only dashboard)

### Admin Login

Username: `admin`
Password: `pass123`

The admin dashboard provides a comprehensive view of:
- All faculty members
- All students
- All courses
- All sections with enrollment status


