import { useState, useEffect } from 'react'
import CalculatorForm from './components/CalculatorForm'
import ChartDisplay from './components/ChartDisplay'
import SummaryCard from './components/SummaryCard'
import { fetchCalculation, fetchMetadata } from './api'
import './App.css'

function App() {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currencySymbol, setCurrencySymbol] = useState('$');
    const [currentRate, setCurrentRate] = useState(1.0);
    const [plnRate, setPlnRate] = useState(null); // Initialize null to wait for fetch
    const [metadata, setMetadata] = useState({ currencies: {}, presets: [] });

    // Fetch Metadata on Load (Lifted from CalculatorForm)
    useEffect(() => {
        const loadMeta = async () => {
            try {
                const data = await fetchMetadata();
                if (data) {
                    setMetadata(data);
                    // Initialize rates
                    if (data.currencies['PLN']) {
                        setPlnRate(data.currencies['PLN'].rate);
                    }
                    if (data.currencies['USD']) {
                        // Default currency is USD
                        setCurrentRate(data.currencies['USD'].rate);
                    }
                }
            } catch (err) {
                console.error("Failed to load metadata", err);
            }
        };
        loadMeta();
    }, []);

    const handleCalculate = async (params) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchCalculation(params);
            setResults(data);
        } catch (err) {
            setError('Failed to connect to the calculation server. Please ensure the backend is running.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCurrencyChange = (currencyData, allRates) => {
        setCurrencySymbol(currencyData.symbol);
        setCurrentRate(currencyData.rate);
        // Fallback or update PLN if passed (though we have it in state now)
        if (allRates && allRates['PLN']) {
            setPlnRate(allRates['PLN'].rate);
        }
    };

    const displayExchangeRate = () => {
        if (!currentRate || !plnRate) return `Loading...`;

        const rate = plnRate / currentRate;

        // If converting PLN to PLN
        if (Math.abs(rate - 1.0) < 0.01) return '1 zł = 1.00 PLN';

        return `1 ${currencySymbol} = ${rate.toFixed(2)} PLN`;
    };

    useEffect(() => {
        handleCalculate({
            initial_investment: 1000,
            monthly_contribution: 100,
            rate: 7,
            years: 10
        });
    }, []);

    const finalResult = results.length > 0 ? results[results.length - 1] : null;

    const formatVal = (val) => val ? `${currencySymbol}${val.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : '-';

    const totalValue = finalResult?.total || 0;
    const safeWithdrawalAnnual = totalValue * 0.04;
    const safeWithdrawalMonthly = safeWithdrawalAnnual / 12;

    const millionIndex = results.findIndex(r => r.total >= 1000000);
    const yearsToMillion = millionIndex !== -1 ? results[millionIndex].year : 'Not reached';

    return (
        <div className="app-container">
            <header className="app-header">
                <h1>Compound Interest Calculator</h1>
                <p>Visualize your wealth growth over time</p>
            </header>

            {error && (
                <div className="error-banner">
                    {error}
                </div>
            )}

            {/* Main Grid Layout */}
            <main className="main-content">

                {/* Top Left: Controls */}
                <div className="layout-area area-controls">
                    <CalculatorForm
                        onCalculate={handleCalculate}
                        onCurrencyChange={handleCurrencyChange}
                        metadata={metadata} // Pass metadata down
                    />
                </div>

                {/* Top Right: KPIs */}
                <div className="layout-area area-kpi">
                    <div className="summary-cards">
                        <SummaryCard title="Total Value" value={formatVal(totalValue)} subtext="Future balance" />
                        <SummaryCard title="Total Invested" value={formatVal(finalResult?.invested)} subtext="Your contributions" />
                        <SummaryCard title="Total Interest" value={formatVal(finalResult?.interest)} subtext="Compound growth" />
                        <SummaryCard title="Exchange Rate" value={displayExchangeRate()} subtext="Vs Polish Zloty" />
                    </div>
                </div>

                {/* Middle: Graph */}
                <div className="layout-area area-graph">
                    <ChartDisplay data={results} symbol={currencySymbol} />
                </div>

                {/* Bottom: Retirement KPIs */}
                <div className="layout-area area-retirement">
                    <div className="kpi-section">
                        <div className="kpi-card">
                            <h4>Monthly Passive Income (4%)</h4>
                            <div className="kpi-value">{formatVal(safeWithdrawalMonthly)} / mo</div>
                        </div>
                        <div className="kpi-card">
                            <h4>Yearly Passive Income (4%)</h4>
                            <div className="kpi-value">{formatVal(safeWithdrawalAnnual)} / yr</div>
                        </div>
                        <div className="kpi-card">
                            <h4>Time to 1 Million</h4>
                            <div className="kpi-value">{typeof yearsToMillion === 'number' ? `${yearsToMillion} Years` : yearsToMillion}</div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    )
}

export default App
