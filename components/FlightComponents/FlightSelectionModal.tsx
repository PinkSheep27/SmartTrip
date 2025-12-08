import React, { useState } from 'react';

interface FlightSelectionModalProps {
  flight: any; // The selected flight data passed from the parent
  onClose: () => void;
}

function formatDuration(durationString: string): string {
  // Regex to extract the number before 'H' (Hours)
  const hoursMatch = durationString.match(/(\d+)H/); 
  // Regex to extract the number before 'M' (Minutes)
  const minutesMatch = durationString.match(/(\d+)M/); 

  const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0;
  const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0;

  let formatted = '';
  if (hours > 0) {
    formatted += `${hours} hr`;
  }
  if (minutes > 0) {
    // Add a space if hours were added, then add minutes
    formatted += formatted.length > 0 ? ` ${minutes} min` : `${minutes} min`;
  }
  
  return formatted || 'Unknown duration';
}

// Class options with dummy price multipliers for now
const CLASS_OPTIONS = [
  { type: "ECONOMY", priceFactor: 1.0 },
  { type: "PREMIUM ECONOMY", priceFactor: 1.5 },
  { type: "BUSINESS", priceFactor: 2.5 },
  { type: "FIRST CLASS", priceFactor: 4.0 },
];

const FlightSelectionModal: React.FC<FlightSelectionModalProps> = ({ flight, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedClass, setSelectedClass] = useState(CLASS_OPTIONS[0]);

  // Calculate the price based on quantity and class factor
  const basePrice = parseFloat(flight.price);
  const totalTicketPrice = basePrice * selectedClass.priceFactor * quantity;

  // Placeholder for "seat map" functionality
  const renderSeatAvailability = () => (
    <div className="bg-gray-100 p-3 rounded-lg text-sm text-gray-700">
      <h4 className="font-semibold mb-2">Seat Availability (Placeholder)</h4>
      <p> Seatmap Under construction </p>
      <div className="flex gap-2 mt-2">
        <span className="bg-green-200 px-2 rounded">12 Available (Standard)</span>
        <span className="bg-yellow-200 px-2 rounded">4 Available (Exit Row)</span>
      </div>
    </div>
  );

  if (!flight) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pt-16">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} // Allows clicking outside to close
      />
      
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative z-10">
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-900 text-2xl"
        >&times;</button>
        
        <h2 className="text-3xl font-bold text-blue-600 mb-4 border-b pb-2">
          Confirm Your Selection
        </h2>
        
        {/* Flight Details */}
        <div className="mb-4 p-4 border rounded-lg bg-blue-50">
          <p className="text-xl font-semibold">{flight.airline} - {flight.departAirport} → {flight.arriveAirport}</p>
          <p className="text-lg">Duration: **{formatDuration(flight.duration)}**</p>
          <p className="text-lg">Departure: {flight.departureTime}</p>
          <p className="text-lg">Base Price: **${basePrice.toFixed(2)}**</p>
        </div>

        {/* Configuration Options */}
        <div className="space-y-6 mb-6">
          
          {/* Quantity Selector */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Number of Tickets</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value)))}
              className="p-2 border rounded-lg w-20 text-center"
            />
          </div>

          {/* Class Selector */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">Travel Class</label>
            <div className="flex gap-4 flex-wrap">
              {CLASS_OPTIONS.map((option) => (
                <button
                  key={option.type}
                  onClick={() => setSelectedClass(option)}
                  className={`p-3 rounded-lg border transition-colors text-sm ${
                    selectedClass.type === option.type
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {option.type} (+{((option.priceFactor - 1) * 100).toFixed(0)}%)
                </button>
              ))}
            </div>
          </div>
          
          {/* Seat Availability Placeholder */}
          {renderSeatAvailability()}
        </div>

        {/* Total Price & Checkout Button */}
        <div className="mt-4 border-t pt-4 flex justify-between items-center">
          <p className="text-2xl font-bold">Total Estimate: <span className="text-red-600">${totalTicketPrice.toFixed(2)}</span></p>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition">
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightSelectionModal;