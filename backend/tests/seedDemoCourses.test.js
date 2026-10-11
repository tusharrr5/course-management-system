// Tests for the demo course data and the seed script.
// Run with: npm test (uses Node's built-in test runner, no extra dependencies).
// The Course model is stubbed, so no MongoDB connection is needed.
const { test, beforeEach, mock } = require("node:test");
const assert = require("node:assert");

const Course = require("../src/models/Course");
const demoCourses = require("../data/demoCourses");
const { seedCourses, checkSafeToSeed } = require("../scripts/seedDemoCourses");

const SCHEMA_FIELDS = ["title", "description", "instructor", "duration", "price"];

beforeEach(() => {
    mock.restoreAll();
});

test("there are at least 10 demo courses", () => {
    assert.ok(demoCourses.length >= 10);
});

test("demo course titles are unique", () => {
    const titles = demoCourses.map((course) => course.title);
    assert.strictEqual(new Set(titles).size, titles.length);
});

test("demo courses only use the current Course schema fields", () => {
    for (const course of demoCourses) {
        assert.deepStrictEqual(Object.keys(course).sort(), [...SCHEMA_FIELDS].sort(), course.title);
    }
});

test("every demo course passes the Course schema validation", () => {
    for (const course of demoCourses) {
        const error = new Course(course).validateSync();
        assert.strictEqual(error, undefined, `${course.title} should be valid`);
        assert.ok(course.price > 0, `${course.title} price should be positive`);
    }
});

test("every demo course is labelled as demo content", () => {
    for (const course of demoCourses) {
        assert.ok(course.description.startsWith("[Demo]"), `${course.title} should be labelled`);
    }
});

test("seedCourses adds courses that are not in the database yet", async () => {
    const update = mock.method(Course, "updateOne", async () => ({ upsertedCount: 1 }));

    const result = await seedCourses(demoCourses);

    assert.deepStrictEqual(result, { added: demoCourses.length, skipped: 0 });
    assert.strictEqual(update.mock.callCount(), demoCourses.length);
});

test("seedCourses skips courses that already exist (no duplicates)", async () => {
    mock.method(Course, "updateOne", async () => ({ upsertedCount: 0 }));

    const result = await seedCourses(demoCourses);

    assert.deepStrictEqual(result, { added: 0, skipped: demoCourses.length });
});

test("seedCourses matches by title and only inserts, never overwrites", async () => {
    const update = mock.method(Course, "updateOne", async () => ({ upsertedCount: 1 }));

    await seedCourses([demoCourses[0]]);

    const [filter, change, options] = update.mock.calls[0].arguments;
    assert.deepStrictEqual(filter, { title: demoCourses[0].title });
    assert.deepStrictEqual(change, { $setOnInsert: demoCourses[0] });
    assert.deepStrictEqual(options, { upsert: true });
});

test("seedCourses never deletes anything", async () => {
    mock.method(Course, "updateOne", async () => ({ upsertedCount: 1 }));
    const deleteMany = mock.method(Course, "deleteMany", async () => ({}));
    const deleteOne = mock.method(Course, "deleteOne", async () => ({}));
    const findAndDelete = mock.method(Course, "findByIdAndDelete", async () => null);

    await seedCourses(demoCourses);

    assert.strictEqual(deleteMany.mock.callCount(), 0);
    assert.strictEqual(deleteOne.mock.callCount(), 0);
    assert.strictEqual(findAndDelete.mock.callCount(), 0);
});

// ==========================================================
// Safety checks (run before the database is touched)
// ==========================================================
test("safety check passes when CONFIRM_DEMO_SEED is yes and NODE_ENV is not production", () => {
    assert.strictEqual(checkSafeToSeed({ CONFIRM_DEMO_SEED: "yes" }), null);
    assert.strictEqual(checkSafeToSeed({ CONFIRM_DEMO_SEED: "yes", NODE_ENV: "development" }), null);
});

test("safety check refuses when CONFIRM_DEMO_SEED is missing", () => {
    const message = checkSafeToSeed({});
    assert.ok(message.includes("CONFIRM_DEMO_SEED=yes"), "message should say how to confirm");
});

for (const value of ["", "no", "true", "1", "YES", "y"]) {
    test(`safety check refuses when CONFIRM_DEMO_SEED is "${value}" (only "yes" is accepted)`, () => {
        assert.notStrictEqual(checkSafeToSeed({ CONFIRM_DEMO_SEED: value }), null);
    });
}

test("safety check refuses in production even with CONFIRM_DEMO_SEED=yes", () => {
    const message = checkSafeToSeed({ NODE_ENV: "production", CONFIRM_DEMO_SEED: "yes" });
    assert.ok(message.includes("production"));
});
