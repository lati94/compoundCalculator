import './SummaryCard.css';

const SummaryCard = ({ title, value, subtext }) => {
    return (
        <div className="summary-card">
            <h3>{title}</h3>
            <div className="value">{value}</div>
            {subtext && <div className="subtext">{subtext}</div>}
        </div>
    );
};

export default SummaryCard;
