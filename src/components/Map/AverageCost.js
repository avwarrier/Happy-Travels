export const AverageCost = ({avgCost, weekdayAvgCost, weekendAvgCost}) => {
    return (
    <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 h-44 w-36 flex flex-col items-center">
        <h2 className="font-semibold">Average Price</h2>
        <h2 className="text-green-600 font-bold text-2xl pb-4">${parseFloat(avgCost).toFixed(2)}</h2>
        
        <h2 className="font-semibold">Weekday Cost</h2>
        <h2 className="text-green-600 font-semibold">${parseFloat(weekdayAvgCost).toFixed(2)}</h2>

        <h2 className="font-semibold">Weekend Cost</h2>
        <h2 className="text-green-600 font-semibold">${parseFloat(weekendAvgCost).toFixed(2)}</h2>
    </div>
  );
}