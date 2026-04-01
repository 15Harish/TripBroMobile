// ─── MOCK ITINERARY ───────────────────────────────────────────────────────────
const getMockItinerary = (tripData) => {
  const { destination, startDate, endDate, budget, currency, groupSize } = tripData;
  const days = Math.max(1, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
  const dailyBudget = Math.round(budget / days);

  const dayPlans = Array.from({ length: days }, (_, i) => ({
    day: i + 1,
    date: new Date(new Date(startDate).getTime() + i * 86400000).toDateString(),
    theme: ['Arrival & Exploration', 'Culture & History', 'Nature & Adventure', 'Local Life & Food', 'Relaxation & Departure'][i % 5],
    weather: 'Sunny, 26°C — perfect travel weather',
    transportationForDay: 'Metro + walking (approx $8)',
    totalDayCost: dailyBudget,
    activities: [
      {
        id: `d${i+1}-a1`,
        time: '9:00 AM',
        name: `${destination} Old Town Walking Tour`,
        type: 'sightseeing',
        duration: '2 hours',
        cost: Math.round(dailyBudget * 0.1),
        description: `Explore the historic heart of ${destination} with a guided walking tour through narrow streets, iconic landmarks, and hidden gems locals love.`,
        location: `${destination} City Centre`,
        tips: 'Wear comfortable shoes and bring a water bottle. Morning is the best time to avoid crowds.',
        bookingRequired: false,
        category: 'attraction',
      },
      {
        id: `d${i+1}-a2`,
        time: '2:00 PM',
        name: `${destination} Central Museum`,
        type: 'culture',
        duration: '2.5 hours',
        cost: Math.round(dailyBudget * 0.08),
        description: `The premier museum showcasing ${destination}'s rich history, art, and cultural heritage across multiple floors of exhibits.`,
        location: `Museum District, ${destination}`,
        tips: 'Book tickets online to skip the queue. Audio guides available in English.',
        bookingRequired: true,
        category: 'attraction',
      },
      {
        id: `d${i+1}-a3`,
        time: '5:00 PM',
        name: 'Sunset Viewpoint',
        type: 'scenic',
        duration: '1 hour',
        cost: 0,
        description: `Watch the golden sunset from the most famous viewpoint in ${destination}. Bring your camera — this is the best photo spot in the city.`,
        location: `Hilltop Park, ${destination}`,
        tips: 'Arrive 30 minutes early to get a good spot. Free entry.',
        bookingRequired: false,
        category: 'activity',
      },
    ],
    meals: {
      breakfast: {
        name: 'Local Bakery & Café',
        cuisine: 'Local',
        cost: Math.round(dailyBudget * 0.05),
        location: `Near your hotel in ${destination}`,
      },
      lunch: {
        name: 'Street Food Market',
        cuisine: 'Local Street Food',
        cost: Math.round(dailyBudget * 0.1),
        location: `${destination} Central Market`,
      },
      dinner: {
        name: 'Rooftop Restaurant',
        cuisine: 'International & Local Fusion',
        cost: Math.round(dailyBudget * 0.15),
        location: `Downtown ${destination}`,
      },
    },
  }));

  return {
    overview: {
      destination,
      totalDays: days,
      estimatedCost: budget,
      currency: currency || 'USD',
      highlights: [
        `${days} days of curated experiences in ${destination}`,
        'Hand-picked local restaurants and hidden gems',
        'Balanced mix of culture, adventure, and relaxation',
        `Budget-optimized activities for ${groupSize} traveler(s)`,
        'Day-by-day schedule with exact timings',
      ],
      bestTimeToVisit: 'Spring (March–May) and Autumn (Sept–Nov) for best weather',
      weatherInfo: 'Expect warm days around 24–28°C. Pack light layers for evenings.',
      localTips: [
        'Learn 5 basic phrases in the local language — locals appreciate the effort',
        'Use public transport — it\'s cheap and covers all major attractions',
        'Carry small cash for street food and local markets',
        'Download offline maps before you leave your hotel',
        'Book popular restaurants at least a day in advance',
      ],
    },
    budget: {
      total: budget,
      breakdown: {
        accommodation: Math.round(budget * 0.35),
        food: Math.round(budget * 0.25),
        transport: Math.round(budget * 0.15),
        activities: Math.round(budget * 0.15),
        shopping: Math.round(budget * 0.07),
        misc: Math.round(budget * 0.03),
      },
      dailyAverage: dailyBudget,
      budgetTips: [
        'Eat where locals eat — half the price, twice the flavour',
        'Buy a multi-day transit pass to save on transport',
        'Visit museums on their free entry days (usually first Sunday of the month)',
        'Book accommodation with free breakfast to cut food costs',
        'Use ATMs at banks, not tourist areas, for better exchange rates',
      ],
    },
    accommodation: {
      recommended: {
        name: `${destination} Grand Hotel`,
        type: 'Hotel',
        pricePerNight: Math.round(budget * 0.35 / days),
        rating: 4.5,
        amenities: ['Free WiFi', 'Breakfast included', 'Air conditioning', '24h reception', 'Luggage storage', 'City views'],
        location: `Central ${destination}, walking distance to main attractions`,
        description: `A well-rated hotel in the heart of ${destination}, loved by travellers for its central location, clean rooms, and friendly staff. Perfect base for exploring the city.`,
        bookingUrl: 'https://www.booking.com',
      },
      alternatives: [
        {
          name: `${destination} Boutique Hostel`,
          type: 'Hostel',
          pricePerNight: Math.round(budget * 0.35 / days * 0.4),
          rating: 4.2,
          description: 'Great social atmosphere, private rooms available, rooftop terrace.',
        },
        {
          name: `${destination} Apartments`,
          type: 'Vacation Rental',
          pricePerNight: Math.round(budget * 0.35 / days * 0.85),
          rating: 4.4,
          description: 'Self-catering apartments with kitchen, ideal for longer stays.',
        },
      ],
    },
    days: dayPlans,
    transportation: {
      arrival: {
        type: 'Flight',
        from: 'Your departure city',
        estimatedCost: Math.round(budget * 0.1),
        tips: `Book flights 6–8 weeks in advance for best prices. ${destination} international airport is well connected.`,
      },
      local: [
        'Metro/Subway — fastest and cheapest for cross-city travel',
        'Bus network — covers areas the metro doesn\'t reach',
        'Taxi/Rideshare — for late nights or heavy luggage',
        `Walking — best way to discover ${destination}'s neighbourhoods`,
        'Bicycle rental — available city-wide, great for flat areas',
      ],
      departure: {
        type: 'Flight',
        estimatedCost: Math.round(budget * 0.1),
        tips: 'Allow 3 hours before departure. Pre-book airport transfer the day before.',
      },
    },
    emergencyInfo: {
      policeNumber: '112 (Universal Emergency)',
      ambulanceNumber: '112 (Universal Emergency)',
      touristHelpline: 'Check local tourism board website for specific number',
      nearestHospital: `${destination} General Hospital — ask hotel for exact directions`,
      embassyTip: 'Register your travel with your home country\'s embassy website before departure',
    },
    packingList: [
      'Passport + 2 photocopies',
      'Travel insurance documents',
      'Comfortable walking shoes',
      'Universal power adapter',
      'Portable phone charger/power bank',
      'Lightweight rain jacket',
      'Sunscreen SPF 50+',
      'Reusable water bottle',
      'Basic first aid kit',
      'Local currency (small notes)',
      'Unlocked phone or local SIM',
      'Offline maps downloaded',
    ],
    visaInfo: `Check visa requirements for ${destination} at least 4 weeks before travel. Many countries offer visa-on-arrival or e-visa options. Visit your government's official travel advisory website for the most current information.`,
    currencyTips: `Exchange money at banks or official exchange bureaus for the best rates. Avoid airport currency exchange. Notify your bank before travelling to avoid card blocks. Credit cards are widely accepted in ${destination} but always carry some local cash.`,
  };
};

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────
export const generateItinerary = async (tripData) => {
  // Always return mock data instantly
  await new Promise(r => setTimeout(r, 1500)); // Short delay for UI feel
  return getMockItinerary(tripData);
};

export const generateAlternativeActivities = async (destination, currentActivity, budget) => {
  return [
    { id: 'alt1', name: `${destination} Food Tour`, type: 'food', duration: '3 hours', cost: Math.round(budget * 0.3), description: 'A guided culinary tour through local markets and restaurants.', location: `${destination} Old Town`, tips: 'Come hungry! Includes 8–10 tastings.' },
    { id: 'alt2', name: 'Bicycle City Tour', type: 'activity', duration: '2 hours', cost: Math.round(budget * 0.2), description: 'Explore the city on two wheels with a knowledgeable local guide.', location: `${destination} Central Park`, tips: 'Helmets provided. Suitable for all fitness levels.' },
    { id: 'alt3', name: 'Photography Walk', type: 'culture', duration: '2 hours', cost: Math.round(budget * 0.1), description: 'Discover the most photogenic spots in the city.', location: `${destination} Art District`, tips: 'Golden hour (6–7pm) gives the best light.' },
  ];
};
