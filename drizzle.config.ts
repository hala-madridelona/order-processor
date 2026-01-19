import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL env var is not defined!');
}

export default defineConfig({
    schema: "./dist/lib/sql/models/*.js",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: process.env.DATABASE_URL
    }
})