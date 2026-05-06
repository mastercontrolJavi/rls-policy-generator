import type { AppState } from "./types";

export const presets: Record<string, AppState> = {
  blog: {
    schema: {
      tableName: "posts",
      columns: [
        { id: "p1", name: "id", type: "uuid" },
        { id: "p2", name: "title", type: "text" },
        { id: "p3", name: "content", type: "text" },
        { id: "p4", name: "user_id", type: "uuid" },
        { id: "p5", name: "created_at", type: "timestamptz" },
      ],
    },
    rules: {
      anon: { select: true, insert: false, update: false, delete: false },
      authenticated: { select: true, insert: false, update: false, delete: false },
      owner: { select: true, insert: true, update: true, delete: true },
    },
  },
  saas: {
    schema: {
      tableName: "projects",
      columns: [
        { id: "s1", name: "id", type: "uuid" },
        { id: "s2", name: "name", type: "text" },
        { id: "s3", name: "config", type: "jsonb" },
        { id: "s4", name: "owner_id", type: "uuid" },
        { id: "s5", name: "created_at", type: "timestamptz" },
      ],
    },
    rules: {
      anon: { select: false, insert: false, update: false, delete: false },
      authenticated: { select: false, insert: false, update: false, delete: false },
      owner: { select: true, insert: true, update: true, delete: true },
    },
  },
  ecommerce: {
    schema: {
      tableName: "products",
      columns: [
        { id: "e1", name: "id", type: "uuid" },
        { id: "e2", name: "name", type: "text" },
        { id: "e3", name: "price", type: "numeric" },
        { id: "e4", name: "stock", type: "int4" },
        { id: "e5", name: "active", type: "bool" },
        { id: "e6", name: "created_by", type: "uuid" },
      ],
    },
    rules: {
      anon: { select: true, insert: false, update: false, delete: false },
      authenticated: { select: true, insert: false, update: false, delete: false },
      owner: { select: true, insert: true, update: true, delete: true },
    },
  },
  publicReadOnly: {
    schema: {
      tableName: "announcements",
      columns: [
        { id: "r1", name: "id", type: "uuid" },
        { id: "r2", name: "message", type: "text" },
        { id: "r3", name: "published_at", type: "timestamptz" },
      ],
    },
    rules: {
      anon: { select: true, insert: false, update: false, delete: false },
      authenticated: { select: true, insert: false, update: false, delete: false },
      owner: { select: false, insert: false, update: false, delete: false },
    },
  },
  privateNotes: {
    schema: {
      tableName: "notes",
      columns: [
        { id: "n1", name: "id", type: "uuid" },
        { id: "n2", name: "title", type: "text" },
        { id: "n3", name: "body", type: "text" },
        { id: "n4", name: "user_id", type: "uuid" },
        { id: "n5", name: "created_at", type: "timestamptz" },
      ],
    },
    rules: {
      anon: { select: false, insert: false, update: false, delete: false },
      authenticated: { select: false, insert: false, update: false, delete: false },
      owner: { select: true, insert: true, update: true, delete: true },
    },
  },
};

export const presetLabels: Record<string, string> = {
  blog: "Blog",
  saas: "SaaS",
  ecommerce: "Ecommerce",
  publicReadOnly: "Public Read-Only",
  privateNotes: "Private Notes",
};
