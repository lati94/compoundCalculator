from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List
from models import InvestmentParams, YearlyResult
import httpx
import asyncio
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ... (Existing Logic for Calculation and Metadata) ...

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

@app.get("/api/metadata") # Changed path to /api/metadata to avoid conflict if any, but consistent with VITE_API_URL=/api prefix logic
async def get_metadata():
    # Fetch real-time rates (Base USD)
    rates = DEFAULT_RATES.copy()
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.frankfurter.app/latest?from=USD&to=PLN,EUR,CHF")
            if response.status_code == 200:
                data = response.json()
                api_rates = data.get("rates", {})
                if "PLN" in api_rates: rates["PLN"] = api_rates["PLN"]
                if "EUR" in api_rates: rates["EUR"] = api_rates["EUR"]
                if "CHF" in api_rates: rates["CHF"] = api_rates["CHF"]
    except Exception as e:
        print(f"Failed to fetch live rates: {e}. Using defaults.")

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

@app.post("/api/calculate", response_model=List[YearlyResult]) # Changed prefix
def calculate(params: InvestmentParams):
    results = []
    monthly_rate = (params.rate / 100) / 12
    total_months = int(params.years * 12)
    current_balance = params.initial_investment
    total_invested = params.initial_investment
    
    results.append(YearlyResult(
        year=0,
        invested=round(total_invested, 2),
        interest=0.0,
        total=round(current_balance, 2)
    ))
    
    for month in range(1, total_months + 1):
        interest_gained = current_balance * monthly_rate
        current_balance += interest_gained
        current_balance += params.monthly_contribution
        total_invested += params.monthly_contribution
        
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

# Serve Static Files (Frontend)
# Ensure this is AFTER API routes so they take precedence
if os.path.exists("static"):
    app.mount("/", StaticFiles(directory="static", html=True), name="static")

# Catch-all for SPA routing (if using React Router, important, but here optional as we are single page mostly)
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    if os.path.exists("static/index.html"):
        return FileResponse("static/index.html")
    return {"detail": "Not Found"}
