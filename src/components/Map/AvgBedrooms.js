import { House} from "lucide-react"

export const AverageBedrooms = ({avgRooms}) => {
    return (
    <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 h-20 w-full flex flex-col items-center">
        <h2 className="font-semibold">Avg Bedrooms</h2>
        <div className="flex justify-center items-center gap-2 ">
            <House className="w-4 h-4 text-orange-500" />
            <h2 className="font-bold text-2xl">{parseFloat(avgRooms).toFixed(1)}</h2>
        </div>
    </div>
  );
}