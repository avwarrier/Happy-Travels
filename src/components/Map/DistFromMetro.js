import { Train } from "lucide-react"

export const AvgDistFromMetro = ({distance}) => {
    return (
    <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 h-20 w-36 flex flex-col items-center">
        <h2 className="font-semibold">Metro Station</h2>
        <div className="flex justify-center items-center gap-2 ">
            <Train className="w-4 h-4 text-indigo-400" />
            <h2 className="font-bold text-2xl">{parseFloat(distance).toFixed(1)}km</h2>
        </div>
    </div>
  );
}