// Seeds the demo courses into MongoDB.
// Run it yourself from the backend folder with:
//     CONFIRM_DEMO_SEED=yes npm run seed:demo
// It is never run when the server starts.
//
// Safe to run again: a course is only added if no course with the same title
// exists. Nothing is deleted and existing courses are never changed.
//
// Safety checks (it stops before connecting to the database if either fails):
//   1. NODE_ENV must not be "production"
//   2. CONFIRM_DEMO_SEED must be set to "yes"
require("dotenv").config();

const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Course = require("../src/models/Course");
const demoCourses = require("../data/demoCourses");

// Adds each course if its title is not already in the database.
// Returns how many were added and how many were skipped.
const seedCourses = async (courses) => {
    let added = 0;
    let skipped = 0;

    for (const course of courses) {
        const result = await Course.updateOne(
            { title: course.title },
            { $setOnInsert: course },
            { upsert: true }
        );

        if (result.upsertedCount > 0) {
            added++;
        } else {
            skipped++;
        }
    }

    return { added, skipped };
};

// Checks the two safety rules. Returns an error message, or null if it is safe to seed.
const checkSafeToSeed = (env) => {
    if (env.NODE_ENV === "production") {
        return "Refusing to seed demo data because NODE_ENV is 'production'.";
    }

    if (env.CONFIRM_DEMO_SEED !== "yes") {
        return "Refusing to seed demo data. To confirm you want to seed this database, run: CONFIRM_DEMO_SEED=yes npm run seed:demo";
    }

    return null;
};

const run = async () => {
    // Stop before touching the database if a safety check fails
    const problem = checkSafeToSeed(process.env);
    if (problem) {
        console.error(problem);
        process.exit(1);
    }

    try {
        await connectDB();

        const { added, skipped } = await seedCourses(demoCourses);
        console.log(`Demo courses added: ${added}`);
        console.log(`Demo courses already present (skipped): ${skipped}`);
    } catch (error) {
        console.error("Seeding failed:", error.message);
        process.exitCode = 1;
    } finally {
        await mongoose.connection.close();
    }
};

// Only run when started from the command line (so tests can import seedCourses)
if (require.main === module) {
    run();
}

module.exports = { seedCourses, checkSafeToSeed };
