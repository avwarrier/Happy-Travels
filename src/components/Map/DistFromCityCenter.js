import { MapPin } from "lucide-react"

export const AvgDistFromCityCenter = ({distance}) => {
    return (
    <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 h-20 w-32 flex flex-col items-center">
        <h2 className="font-semibold">City Center</h2>
        <div className="flex justify-center items-center gap-2 ">
            <MapPin className="w-4 h-4 text-red-500" />
            <h2 className="font-bold text-2xl">{parseFloat(distance).toFixed(1)}km</h2>
        </div>
    </div>
  );
}