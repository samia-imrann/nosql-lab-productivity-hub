// seed.js
// =============================================================================
//  Seed the database with realistic test data.
//  Run with: npm run seed
//
//  Required minimum:
//    - 2 users
//    - 4 projects (split across the users)
//    - 5 tasks (with embedded subtasks and tags arrays)
//    - 5 notes (some attached to projects ., some standalone)
//
//  Use the bcrypt module to hash passwords before inserting users.
//  Use ObjectId references for relationships (projectId, ownerId).
// =============================================================================

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { ObjectId } = require('mongodb');
const { connect } = require('./db/connection');

(async () => {
  const db = await connect();

  // Clear existing data so re‑seeding is idempotent
  await db.collection('users').deleteMany({});
  await db.collection('projects').deleteMany({});
  await db.collection('tasks').deleteMany({});
  await db.collection('notes').deleteMany({});

  // =============================================================================
  //  1. Create two users
  // =============================================================================
  const passwordHash1 = await bcrypt.hash('alice123', 10);
  const user1 = {
    email: 'alice@example.com',
    passwordHash: passwordHash1,
    name: 'Alice Chen',
    createdAt: new Date(),
  };

  const passwordHash2 = await bcrypt.hash('bob456', 10);
  const user2 = {
    email: 'bob@example.com',
    passwordHash: passwordHash2,
    name: 'Bob Miller',
    createdAt: new Date(),
  };

  const userRes1 = await db.collection('users').insertOne(user1);
  const userRes2 = await db.collection('users').insertOne(user2);
  const aliceId = userRes1.insertedId;
  const bobId = userRes2.insertedId;

  console.log('Seeded users:', aliceId, bobId);

  // =============================================================================
  //  2. Create 4 projects (3 for Alice, 1 for Bob)
  // =============================================================================
  const project1 = {
    ownerId: aliceId,
    name: 'Final Year Project',
    description: 'Research and implementation of a smart dashboard',
    archived: false,
    createdAt: new Date('2026-03-01T10:00:00Z'),
  };
  const project2 = {
    ownerId: aliceId,
    name: 'Job Hunt 2026',
    description: 'Applications, interviews, and networking',
    archived: false,
    createdAt: new Date('2026-03-15T14:30:00Z'),
  };
  const project3 = {
    ownerId: aliceId,
    name: 'Home Renovation',
    description: 'Kitchen and bathroom remodel',
    archived: false,
    createdAt: new Date('2026-04-01T09:00:00Z'),
  };
  const project4 = {
    ownerId: bobId,
    name: 'Open Source Contributions',
    description: 'Bug fixes and documentation for MongoDB driver',
    archived: false,
    createdAt: new Date('2026-03-20T12:00:00Z'),
  };

  const projRes1 = await db.collection('projects').insertOne(project1);
  const projRes2 = await db.collection('projects').insertOne(project2);
  const projRes3 = await db.collection('projects').insertOne(project3);
  const projRes4 = await db.collection('projects').insertOne(project4);

  const fypId = projRes1.insertedId;
  const jobId = projRes2.insertedId;
  const homeId = projRes3.insertedId;
  const ossId = projRes4.insertedId;

  console.log('Seeded projects:', fypId, jobId, homeId, ossId);

  // =============================================================================
  //  3. Create 5 tasks (with embedded subtasks, tags, and schema flexibility)
  //     Schema flexibility: include a `dueDate` field on some tasks but not all
  // =============================================================================
  const task1 = {
    ownerId: aliceId,
    projectId: fypId,
    title: 'Design database schema for dashboard',
    priority: 2,
    tags: ['design', 'mongodb'],
    subtasks: [
      { title: 'Review embedding vs referencing', done: true },
      { title: 'Draw ER diagram', done: false },
      { title: 'Write MODELING.md', done: false },
    ],
    status: 'in-progress',
    createdAt: new Date('2026-03-02T11:00:00Z'),
    dueDate: new Date('2026-03-10T23:59:59Z'),   // schema flexibility
  };

  const task2 = {
    ownerId: aliceId,
    projectId: fypId,
    title: 'Implement user authentication',
    priority: 3,
    tags: ['backend', 'security'],
    subtasks: [
      { title: 'Set up passport.js', done: true },
      { title: 'Create signup/login routes', done: true },
      { title: 'Hash passwords with bcrypt', done: false },
    ],
    status: 'todo',
    createdAt: new Date('2026-03-05T09:30:00Z'),
  };

  const task3 = {
    ownerId: aliceId,
    projectId: jobId,
    title: 'Prepare for technical interview',
    priority: 3,
    tags: ['interview', 'leetcode'],
    subtasks: [
      { title: 'Review JavaScript closures', done: false },
      { title: 'Practice MongoDB aggregation', done: false },
    ],
    status: 'todo',
    createdAt: new Date('2026-03-20T16:00:00Z'),
    dueDate: new Date('2026-03-25T09:00:00Z'),   // schema flexibility
  };

  const task4 = {
    ownerId: aliceId,
    projectId: homeId,
    title: 'Research kitchen countertop materials',
    priority: 1,
    tags: ['home', 'research'],
    subtasks: [
      { title: 'Compare quartz vs granite', done: true },
      { title: 'Get price quotes', done: false },
    ],
    status: 'done',
    createdAt: new Date('2026-04-02T14:20:00Z'),
  };

  const task5 = {
    ownerId: bobId,
    projectId: ossId,
    title: 'Write aggregation pipeline examples for docs',
    priority: 2,
    tags: ['documentation', 'mongodb'],
    subtasks: [
      { title: 'Create sample datasets', done: true },
      { title: 'Write $lookup example', done: true },
      { title: 'Review with team', done: false },
    ],
    status: 'in-progress',
    createdAt: new Date('2026-03-21T10:15:00Z'),
    dueDate: new Date('2026-03-30T18:00:00Z'),   // schema flexibility
  };

  await db.collection('tasks').insertMany([task1, task2, task3, task4, task5]);
  console.log('Seeded 5 tasks');

  // =============================================================================
  //  4. Create 5 notes (some attached to projects, some standalone)
  // =============================================================================
  const note1 = {
    ownerId: aliceId,
    projectId: fypId,
    title: 'Meeting notes – 2026-03-04',
    content: 'Discussed using MongoDB Atlas search; decided to use standard indexes.',
    tags: ['meeting', 'indexing'],
    createdAt: new Date('2026-03-04T15:00:00Z'),
  };
  const note2 = {
    ownerId: aliceId,
    projectId: jobId,
    title: 'Company research: Acme Corp',
    content: 'They use MongoDB heavily; highlight aggregation skills.',
    tags: ['job', 'research'],
    createdAt: new Date('2026-03-21T09:00:00Z'),
  };
  const note3 = {
    ownerId: aliceId,
    projectId: homeId,
    title: 'Contractor recommendations',
    content: 'John’s Construction quoted $12k; needs follow‑up.',
    tags: ['home', 'budget'],
    createdAt: new Date('2026-04-03T11:30:00Z'),
  };
  const note4 = {
    ownerId: aliceId,
    title: 'General reading list',
    content: 'MongoDB: The Definitive Guide, Designing Data‑Intensive Applications',
    tags: ['learning', 'books'],
    createdAt: new Date('2026-03-10T20:00:00Z'),
  };
  const note5 = {
    ownerId: bobId,
    title: 'PR review checklist',
    content: 'Always check for $lookup usage and index coverage.',
    tags: ['oss', 'review'],
    createdAt: new Date('2026-03-22T14:45:00Z'),
  };

  await db.collection('notes').insertMany([note1, note2, note3, note4, note5]);
  console.log('Seeded 5 notes');

  console.log('Seeding complete!');
  process.exit(0);
})();