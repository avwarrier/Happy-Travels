import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3'; // For CSV parsing

const cities = [
    'amsterdam', 'athens', 'barcelona', 'berlin', 'budapest',
    'lisbon', 'london', 'paris', 'rome', 'vienna'
];

const WeekdayWeekendViz = ({ userFocusOnWeekday }) => {
    const [priceDifference, setPriceDifference] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dataSummary, setDataSummary] = useState({ avgWeekday: 0, avgWeekend: 0 });
    const [insight, setInsight] = useState({ text: "", amount: "", comparison: "" });
    const d3Container = useRef(null); // Ref for the D3 chart container

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            let totalWeekdayPrice = 0;
            let weekdayEntryCount = 0;
            let totalWeekendPrice = 0;
            let weekendEntryCount = 0;

            try {
                for (const city of cities) {
                    // Fetch and process weekday data
                    try {
                        const weekdayResponse = await fetch(`/data/${city}_weekdays.csv`);
                        if (!weekdayResponse.ok) {
                            console.warn(`Skipping weekday data for ${city}: ${weekdayResponse.statusText}`);
                            continue; 
                        }
                        const weekdayText = await weekdayResponse.text();
                        const weekdayData = d3.csvParse(weekdayText);
                        weekdayData.forEach(d => {
                            const price = parseFloat(d.realSum); // Ensure 'realSum' is your price column
                            if (!isNaN(price)) {
                                totalWeekdayPrice += price;
                                weekdayEntryCount++;
                            }
                        });
                    } catch (e) {
                        console.warn(`Error processing weekday data for ${city}:`, e);
                    }

                    // Fetch and process weekend data
                    try {
                        const weekendResponse = await fetch(`/data/${city}_weekends.csv`);
                         if (!weekendResponse.ok) {
                            console.warn(`Skipping weekend data for ${city}: ${weekendResponse.statusText}`);
                            continue; 
                        }
                        const weekendText = await weekendResponse.text();
                        const weekendData = d3.csvParse(weekendText);
                        weekendData.forEach(d => {
                            const price = parseFloat(d.realSum); // Ensure 'realSum' is your price column
                            if (!isNaN(price)) {
                                totalWeekendPrice += price;
                                weekendEntryCount++;
                            }
                        });
                    } catch (e) {
                        console.warn(`Error processing weekend data for ${city}:`, e);
                    }
                }

                if (weekdayEntryCount > 0 && weekendEntryCount > 0) {
                    const avgWeekday = totalWeekdayPrice / weekdayEntryCount;
                    const avgWeekend = totalWeekendPrice / weekendEntryCount;
                    setDataSummary({ avgWeekday, avgWeekend });

                    // Determine insight based on userFocusOnWeekday
                    let diff, baseText, comparisonTextPart;
                    if (userFocusOnWeekday) { // User focused on Weekday
                        diff = avgWeekday - avgWeekend;
                        baseText = "Weekday nights average";
                        comparisonTextPart = "than weekends.";
                    } else { // User focused on Weekend
                        diff = avgWeekend - avgWeekday;
                        baseText = "Weekend nights average";
                        comparisonTextPart = "than weekdays.";
                    }

                    const absDiff = Math.abs(diff);
                    let comparisonWord = "about the same price as";
                    let amountText = "";

                    if (absDiff > 0.005) { // Check for non-negligible difference
                        amountText = `€${absDiff.toFixed(2)}`;
                        if (diff > 0) {
                            comparisonWord = "higher";
                        } else {
                            comparisonWord = "lower";
                        }
                        comparisonTextPart = `${comparisonWord} ${comparisonTextPart}`;
                    } else {
                         comparisonTextPart = `${comparisonWord} ${ userFocusOnWeekday ? "weekends" : "weekdays"}.`;
                    }
                    
                    setInsight({
                        text: baseText,
                        amount: amountText,
                        comparison: comparisonTextPart
                    });

                } else {
                    throw new Error("Not enough data from CSV files to calculate price difference.");
                }

            } catch (err) {
                console.error("Error in fetchData:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [userFocusOnWeekday]);

    // useEffect for D3 chart rendering
    useEffect(() => {
        if (dataSummary.avgWeekday > 0 && dataSummary.avgWeekend > 0 && d3Container.current && !loading && !error) {
            const data = [
                { type: 'Weekday', value: dataSummary.avgWeekday },
                { type: 'Weekend', value: dataSummary.avgWeekend }
            ];

            const margin = { top: 30, right: 30, bottom: 70, left: 60 };
            const width = 460 - margin.left - margin.right;
            const height = 300 - margin.top - margin.bottom;

            // Clear previous SVG
            d3.select(d3Container.current).selectAll("*").remove();

            const svg = d3.select(d3Container.current)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", `translate(${margin.left},${margin.top})`);

            // X axis
            const x = d3.scaleBand()
                .range([0, width])
                .domain(data.map(d => d.type))
                .padding(0.3); // Increased padding for better separation

            svg.append("g")
                .attr("transform", `translate(0,${height})`)
                .call(d3.axisBottom(x))
                .selectAll("text")
                .style("text-anchor", "middle")
                .style("font-size", "12px");

            // Y axis
            const yMax = d3.max(data, d => d.value);
            const y = d3.scaleLinear()
                .domain([0, yMax + (yMax * 0.1)]) // Add 10% padding to y-axis
                .range([height, 0]);

            svg.append("g")
                .call(d3.axisLeft(y).ticks(5).tickFormat(d => `€${d.toFixed(0)}`)) // Suggest 5 ticks
                .selectAll("text")
                .style("font-size", "12px");

            // Bars
            svg.selectAll("bars")
                .data(data)
                .enter()
                .append("rect")
                .attr("x", d => x(d.type))
                .attr("y", d => y(d.value))
                .attr("width", x.bandwidth())
                .attr("height", d => height - y(d.value))
                .attr("fill", (d) => d.type === 'Weekday' ? "#E51D51" : "#D90865"); // Airbnb & Linear pinks

            // Bar labels
            svg.selectAll(".bar-label")
                .data(data)
                .enter()
                .append("text")
                .attr("class", "bar-label")
                .attr("x", d => x(d.type) + x.bandwidth() / 2)
                .attr("y", d => y(d.value) - 5) // Position above the bar
                .attr("text-anchor", "middle")
                .style("font-size", "12px")
                .style("fill", "black")
                .text(d => `€${d.value.toFixed(2)}`);
            
            // Y-axis Label
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 0 - margin.left + 15)
                .attr("x",0 - (height / 2))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("font-size", "14px")
                .text("Average Price (€)");

        }
    }, [dataSummary, loading, error]); // Rerun when dataSummary, loading, or error changes

    if (loading) {
        return <p className="text-center text-gray-500 p-4">Loading insight and visualization data...</p>;
    }

    if (error) {
        return <p className="text-center text-red-500 p-4">Error: {error}</p>;
    }

    if (!insight.text) {
        return <p className="text-center text-gray-500 p-4">Could not calculate price difference insights.</p>;
    }

    return (
        <div className="text-center p-6 w-full">
            <p className="text-lg font-semibold mb-2" style={{ color: '#E51D51' }}>
                Insight
            </p>
            <p className="text-2xl md:text-3xl text-gray-800 mt-4">
                {insight.text}
            </p>
            {insight.amount && (
                 <p className="text-3xl md:text-4xl font-bold my-1" style={{ color: '#D90865' }}>
                    {insight.amount}
                </p>
            )}
            <p className="text-2xl md:text-3xl text-gray-800">
                {insight.comparison}
            </p>
            <div className="mt-6 text-sm text-gray-600">
                (Average weekday price: €{dataSummary.avgWeekday.toFixed(2)}, Average weekend price: €{dataSummary.avgWeekend.toFixed(2)})
            </div>
            {/* D3 Chart Container */}
            <div ref={d3Container} className="mt-8 w-full flex items-center justify-center">
                {/* D3 chart will be rendered here */}
            </div>
        </div>
    );
};

export default WeekdayWeekendViz; 