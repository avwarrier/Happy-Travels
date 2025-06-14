import { cityAvgData } from "./structures";

export function getCityMatch(weekday, price, cleanlinessValue, distance, superhostPreference, personCapacity, satisfactionScore, importance) {
    const cityScores = {};

    // City Matching Algorithm
    const cityData = cityAvgData[weekday ? 'weekdays' : 'weekends'];

    Object.keys(cityData).forEach(cityName => {
        let score = 0;
        const city = cityData[cityName];

        // Price Range
        if (city.price <= price) {
            score += importance.price;
        } else {
            score += ((604 - city.price) / (604 - price)) * importance.price;
        }


        // Cleanliness
        if (city.cleanliness >= cleanlinessValue) {
            score += importance.cleanliness;
        } else {
            score += (city.cleanliness / cleanlinessValue) * importance.cleanliness;
        }

        // Distance from City
        if (city.distance <= distance) {
            score += importance.metro;
        } else {
            score += ((3 - city.distance) / (3 - distance)) * importance.metro;
        }

        // Superhost
        if (superhostPreference == 'superhost_only') {
            score += (city.superhost_pct / 100) * importance.superhost
        }

        // Person Capacity
        if (city.capacity >= personCapacity) {
            score += ((6 - city.capacity) / (6 - personCapacity)) * importance.capacity;
        } else {
            score += (city.capacity / personCapacity) * importance.capacity;
        }

        // Guest Satisfaction
        if (city.satisfaction >= satisfactionScore) {
            score += importance.satisfaction;
        } else {
            score += (city.satisfaction / satisfactionScore) * importance.satisfaction;
        }

        cityScores[cityName] = score;
    });

    console.log(cityScores);


    let sumOfImportance = 0;
    Object.keys(importance).forEach(key => {
        console.log(key)
        if (key == "superhost") {
            if (superhostPreference == "superhost_only")
                sumOfImportance += importance[key]
        } else if (!(key == "roomType")) {
            sumOfImportance += importance[key];
        }
    })

    // Return top 3 cities by score
    const topCities = Object.entries(cityScores)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([city, score]) => {
            let temp = score / sumOfImportance;
            return { city, score: parseInt(temp * 100) }
        });

    return topCities;
}