import { CONFIG } from '../constants/config';

const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${CONFIG.GEMINI_API_KEY}`;

export const generateItinerary = async (tripData) => {
  const {
    destination,
    startDate,
    endDate,
    budget,
    currency,
    groupSize,
    travelStyle,
    accommodationType,
    dietaryRestrictions,
    interests,
    accessibility,
  } = tripData;

  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));

  const prompt = `Create a detailed ${days}-day travel itinerary for ${destination}.

Travel Details:
- Dates: ${startDate} to ${endDate} (${days} days)
- Total Budget: ${currency} ${budget}
- Group Size: ${groupSize} person(s)
- Travel Style: ${travelStyle.join(', ')}
- Accommodation Type: ${accommodationType}
- Dietary Restrictions: ${dietaryRestrictions.join(', ') || 'None'}
- Special Interests: ${interests || 'General sightseeing'}
- Accessibility Needs: ${accessibility || 'None'}

Please generate a comprehensive JSON response with the following exact structure:
{
  "overview": {
    "destination": "string",
    "totalDays": number,
    "estimatedCost": number,
    "currency": "string",
    "highlights": ["string"],
    "bestTimeToVisit": "string",
    "weatherInfo": "string",
    "localTips": ["string"]
  },
  "budget": {
    "total": number,
    "breakdown": {
      "accommodation": number,
      "food": number,
      "transport": number,
      "activities": number,
      "shopping": number,
      "misc": number
    },
    "dailyAverage": number,
    "budgetTips": ["string"]
  },
  "accommodation": {
    "recommended": {
      "name": "string",
      "type": "string",
      "pricePerNight": number,
      "rating": number,
      "amenities": ["string"],
      "location": "string",
      "description": "string",
      "bookingUrl": "string"
    },
    "alternatives": [
      {
        "name": "string",
        "type": "string",
        "pricePerNight": number,
        "rating": number,
        "description": "string"
      }
    ]
  },
  "days": [
    {
      "day": number,
      "date": "string",
      "theme": "string",
      "weather": "string",
      "activities": [
        {
          "id": "string",
          "time": "string",
          "name": "string",
          "type": "string",
          "duration": "string",
          "cost": number,
          "description": "string",
          "location": "string",
          "tips": "string",
          "bookingRequired": boolean,
          "category": "attraction|restaurant|transport|activity"
        }
      ],
      "meals": {
        "breakfast": { "name": "string", "cuisine": "string", "cost": number, "location": "string" },
        "lunch": { "name": "string", "cuisine": "string", "cost": number, "location": "string" },
        "dinner": { "name": "string", "cuisine": "string", "cost": number, "location": "string" }
      },
      "totalDayCost": number,
      "transportationForDay": "string"
    }
  ],
  "transportation": {
    "arrival": {
      "type": "string",
      "from": "string",
      "estimatedCost": number,
      "tips": "string"
    },
    "local": ["string"],
    "departure": {
      "type": "string",
      "estimatedCost": number,
      "tips": "string"
    }
  },
  "emergencyInfo": {
    "policeNumber": "string",
    "ambulanceNumber": "string",
    "touristHelpline": "string",
    "nearestHospital": "string",
    "embassyTip": "string"
  },
  "packingList": ["string"],
  "visaInfo": "string",
  "currencyTips": "string"
}

Make the itinerary realistic, specific to ${destination}, and within the budget of ${currency} ${budget}. Include real place names, restaurants, and attractions. Respond ONLY with the JSON object, no additional text.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
        },
      }),
    });

    const data = await response.json();

    if (data.error) throw new Error(data.error.message);

    const text = data.candidates[0].content.parts[0].text;
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};

export const generateAlternativeActivities = async (destination, currentActivity, budget) => {
  const prompt = `Suggest 3 alternative activities for "${currentActivity}" in ${destination} within a budget of $${budget}.
  
  Return JSON array:
  [
    {
      "id": "string",
      "name": "string",
      "type": "string",
      "duration": "string",
      "cost": number,
      "description": "string",
      "location": "string",
      "tips": "string"
    }
  ]
  
  Respond ONLY with JSON array.`;

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.8, maxOutputTokens: 1024 },
      }),
    });

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const cleanJson = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Error generating alternatives:', error);
    return [];
  }
};
