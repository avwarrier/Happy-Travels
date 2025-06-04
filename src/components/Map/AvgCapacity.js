import { Users} from "lucide-react"

export const AverageCapacity = ({avgCapacity}) => {
    return (
    <div className="p-2 border border-gray-200 rounded-lg shadow-sm bg-gray-50 h-20 w-fit flex flex-col items-center">
        <h2 className="font-semibold">Person Capacity</h2>
        <div className="flex justify-center items-center gap-2 ">
            <Users className="w-4 h-4 text-purple-500" />
            <h2 className="font-bold text-2xl">{parseFloat(avgCapacity).toFixed(1)}</h2>
        </div>
    </div>
  );
}