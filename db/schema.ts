import { relations } from "drizzle-orm";
import { pgTable, serial, text, timestamp, integer, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const trips = pgTable("trips", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  destination: text("destination").notNull(),
  startDate: text("start_date"),
  endDate: text("end_date"),
  userId: integer("user_id").notNull().references(() => users.id), //Trip Owner
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id), // Cart belongs to a Trip
  isActive: boolean("is_active").default(true), // To handle history later
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  category: text("category").notNull(), // 'flight', 'hotel', 'dining', 'experience'
  externalId: text("external_id"), //ID from API
  data: jsonb("data").notNull(), //snapshot of data: price, times, images, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const participants = pgTable("participants", {
  userId: integer("user_id").notNull().references(() => users.id),
  tripId: integer("trip_id").notNull().references(() => trips.id),
  role: text("role").default("member"), // 'owner', 'editor', 'viewer'
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (t) => ({
  // Composite Primary Key: A user can't join the same trip twice
  pk: primaryKey(t.userId, t.tripId),
}));

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  tripId: integer("trip_id").notNull().references(() => trips.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  description: text("description"),
  location: text("location"),
  category: text("category").default('activity'), // e.g. flight, hotel, food
  createdAt: timestamp("created_at").defaultNow().notNull(),
});


export const usersRelations = relations(users, ({ many }) => ({
  ownedTrips: many(trips),
  sharedTrips: many(participants),
}));

export const tripsRelations = relations(trips, ({ one, many }) => ({
  owner: one(users, {
    fields: [trips.userId],
    references: [users.id],
  }),
  carts: many(carts),
  participants: many(participants),
  events: many(events),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  trip: one(trips, {
    fields: [events.tripId],
    references: [trips.id],
  }),
}));

export const participantsRelations = relations(participants, ({ one }) => ({
  user: one(users, {
    fields: [participants.userId],
    references: [users.id],
  }),
  trip: one(trips, {
    fields: [participants.tripId],
    references: [trips.id],
  }),
}));