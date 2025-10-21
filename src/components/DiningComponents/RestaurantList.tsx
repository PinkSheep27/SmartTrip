import { useState } from "react";
import RestaurantCard from "./RestaurantCard";
import type { RestaurantCardProps } from "./RestaurantCard";

interface RestaurantListProps {
  restaurants: Restaurant[];
}

//Setting type as the declared prop that has all requirements of one restaurant
type Restaurant = RestaurantCardProps;

export default function RestaurantList({ restaurants }: RestaurantListProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {restaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            name={restaurant.name}
            id={restaurant.id}
            cuisine={restaurant.cuisine}
            rating={restaurant.rating}
            price={restaurant.price}
            waitTime={restaurant.waitTime}
            tags={restaurant.tags}
          />
        ))}
      </div>
    </>
  );
}
