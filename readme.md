
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


