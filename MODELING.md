# Schema Design — Personal Productivity Hub

> Fill in every section below. Keep answers concise.

---

## 1. Collections Overview

Briefly describe each collection (1–2 sentences each):

- **users** — Stores user account info like email, hashed password, and name. Email is unique.
- **projects** — Groups tasks and notes under a single owner. Can be archived instead of deleted.
- **tasks** — Individual to-do items with embedded subtasks and tags. Belongs to a project and user.
- **notes** — Free-form notes that optionally link to a project. Supports tags.

---

## 2. Document Shapes

For each collection, write the document shape (field name + type + required/optional):

### users
{
  _id: ObjectId,
  email: string (required, unique),
  passwordHash: string (required),
  name: string (required),
  createdAt: Date (required)
}

### projects
{
  _id: ObjectId,
  ownerId: ObjectId (required),
  name: string (required),
  description: string (optional),
  archived: boolean (required, default: false),
  createdAt: Date (required)
}

### tasks
{
  _id: ObjectId,
  ownerId: ObjectId (required),
  projectId: ObjectId (required),
  title: string (required),
  priority: number (optional, default: 1),
  tags: string[] (optional, default: []),
  subtasks: Array<{title: string, done: boolean}> (optional, default: []),
  status: string (required, default: "todo"),
  createdAt: Date (required),
  dueDate: Date (optional)
}

### notes
{
  _id: ObjectId,
  ownerId: ObjectId (required),
  projectId: ObjectId (optional),
  title: string (required),
  content: string (required),
  tags: string[] (optional),
  createdAt: Date (required)
}

---

## 3. Embed vs Reference — Decisions

For each relationship, state whether you embedded or referenced, and **why** (one sentence):

| Relationship                       | Embed or Reference? | Why? |
|-----------------------------------|---------------------|------|
| Subtasks inside a task            | Embed               | Subtasks are always accessed with their parent task and have no meaning on their own. |
| Tags on a task                    | Embed               | Tags are simple strings that belong directly to the task, no need for a separate collection. |
| Project → Task ownership          | Reference           | Tasks can grow large in number; storing them separately avoids unbounded arrays and keeps projects lean. |
| Note → optional Project link      | Reference           | Notes can stand alone or link to a project, so a reference is flexible and avoids duplication. |

---

## 4. Schema Flexibility Example

Name one field that exists on **some** documents but not **all** in the same collection. Explain why this is acceptable (or even useful) in MongoDB.

> The `dueDate` field in tasks exists only on some tasks. This is fine in MongoDB because documents in the same collection don't need identical schemas — you simply omit the field when a task has no deadline. It keeps documents clean, avoids storing nulls, and you can still query with `$exists: true` when needed.