import {formatSecondsToDuration} from "@/lib/dateUtils.ts";


interface ProgressCellProps {
    duration: number;
    maxDuration: number;
}

export function ProgressCell({duration, maxDuration}: ProgressCellProps) {
    const percentage = (duration / maxDuration) * 100;
    function color(percentage: number) {
        if (percentage > 100) {
            return "bg-red-100";
        } else if (percentage > 90) {
            return "bg-green-200";
        } else {
            return "bg-green-100";
        }
    }


    return (
        <div className="relative w-full h-full p-2">
            <div
                className={"absolute top-0 left-0 h-full " + color(percentage)}
                style={{
                    width: `${Math.min(percentage, 100)}%`,
                    height: "100%",
                }}
            />
            <span className="relative z-10">
                {formatSecondsToDuration(duration)}
            </span>
        </div>
    );
};
