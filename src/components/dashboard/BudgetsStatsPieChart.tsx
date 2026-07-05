import {Pie, PieChart} from "recharts";
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from "@/components/ui/chart.tsx";

const chartConfig = {
    time: {
        label: "Time",
    }
} satisfies ChartConfig

export interface BudgetsPieChartData {
    budget: string,
    time: number,
    timeFormated: string,
    fill: string,
}

export interface BudgetsStatsPieChartProps {
    chartData: BudgetsPieChartData[] | undefined
}

export function BudgetsStatsPieChart({chartData}: BudgetsStatsPieChartProps) {
    return (
        <ChartContainer
            config={chartConfig}
            className="mx-auto max-h-[250px] pb-0 [&_.recharts-pie-label-text]:fill-foreground"
        >
            <PieChart>
                <ChartTooltip content={<ChartTooltipContent hideLabel formatter={(_value, _name, item) => {
                    const data = (item?.payload as { payload?: BudgetsPieChartData } | undefined)?.payload;
                    if (!data) return null;
                    return <div>
                        {data.budget}<br/>
                        {data.timeFormated}
                    </div>
                }}/>}/>
                <Pie data={chartData} dataKey="time" label={entry => entry.name} nameKey="budget"/>
            </PieChart>
        </ChartContainer>
    )
}
