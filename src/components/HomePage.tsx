import React from 'react';
import Navbar from './Navbar';

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-6xl mx-auto mt-10 p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Welcome to SmartTrip
          </h1>
          <p className="text-gray-600 text-lg">
            Plan Smarter, Relax Better.
          </p>
        </div>
      </main>
    </div>
  );
};

export default HomePage;