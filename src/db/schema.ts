import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
  json,
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { LocalizedString, UserRole, TaskCategory, TaskStatus, ValueCategory, Evaluator } from '@/lib/types';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: text('hashed_password'),
  avatarUrl: text('avatar_url'),
  role: text('role').$type<UserRole>().notNull().default('Unassigned'),
  jabatan: varchar('jabatan', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  title: json('title').$type<LocalizedString>().notNull(),
  description: json('description').$type<LocalizedString>(),
  status: text('status').$type<TaskStatus>().notNull().default('To-do'),
  dueDate: timestamp('due_date').notNull(),
  category: text('category').$type<TaskCategory>().notNull().default('Medium'),
  value: integer('value').notNull().default(0),
  valueCategory: text('value_category').$type<ValueCategory>(),
  evaluator: text('evaluator').$type<Evaluator>(),
  approvedBy: text('approved_by'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const tasksToUsers = pgTable('tasks_to_users', {
    taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, (t) => ({
    pk: primaryKey({ columns: [t.taskId, t.userId] }),
}));

export const subtasks = pgTable('subtasks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  isCompleted: boolean('is_completed').notNull().default(false),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const files = pgTable('files', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  url: text('url').notNull(),
  size: text('size').notNull(),
  note: text('note'),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  content: json('content').$type<LocalizedString>().notNull(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  isPinned: boolean('is_pinned').default(false),
  authorId: text('author_id').references(() => users.id),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const revisions = pgTable('revisions', {
  id: text('id').primaryKey(),
  timestamp: timestamp('timestamp').defaultNow().notNull(),
  change: json('change').$type<LocalizedString>().notNull(),
  authorId: text('author_id').references(() => users.id),
  taskId: text('task_id').references(() => tasks.id, { onDelete: 'cascade' }),
});

export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  read: boolean('read').default(false).notNull(),
  link: text('link'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  taskId: text('task_id').references(() => tasks.id),
});


// RELATIONS

export const usersRelations = relations(users, ({ many }) => ({
  assignedTasks: many(tasksToUsers),
  comments: many(comments),
  revisions: many(revisions),
  notifications: many(notifications),
}));

export const tasksRelations = relations(tasks, ({ many, one }) => ({
  assignees: many(tasksToUsers),
  subtasks: many(subtasks),
  files: many(files),
  comments: many(comments),
  revisions: many(revisions),
}));

export const tasksToUsersRelations = relations(tasksToUsers, ({ one }) => ({
    task: one(tasks, {
        fields: [tasksToUsers.taskId],
        references: [tasks.id],
    }),
    user: one(users, {
        fields: [tasksToUsers.userId],
        references: [users.id],
    }),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [comments.taskId],
    references: [tasks.id],
  }),
}));

export const revisionsRelations = relations(revisions, ({ one }) => ({
  author: one(users, {
    fields: [revisions.authorId],
    references: [users.id],
  }),
  task: one(tasks, {
    fields: [revisions.taskId],
    references: [tasks.id],
  }),
}));

export const subtasksRelations = relations(subtasks, ({ one }) => ({
  task: one(tasks, {
    fields: [subtasks.taskId],
    references: [tasks.id],
  }),
}));

export const filesRelations = relations(files, ({ one }) => ({
  task: one(tasks, {
    fields: [files.taskId],
    references: [tasks.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
    user: one(users, {
        fields: [notifications.userId],
        references: [users.id],
    }),
    task: one(tasks, {
        fields: [notifications.taskId],
        references: [tasks.id],
    }),
}));