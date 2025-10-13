import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';

const marketData = [
  { crop: 'Grapes', today: 85, yesterday: 82, unit: '₹/kg' },
  { crop: 'Tomatoes', today: 30, yesterday: 35, unit: '₹/kg' },
  { crop: 'Onions', today: 22, yesterday: 22, unit: '₹/kg' },
  { crop: 'Potatoes', today: 18, yesterday: 17, unit: '₹/kg' },
];

const PriceChangeIndicator = ({ today, yesterday }: { today: number; yesterday: number }) => {
  const change = today - yesterday;
  if (change > 0) {
    return <span className="flex items-center justify-end text-primary"><ArrowUp className="h-4 w-4 mr-1" /> ₹{change}</span>;
  }
  if (change < 0) {
    return <span className="flex items-center justify-end text-destructive"><ArrowDown className="h-4 w-4 mr-1" /> ₹{Math.abs(change)}</span>;
  }
  return <span className="flex items-center justify-end text-muted-foreground"><Minus className="h-4 w-4 mr-1" /></span>;
};

export default function MarketPrices() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="font-headline text-xl">Market Linkage</CardTitle>
        <CardDescription>Real-time market prices for your crops.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-semibold">Crop</TableHead>
              <TableHead className="font-semibold text-right">Today</TableHead>
              <TableHead className="font-semibold text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {marketData.map((item) => (
              <TableRow key={item.crop}>
                <TableCell className="font-medium">{item.crop}</TableCell>
                <TableCell className="text-right font-semibold">{item.today} {item.unit}</TableCell>
                <TableCell className="text-right">
                  <PriceChangeIndicator today={item.today} yesterday={item.yesterday} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
