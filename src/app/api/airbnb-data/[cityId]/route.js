'use server'
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

export async function GET(request, { params }) {
  const { cityId } = params;

  const baseDataPath = path.join(process.cwd(), 'src', 'data');
  const weekdayFilePath = path.join(baseDataPath, `${cityId}_weekdays.csv`);
  const weekendFilePath = path.join(baseDataPath, `${cityId}_weekends.csv`);

  try {
    let weekdayData = [];
    if (fs.existsSync(weekdayFilePath)) {
      const weekdayFileContent = fs.readFileSync(weekdayFilePath, { encoding: 'utf-8' });
      weekdayData = parse(weekdayFileContent, { columns: true, skip_empty_lines: true, bom: true });
      console.log(`[API Route] Successfully read and parsed ${weekdayData.length} rows from ${weekdayFilePath}`);
    } else {
      console.warn(`[API Route] File NOT FOUND: ${weekdayFilePath}`);
    }

    let weekendData = [];
    if (fs.existsSync(weekendFilePath)) {
      const weekendFileContent = fs.readFileSync(weekendFilePath, { encoding: 'utf-8' });
      weekendData = parse(weekendFileContent, { columns: true, skip_empty_lines: true, bom: true });
      console.log(`[API Route] Successfully read and parsed ${weekendData.length} rows from ${weekendFilePath}`);
    } else {
      console.warn(`[API Route] File NOT FOUND: ${weekendFilePath}`);
    }

    if (weekdayData.length === 0 && weekendData.length === 0) {
      console.warn(`[API Route] No data content found for city: ${cityId} after checking paths. Responding with 404.`);
      return NextResponse.json({ message: `No data files found or files are empty for city: ${cityId}` }, { status: 404 });
    }

    // Helper to calculate average of a numeric field
    const average = (data, key) => {
    const validValues = data.map(row => parseFloat(row[key])).filter(v => !isNaN(v));
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return validValues.length ? sum / validValues.length : null;
    };

    const combinedData = [...weekdayData, ...weekendData];
    const avgCombinedCleanliness = average(combinedData, 'cleanliness_rating');

    const avgTotalCityCost = average(combinedData, 'realSum');
    const avgWeekdayCost = average(weekdayData, 'realSum');
    const avgWeekendCost = average(weekendData, 'realSum');
    const avgGuestSatisfaction = average(combinedData, 'guest_satisfaction_overall');
    const avgPersonCapacity = average(combinedData, 'person_capacity');
    const avgBedroomCapacity = average(combinedData, 'bedrooms');
    const avgDistanceFromMetroStation = average(combinedData, 'metro_dist');
    const avgDistanceFromCityCenter = average(combinedData, 'dist');

    // --- Room Type Distribution Calculations ---
    const roomTypeCounts = combinedData.reduce((acc, listing) => {
      const type = listing.room_type; // Get the room type from the current listing
      if (type) {
        acc[type] = (acc[type] || 0) + 1; // Increment count for this type, or initialize to 1
      }
      return acc;
    }, {});

    // Convert counts object into array of {label, value} objects for the donut chart
    const roomTypeDistributionData = Object.keys(roomTypeCounts).map(type => ({
      label: type, // Room type string
      value: roomTypeCounts[type] // Room type count
    }));

    const aggregatedData = {
    city: cityId,
    processed: true,
    avgCleanliness: {
        combined: avgCombinedCleanliness,
    },
    weekdayRows: weekdayData.length,
    weekendRows: weekendData.length,
    avgCost: {
      avgTotalCityCost: avgTotalCityCost,
      avgWeekdayCost: avgWeekdayCost,
      avgWeekendCost: avgWeekendCost,
    },
    guestSatisfaction: avgGuestSatisfaction,
    personCapacity: avgPersonCapacity,
    bedroomCapacity: avgBedroomCapacity,
    metroDist: avgDistanceFromMetroStation,
    cityCenterDist: avgDistanceFromCityCenter,
    roomTypeDistribution: roomTypeDistributionData,
    };

    // ---------------------------------------------------------
    console.log(`[API Route] Successfully processed data for ${cityId}. Responding with 200.`);
    return NextResponse.json(aggregatedData, { status: 200 });

  } catch (error) {
    console.error(`[API Route] Error processing data for city ${cityId}:`, error);
    return NextResponse.json({ message: 'Error processing data', error: error.message }, { status: 500 });
  }
}