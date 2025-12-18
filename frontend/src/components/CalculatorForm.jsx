import { useState, useEffect } from 'react';
import './CalculatorForm.css';

const CalculatorForm = ({ onCalculate, onCurrencyChange, metadata }) => {
    // metadata is now passed as prop
    const [currency, setCurrency] = useState('USD');
    const [formData, setFormData] = useState({
        initial_investment: 1000,
        monthly_contribution: 100,
        rate: 7,
        years: 10,
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (value === '') {
            setFormData((prev) => ({
                ...prev,
                [name]: ''
            }));
            return;
        }

        setFormData((prev) => ({
            ...prev,
            [name]: parseFloat(value)
        }));
    };

    const handleCurrencyChange = (e) => {
        const newCurrency = e.target.value;
        const oldRate = metadata.currencies[currency]?.rate || 1;
        const newRate = metadata.currencies[newCurrency]?.rate || 1;

        const factor = newRate / oldRate;

        setFormData(prev => ({
            ...prev,
            initial_investment: typeof prev.initial_investment === 'number' ? parseFloat((prev.initial_investment * factor).toFixed(2)) : prev.initial_investment,
            monthly_contribution: typeof prev.monthly_contribution === 'number' ? parseFloat((prev.monthly_contribution * factor).toFixed(2)) : prev.monthly_contribution
        }));

        setCurrency(newCurrency);
        if (onCurrencyChange) {
            // Pass both the selected currency object AND the full rates map
            onCurrencyChange(metadata.currencies[newCurrency], metadata.currencies);
        }
    };

    const handlePresetChange = (e) => {
        const presetName = e.target.value;
        if (presetName === 'custom') return;

        const preset = metadata.presets.find(p => p.name === presetName);
        if (preset) {
            setFormData(prev => ({
                ...prev,
                rate: preset.rate
            }));
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            const cleanData = {
                initial_investment: typeof formData.initial_investment === 'number' ? formData.initial_investment : 0,
                monthly_contribution: typeof formData.monthly_contribution === 'number' ? formData.monthly_contribution : 0,
                rate: typeof formData.rate === 'number' ? formData.rate : 0,
                years: typeof formData.years === 'number' ? formData.years : 1
            };
            onCalculate(cleanData);
        }, 500);
        return () => clearTimeout(timer);
    }, [formData, onCalculate]);

    const currentSymbol = metadata?.currencies?.[currency]?.symbol || '$';

    // Safe access in case metadata is still loading (empty object)
    const currencies = metadata?.currencies || {};
    const presets = metadata?.presets || [];

    return (
        <div className="calculator-form">
            <div className="settings-row">
                <div className="input-group">
                    <label htmlFor="currency">Currency</label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={handleCurrencyChange}
                        className="select-input"
                    >
                        {Object.keys(currencies).map(code => (
                            <option key={code} value={code}>{code} ({currencies[code].symbol})</option>
                        ))}
                    </select>
                </div>

                <div className="input-group">
                    <label htmlFor="preset">History Benchmark</label>
                    <select
                        id="preset"
                        onChange={handlePresetChange}
                        className="select-input"
                        defaultValue="custom"
                    >
                        <option value="custom">Custom Rate</option>
                        {presets.map(p => (
                            <option key={p.name} value={p.name}>{p.name} (~{p.rate}%)</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="input-group">
                <label htmlFor="initial_investment">Initial Investment ({currentSymbol})</label>
                <input
                    type="number"
                    id="initial_investment"
                    name="initial_investment"
                    value={formData.initial_investment}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label htmlFor="monthly_contribution">Monthly Contribution ({currentSymbol})</label>
                <input
                    type="number"
                    id="monthly_contribution"
                    name="monthly_contribution"
                    value={formData.monthly_contribution}
                    onChange={handleChange}
                />
            </div>

            <div className="input-group">
                <label htmlFor="rate">Expected Rate of Return (%)</label>
                <input
                    type="number"
                    id="rate"
                    name="rate"
                    value={formData.rate}
                    onChange={handleChange}
                    step="0.1"
                />
            </div>

            <div className="input-group">
                <label htmlFor="years">Time Period (Years)</label>
                <input
                    type="number"
                    id="years"
                    name="years"
                    value={formData.years}
                    onChange={handleChange}
                    min="1"
                    max="100"
                />
                <input
                    type="range"
                    id="years-range"
                    name="years"
                    min="1"
                    max="50"
                    value={formData.years}
                    onChange={handleChange}
                    className="range-input"
                />
            </div>
        </div>
    );
};

export default CalculatorForm;
