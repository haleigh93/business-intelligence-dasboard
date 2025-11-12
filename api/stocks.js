/**
 * Serverless Function: Stock Price Tracker
 *
 * This function fetches real-time stock prices for major technology competitors
 * from the API Ninjas Stock Price endpoint and returns formatted data for
 * business intelligence analysis.
 *
 * Environment Variables Required:
 * - API_KEY: Your API Ninjas API key
 */

// Companies to track with their ticker symbols and full names
const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' }
];

/**
 * Fetches stock price for a single ticker from API Ninjas
 * @param {string} ticker - Stock ticker symbol
 * @param {string} apiKey - API Ninjas API key
 * @returns {Promise<Object>} Stock price data
 */
async function fetchStockPrice(ticker, apiKey) {
  const url = `https://api.api-ninjas.com/v1/stockprice?ticker=${ticker}`;

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${ticker}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Main serverless function handler
 * Fetches stock prices for all tracked companies and returns formatted results
 */
export default async function handler(req, res) {
  // Enable CORS for frontend access
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'Method not allowed',
      message: 'This endpoint only accepts GET requests'
    });
  }

  // Validate API key is configured
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'Configuration error',
      message: 'API_KEY environment variable is not configured'
    });
  }

  try {
    // Fetch all stock prices concurrently for better performance
    const stockPromises = COMPANIES.map(async (company) => {
      try {
        const priceData = await fetchStockPrice(company.ticker, apiKey);

        return {
          ticker: company.ticker,
          companyName: company.name,
          price: priceData.price,
          // Include additional data if available from API
          previousClose: priceData.previous_close || null,
          change: priceData.price && priceData.previous_close
            ? priceData.price - priceData.previous_close
            : null,
          changePercent: priceData.price && priceData.previous_close
            ? ((priceData.price - priceData.previous_close) / priceData.previous_close * 100)
            : null
        };
      } catch (error) {
        // Return partial data with error flag if individual stock fetch fails
        console.error(`Error fetching ${company.ticker}:`, error.message);
        return {
          ticker: company.ticker,
          companyName: company.name,
          price: null,
          error: error.message
        };
      }
    });

    // Wait for all requests to complete
    const stocks = await Promise.all(stockPromises);

    // Return formatted response
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stocks,
      // Include metadata for monitoring
      metadata: {
        companiesTracked: COMPANIES.length,
        successfulFetches: stocks.filter(s => s.price !== null).length,
        failedFetches: stocks.filter(s => s.price === null).length
      }
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in stock API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching stock data',
      timestamp: new Date().toISOString()
    });
  }
}
