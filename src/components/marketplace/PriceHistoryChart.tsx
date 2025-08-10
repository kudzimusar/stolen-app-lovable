import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, CartesianGrid } from 'recharts';

const data = [
  { month: 'Mar', price: 21999 },
  { month: 'Apr', price: 20999 },
  { month: 'May', price: 19999 },
  { month: 'Jun', price: 19499 },
  { month: 'Jul', price: 18999 },
];

export default function PriceHistoryChart() {
  return (
    <div className="w-full h-64">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis tickFormatter={(v) => `ZAR ${new Intl.NumberFormat('en-ZA').format(v)}`} />
          <ReTooltip formatter={(v) => `ZAR ${new Intl.NumberFormat('en-ZA').format(Number(v))}`} />
          <Line type="monotone" dataKey="price" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
