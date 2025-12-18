from pydantic import BaseModel

class InvestmentParams(BaseModel):
    initial_investment: float
    monthly_contribution: float
    rate: float
    years: int

class YearlyResult(BaseModel):
    year: int
    invested: float
    interest: float
    total: float
