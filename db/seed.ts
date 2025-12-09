import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { users, trips, carts, cartItems, participants } from "./schema";

async function main() {
  // 3. Dynamically import 'db' here so it runs AFTER dotenv.config()
  const { db } = await import("@/lib/db");

  console.log("Seeding database...");

  // 1. Create Two Users (The Owner and The Friend)
  const [owner] = await db
    .insert(users)
    .values({
      email: "ivan@smarttrip.com",
      name: "Ivan (Owner)",
    })
    .returning();

  const [friend] = await db
    .insert(users)
    .values({
      email: "aaron@smarttrip.com",
      name: "Aaron (Friend)",
    })
    .returning();

  console.log(`Created users: ${owner.name} & ${friend.name}`);

  // 2. Create a Trip (Owned by Ivan)
  const [trip] = await db
    .insert(trips)
    .values({
      name: "Tech Summit in NYC",
      destination: "New York, NY",
      startDate: "2024-11-10",
      endDate: "2024-11-15",
      userId: owner.id,
    })
    .returning();

  console.log(`Created trip: ${trip.name}`);

  // 3. Add BOTH users to the Participants table
  await db.insert(participants).values([
    {
      userId: owner.id,
      tripId: trip.id,
      role: "owner",
    },
    {
      userId: friend.id,
      tripId: trip.id,
      role: "editor",
    },
  ]);

  console.log(`Linked users to trip`);

  // 4. Create a Cart for the trip
  const [cart] = await db
    .insert(carts)
    .values({
      tripId: trip.id,
    })
    .returning();

  // 5. Add items to the cart
  await db.insert(cartItems).values([
    {
      cartId: cart.id.toString(),
      category: "flight",
      externalId: "FL-123",
      data: {
        airline: "Delta",
        flightNumber: "DL404",
        departure: "SFO",
        arrival: "JFK",
        price: 450,
        departureTime: "2024-11-10T08:00:00Z",
      },
    },
    {
      cartId: cart.id.toString(),
      category: "hotel",
      externalId: "HT-999",
      data: {
        name: "The Plaza",
        checkIn: "2024-11-10",
        checkOut: "2024-11-15",
        price: 1200,
        rating: 5,
      },
    },
  ]);

  console.log("Database seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
