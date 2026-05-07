import React from 'react';

export default function ManageTripPage() {
  // Mock Collaborators
  const collaborators = [
    { id: '1', name: 'Ivan R.', initials: 'IR', color: 'bg-blue-600' },
    { id: '2', name: 'German', initials: 'G', color: 'bg-emerald-600' },
    { id: '3', name: 'Anna', initials: 'A', color: 'bg-purple-600' },
    { id: '4', name: 'Freddie', initials: 'F', color: 'bg-amber-600' },
  ];

  // Categorized Mock Data
  const cart = {
    flights: [
      {
        id: 'f-1',
        airline: 'American Airlines',
        route: 'JFK ➔ MIA',
        time: 'Oct 15 • 08:30 AM - 11:45 AM',
        price: 250,
        addedBy: collaborators[2], // Anna
        status: 'Approved'
      }
    ],
    hotels: [
      {
        id: 'h-1',
        name: 'Oceanfront Resort & Spa',
        details: '3 Nights • 2 Queen Beds',
        dates: 'Oct 15 - Oct 18',
        price: 600,
        addedBy: collaborators[1], // German
        status: 'Awaiting Consensus'
      }
    ],
    experiences: [] // Left empty to show the empty state
  };

  const subtotal = 
    cart.flights.reduce((sum, item) => sum + item.price, 0) + 
    cart.hotels.reduce((sum, item) => sum + item.price, 0);
  
  const taxes = subtotal * 0.08;
  const total = subtotal + taxes;
  const perPerson = total / 4;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-gray-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Page Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Florida Vacation</h1>
            <p className="text-gray-500 font-medium flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              Oct 15 - Oct 22 • Miami, FL
            </p>
          </div>
          
          {/* Collaborator Quick-View */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 mr-2">Trip Members:</span>
            <div className="flex -space-x-2">
              {collaborators.map((user) => (
                <div key={user.id} className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold border-2 border-gray-50 shadow-sm ${user.color}`} title={user.name}>
                  {user.initials}
                </div>
              ))}
            </div>
            <button className="w-8 h-8 rounded-full border-2 border-dashed border-gray-300 text-gray-400 hover:text-blue-600 hover:border-blue-300 flex items-center justify-center transition-colors ml-1 bg-white">
              +
            </button>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Cart Contents */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Flights Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Flights
              </h2>
              <div className="space-y-3">
                {cart.flights.map(flight => (
                  <div key={flight.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 shrink-0">
                      ✈️
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{flight.route} <span className="text-sm font-normal text-gray-500 ml-2">{flight.airline}</span></h3>
                      <p className="text-sm text-gray-500 mt-1">{flight.time}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col items-end mr-4">
                         <span className="font-bold">${flight.price}</span>
                         <div className="flex items-center gap-1 mt-1 text-xs">
                           <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${flight.addedBy.color}`}>{flight.addedBy.initials}</div>
                           <span className="text-emerald-600 font-medium flex items-center gap-1"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg> {flight.status}</span>
                         </div>
                       </div>
                       <button className="text-gray-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Hotels Section */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                Stays
              </h2>
              <div className="space-y-3">
                {cart.hotels.map(hotel => (
                  <div key={hotel.id} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-sm transition-shadow">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg shrink-0 overflow-hidden">
                       <img src="https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80" alt="Hotel thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{hotel.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{hotel.details}</p>
                      <p className="text-xs text-gray-400 mt-1">{hotel.dates}</p>
                    </div>
                    <div className="flex items-center gap-3">
                       <div className="flex flex-col items-end mr-4">
                         <span className="font-bold">${hotel.price}</span>
                         <div className="flex items-center gap-1 mt-1 text-xs">
                           <div className={`w-4 h-4 rounded-full flex items-center justify-center text-white text-[8px] ${hotel.addedBy.color}`}>{hotel.addedBy.initials}</div>
                           <span className="text-amber-500 font-medium flex items-center gap-1"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> {hotel.status}</span>
                         </div>
                       </div>
                       <button className="text-gray-400 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Experiences - Empty State */}
            <section>
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Experiences & Dining
              </h2>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50">
                 <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                   🍽️
                 </div>
                 <h3 className="text-gray-900 font-medium mb-1">No plans yet!</h3>
                 <p className="text-gray-500 text-sm mb-4">Add restaurants, tours, or events to your itinerary.</p>
                 <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm">
                   Explore Miami
                 </button>
              </div>
            </section>

          </div>

          {/* Right Column: Sticky Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-bold mb-4 border-b border-gray-100 pb-4">Trip Summary</h3>
              
              <div className="space-y-3 mb-6 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Flights</span>
                  <span className="font-medium text-gray-900">${cart.flights.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Stays</span>
                  <span className="font-medium text-gray-900">${cart.hotels.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Experiences</span>
                  <span className="font-medium text-gray-900">$0.00</span>
                </div>
                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                  <span>Taxes & Fees</span>
                  <span className="font-medium text-gray-900">${taxes.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 mb-6">
                <div className="flex justify-between items-end mb-1">
                  <span className="font-bold text-gray-900 text-lg">Total</span>
                  <span className="font-bold text-gray-900 text-2xl">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-blue-600 bg-blue-50 p-2 rounded-lg mt-3">
                  <span className="font-medium">Split between 4</span>
                  <span className="font-bold">${perPerson.toFixed(2)} / pp</span>
                </div>
              </div>

              <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors text-center mb-3">
                Proceed to Checkout
              </button>
              <p className="text-xs text-center text-gray-400">You won't be charged yet. All collaborators must approve before final payment.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}