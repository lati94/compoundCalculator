from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
from models import InvestmentParams, YearlyResult
import httpx
import asyncio

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development convenience
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Compound Interest Calculator API"}

# Fallback rates in case API fails
DEFAULT_RATES = {
    "USD": 1.0,
    "PLN": 3.95,
    "EUR": 0.92,
    "CHF": 0.88
}

SYMBOLS = {
    "USD": "$",
    "PLN": "zł",
    "EUR": "€",
    "CHF": "₣"
}

@app.get("/metadata")
async def get_metadata():
    # Fetch real-time rates (Base USD)
    rates = DEFAULT_RATES.copy()
    try:
        # Frankurter API is free and doesn't require key. Base is EUR by default, so we ask for USD base if possible or convert.
        # Frankfurter supports 'from' parameter.
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.frankfurter.app/latest?from=USD&to=PLN,EUR,CHF")
            if response.status_code == 200:
                data = response.json()
                api_rates = data.get("rates", {})
                # Update our rates map. Base is USD=1.
                if "PLN" in api_rates: rates["PLN"] = api_rates["PLN"]
                if "EUR" in api_rates: rates["EUR"] = api_rates["EUR"]
                if "CHF" in api_rates: rates["CHF"] = api_rates["CHF"]
    except Exception as e:
        print(f"Failed to fetch live rates: {e}. Using defaults.")

    # Construct response
    currencies = {}
    for code, rate in rates.items():
        currencies[code] = {"symbol": SYMBOLS.get(code, "$"), "rate": rate}

    return {
        "currencies": currencies,
        "presets": [
            {"name": "S&P 500 (Historical)", "rate": 10.5},
            {"name": "Global Equities (MSCI World)", "rate": 8.5},
            {"name": "Gold", "rate": 5.0},
            {"name": "Bitcoin (High Volatility)", "rate": 15.0},
            {"name": "Conservative Bonds", "rate": 3.5},
            {"name": "Custom", "rate": 0.0}
        ]
    }

@app.post("/calculate", response_model=List[YearlyResult])
def calculate(params: InvestmentParams):
    results = []
    
    # Financial constants
    # Rate is annual percentage
    monthly_rate = (params.rate / 100) / 12
    total_months = int(params.years * 12)
    
    current_balance = params.initial_investment
    total_invested = params.initial_investment
    
    # Initial point (Year 0)
    results.append(YearlyResult(
        year=0,
        invested=round(total_invested, 2),
        interest=0.0,
        total=round(current_balance, 2)
    ))
    
    for month in range(1, total_months + 1):
        # Accrue interest first (assuming balance held for the month)
        interest_gained = current_balance * monthly_rate
        current_balance += interest_gained
        
        # Add monthly contribution at end of month
        current_balance += params.monthly_contribution
        total_invested += params.monthly_contribution
        
        # Capture data at the end of each year
        if month % 12 == 0:
            year = month // 12
            total_interest = current_balance - total_invested
            results.append(YearlyResult(
                year=year,
                invested=round(total_invested, 2),
                interest=round(total_interest, 2),
                total=round(current_balance, 2)
            ))
            
    return results
