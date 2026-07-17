import json

def get_weather(location: str) -> str:
    """
    Get the current weather for a specific location.
    
    Args:
        location: The city or region name (e.g. 'Hà Nội', 'New York')
        
    Returns:
        JSON string containing weather data
    """
    # Mock return data
    data = {
        "location": location,
        "temperature_celsius": 28,
        "condition": "Sunny",
        "humidity": "65%",
        "wind_speed": "12 km/h"
    }
    return json.dumps(data, ensure_ascii=False)

def get_stock_price(symbol: str) -> str:
    """
    Get the current stock price for a given ticker symbol.
    
    Args:
        symbol: The stock ticker symbol (e.g. 'AAPL', 'TSLA', 'VIC')
        
    Returns:
        JSON string containing stock price data
    """
    prices = {
        "AAPL": 150.25,
        "TSLA": 200.50,
        "VIC": 42.00
    }
    price = prices.get(symbol.upper(), 100.00)
    
    data = {
        "symbol": symbol.upper(),
        "price_usd": price,
        "trend": "+2.5%"
    }
    return json.dumps(data, ensure_ascii=False)

def query_internal_database(table_name: str, query: str) -> str:
    """
    Query the internal vector database for RAG retrieval.
    
    Args:
        table_name: The namespace or table to search (e.g. 'documents', 'policies')
        query: The search query
        
    Returns:
        String containing relevant chunks from the database
    """
    return f"Tìm thấy 3 tài liệu trong {table_name} liên quan tới '{query}':\n1. Quy định công ty 2024\n2. Báo cáo tài chính Q1\n3. Hướng dẫn sử dụng hệ thống."


