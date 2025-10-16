import Navbar from "./Navbar";
import { useState } from "react";

export default function DiningPage() {
  const [formData, setFormData] = useState("");

  return (
    <div>
      <Navbar></Navbar>
      <div className="header">
        <h1>Discover Your Next Meal</h1>
        <p>Find the perfect dining experience tailored to your taste</p>
      </div>
      <form>
        <input
          placeholder="Enter Restaurant Name "
          className=""
          type="text"
        ></input>
      </form>
    </div>
  );
}
