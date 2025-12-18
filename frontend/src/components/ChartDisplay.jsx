import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';
import { useState } from 'react';
import './ChartDisplay.css';

// Helper for large numbers
const compactFormat = (value) => {
    return new Intl.NumberFormat('en-US', {
        notation: "compact",
        maximumFractionDigits: 1
    }).format(value);
};

const CustomTooltip = ({ active, payload, label, symbol }) => {
    if (active && payload && payload.length) {
        // If Stacked Bar, we might want to show total
        const total = payload.reduce((sum, entry) => sum + (entry.value || 0), 0);
        // Warning: payload sum logic depends on chart structure. 
        // For Stacked Bar: invested + interest = total. 
        // payload contains both if both bars are active.

        return (
            <div className="custom-tooltip">
                <p className="label">{`Year ${label}`}</p>
                {payload.map((entry, index) => (
                    <p key={index} style={{ color: entry.color }}>
                        {`${entry.name}: ${symbol}${entry.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
                    </p>
                ))}
                {payload.length > 1 && (
                    <p style={{ color: '#fff', borderTop: '1px solid #334155', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
                        Total: {symbol}{total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </p>
                )}
            </div>
        );
    }
    return null;
};

const ChartDisplay = ({ data, symbol = '$' }) => {
    const [chartType, setChartType] = useState('line'); // 'line' or 'bar'

    if (!data || data.length === 0) {
        return <div className="chart-placeholder">Calculated results will appear here</div>;
    }

    return (
        <div className="chart-container" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="chart-header" style={{ flex: '0 0 auto' }}>
                <h2>Growth Projection</h2>
                <div className="chart-toggles">
                    <button
                        className={chartType === 'line' ? 'active' : ''}
                        onClick={() => setChartType('line')}
                    >
                        Line
                    </button>
                    <button
                        className={chartType === 'bar' ? 'active' : ''}
                        onClick={() => setChartType('bar')}
                    >
                        Stacked Bar
                    </button>
                </div>
            </div>

            <div className="chart-wrapper" style={{ flex: '1 1 auto', minHeight: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                    {chartType === 'line' ? (
                        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis
                                stroke="#94a3b8"
                                tickFormatter={(val) => `${symbol}${compactFormat(val)}`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip symbol={symbol} />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="total"
                                stroke="#8b5cf6"
                                fillOpacity={1}
                                fill="url(#colorTotal)"
                                strokeWidth={3}
                                name="Total Value"
                                animationDuration={1500}
                            />
                            <Area
                                type="monotone"
                                dataKey="invested"
                                stroke="#6366f1"
                                fill="none"
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                name="Principal"
                            />
                        </AreaChart>
                    ) : (
                        <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
                            <XAxis dataKey="year" stroke="#94a3b8" />
                            <YAxis
                                stroke="#94a3b8"
                                tickFormatter={(val) => `${symbol}${compactFormat(val)}`}
                                width={60}
                            />
                            <Tooltip content={<CustomTooltip symbol={symbol} />} />
                            <Legend />
                            <Bar dataKey="invested" stackId="a" fill="#6366f1" name="Invested" animationDuration={1500} />
                            <Bar dataKey="interest" stackId="a" fill="#8b5cf6" name="Interest" animationDuration={1500} />
                        </BarChart>
                    )}
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ChartDisplay;
