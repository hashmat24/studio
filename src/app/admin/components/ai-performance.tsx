'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';
import { useTranslation } from 'react-i18next';

const chartData = [
  { model: 'Pest Detection', accuracy: 92 },
  { model: 'Yield Forecast', accuracy: 85 },
  { model: 'Irrigation Advice', accuracy: 95 },
  { model: 'Fertilizer Advice', accuracy: 91 },
];

const chartConfig = {
  accuracy: {
    label: 'Accuracy',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;


export default function AiPerformance() {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline text-xl">{t('aiPerformance')}</CardTitle>
        <CardDescription>{t('aiPerformanceDesc')}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
            <BarChart accessibilityLayer data={chartData}>
                <CartesianGrid vertical={false} />
                <XAxis
                    dataKey="model"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => t(value)}
                />
                <YAxis
                    tickFormatter={(value) => `${value}%`}
                />
                <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dot" />}
                />
                <Bar dataKey="accuracy" fill="var(--color-accuracy)" radius={8} />
            </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
