/**
 * Serverless Function: Stock Price Tracker with Holiday Integration
 *
 * This function fetches real-time stock prices for major technology competitors
 * and US market holidays to provide context on how holidays affect trading.
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
 * US Stock Market Holidays (NYSE/NASDAQ)
 * These are the official market closure days
 */
const MARKET_HOLIDAY_NAMES = [
  "New Year's Day",
  "Martin Luther King Jr. Day",
  "Presidents' Day",
  "President's Day",
  "Good Friday",
  "Memorial Day",
  "Independence Day",
  "Juneteenth",
  "Labor Day",
  "Thanksgiving",
  "Christmas Day",
  "Christmas"
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
 * Fetches US holidays from API Ninjas
 * @param {string} apiKey - API Ninjas API key
 * @param {number} year - Year to fetch holidays for
 * @returns {Promise<Array>} Array of holiday objects
 */
async function fetchHolidays(apiKey, year) {
  const url = `https://api.api-ninjas.com/v1/holidays?country=US&year=${year}`;

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch holidays: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Filters holidays to only include US stock market holidays
 * @param {Array} holidays - All US holidays
 * @returns {Array} Market holidays only
 */
function filterMarketHolidays(holidays) {
  return holidays.filter(holiday =>
    MARKET_HOLIDAY_NAMES.some(marketHoliday =>
      holiday.name.toLowerCase().includes(marketHoliday.toLowerCase())
    )
  );
}

/**
 * Analyzes holiday impact on stock market
 * @param {Array} marketHolidays - Market holidays for the year
 * @returns {Object} Holiday analysis including today's status and upcoming holidays
 */
function analyzeHolidayImpact(marketHolidays) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if today is a market holiday
  const todayStr = today.toISOString().split('T')[0];
  const isTodayHoliday = marketHolidays.some(h => h.date === todayStr);
  const todayHoliday = marketHolidays.find(h => h.date === todayStr);

  // Find upcoming holidays (next 30 days)
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  const upcomingHolidays = marketHolidays
    .filter(h => {
      const holidayDate = new Date(h.date);
      return holidayDate > today && holidayDate <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
    .slice(0, 3); // Next 3 upcoming holidays

  // Check if market is in holiday season (increased volatility)
  const isHolidaySeason = today.getMonth() === 11 || today.getMonth() === 0; // December or January

  return {
    isTodayHoliday,
    todayHoliday: todayHoliday || null,
    upcomingHolidays,
    isHolidaySeason,
    marketStatus: isTodayHoliday ? 'CLOSED' : 'OPEN',
    holidayImpact: getHolidayImpactInfo(isTodayHoliday, upcomingHolidays.length > 0, isHolidaySeason)
  };
}

/**
 * Provides educational information about holiday impact on stocks
 * @param {boolean} isTodayHoliday - Whether today is a market holiday
 * @param {boolean} hasUpcomingHolidays - Whether there are upcoming holidays
 * @param {boolean} isHolidaySeason - Whether it's holiday season
 * @returns {Object} Educational information about holiday impact
 */
function getHolidayImpactInfo(isTodayHoliday, hasUpcomingHolidays, isHolidaySeason) {
  const impacts = [];

  if (isTodayHoliday) {
    impacts.push({
      type: 'MARKET_CLOSED',
      severity: 'high',
      message: 'Market is closed today. No trading activity.',
      tip: 'Stock prices shown are from the last trading day.'
    });
  }

  if (hasUpcomingHolidays) {
    impacts.push({
      type: 'PRE_HOLIDAY',
      severity: 'medium',
      message: 'Upcoming holiday may affect trading volume.',
      tip: 'Markets often experience reduced volume and increased volatility around holidays.'
    });
  }

  if (isHolidaySeason) {
    impacts.push({
      type: 'HOLIDAY_SEASON',
      severity: 'low',
      message: 'Holiday season typically brings lighter trading.',
      tip: 'December and early January often see the "Santa Claus Rally" but also lower liquidity.'
    });
  }

  // General holiday effects
  impacts.push({
    type: 'GENERAL',
    severity: 'info',
    message: 'How holidays affect stocks:',
    effects: [
      'Pre-holiday: Often bullish sentiment, reduced volume',
      'Post-holiday: Return to normal trading, potential volatility',
      'Long weekends: Extended market closures can lead to gap openings',
      'Year-end holidays: Tax-loss harvesting and portfolio rebalancing'
    ]
  });

  return impacts;
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
    const currentYear = new Date().getFullYear();

    // Fetch stocks and holidays concurrently for better performance
    const [stocks, holidays] = await Promise.all([
      // Fetch all stock prices
      Promise.all(COMPANIES.map(async (company) => {
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
      })),
      // Fetch holidays
      fetchHolidays(apiKey, currentYear).catch(error => {
        console.error('Error fetching holidays:', error.message);
        return []; // Return empty array if holiday fetch fails
      })
    ]);

    // Process holiday data
    const marketHolidays = filterMarketHolidays(holidays);
    const holidayAnalysis = analyzeHolidayImpact(marketHolidays);

    // Return formatted response with holiday information
    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stocks,
      // Holiday information
      holidays: {
        marketStatus: holidayAnalysis.marketStatus,
        isTodayHoliday: holidayAnalysis.isTodayHoliday,
        todayHoliday: holidayAnalysis.todayHoliday,
        upcomingHolidays: holidayAnalysis.upcomingHolidays,
        isHolidaySeason: holidayAnalysis.isHolidaySeason,
        impact: holidayAnalysis.holidayImpact,
        allMarketHolidays: marketHolidays.map(h => ({
          name: h.name,
          date: h.date,
          day: h.day_of_week
        }))
      },
      // Include metadata for monitoring
      metadata: {
        companiesTracked: COMPANIES.length,
        successfulFetches: stocks.filter(s => s.price !== null).length,
        failedFetches: stocks.filter(s => s.price === null).length,
        holidaysFound: marketHolidays.length
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
