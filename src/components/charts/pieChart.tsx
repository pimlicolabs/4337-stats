"use client";

import * as React from "react";
import { Label, Pie, PieChart as RechartPieChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { capitalize } from "@/lib/utils";

type PieChartProps = {
  title: string;
  dataKey: string;
  nameKey: string;
  innerTitle: string;
  description: string;
  config: ChartConfig;
  data: any;
};

export function PieChart({
  title,
  innerTitle,
  description,
  config,
  data,
  dataKey,
  nameKey,
}: PieChartProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>{capitalize(title)}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={config}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RechartPieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={data.map((d: any) => ({
                ...d,
                fill: config[d[nameKey]]?.color,
              }))}
              dataKey={dataKey}
              nameKey={nameKey}
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-lg font-bold font-mono"
                        >
                          {innerTitle}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </RechartPieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
