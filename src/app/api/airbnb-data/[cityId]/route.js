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

    // ---------------------------------------------------------
    // Right now I am calculating cleanliness, should calculate all valiuable fields and display them
    // then add d3 visuals to them
    const avgWeekdayCleanliness = average(weekdayData, 'cleanliness_rating');
    const avgWeekendCleanliness = average(weekendData, 'cleanliness_rating');

    const combinedData = [...weekdayData, ...weekendData];
    const avgCombinedCleanliness = average(combinedData, 'cleanliness_rating');

    // --- TODO: AGGREGATE AND PROCESS THE DATA HERE ---
    const aggregatedData = {
    city: cityId,
    processed: true,
    avgCleanliness: {
        weekday: avgWeekdayCleanliness,
        weekend: avgWeekendCleanliness,
        combined: avgCombinedCleanliness,
    },
    weekdayRows: weekdayData.length,
    weekendRows: weekendData.length
    };

    // ---------------------------------------------------------
    console.log(`[API Route] Successfully processed data for ${cityId}. Responding with 200.`);
    return NextResponse.json(aggregatedData, { status: 200 });

  } catch (error) {
    console.error(`[API Route] Error processing data for city ${cityId}:`, error);
    return NextResponse.json({ message: 'Error processing data', error: error.message }, { status: 500 });
  }
}