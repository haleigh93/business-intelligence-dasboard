/**
 * Serverless Function: Earnings Call Transcript Fetcher
 *
 * This function fetches earnings call transcripts for tracked companies
 * from the API Ninjas Earnings Transcript endpoint.
 *
 * Environment Variables Required:
 * - API_KEY: Your API Ninjas API key
 */

// Companies to track (matching stock dashboard)
const COMPANIES = [
  { ticker: 'AAPL', name: 'Apple Inc.' },
  { ticker: 'MSFT', name: 'Microsoft Corporation' },
  { ticker: 'GOOGL', name: 'Alphabet Inc. (Google)' },
  { ticker: 'META', name: 'Meta Platforms Inc.' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.' }
];

/**
 * Fetches earnings transcript for a specific company, year, and quarter
 * @param {string} ticker - Stock ticker symbol
 * @param {string} apiKey - API Ninjas API key
 * @param {number} year - Year (e.g., 2024)
 * @param {number} quarter - Quarter (1-4)
 * @returns {Promise<Object>} Earnings transcript data
 */
async function fetchEarningsTranscript(ticker, apiKey, year, quarter) {
  const url = `https://api.api-ninjas.com/v1/earningstranscript?ticker=${ticker}&year=${year}&quarter=${quarter}`;

  const response = await fetch(url, {
    headers: {
      'X-Api-Key': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${ticker} Q${quarter} ${year}: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Gets the most recent quarter based on current date
 * @returns {Object} Object with year and quarter
 */
function getMostRecentQuarter() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-12

  // Earnings are typically reported 1-2 months after quarter end
  // So we look back a bit to get the most likely available earnings
  let quarter;
  let year = currentYear;

  if (currentMonth >= 1 && currentMonth <= 3) {
    // Q1: Look for Q4 of previous year
    quarter = 4;
    year = currentYear - 1;
  } else if (currentMonth >= 4 && currentMonth <= 6) {
    // Q2: Look for Q1 of current year
    quarter = 1;
  } else if (currentMonth >= 7 && currentMonth <= 9) {
    // Q3: Look for Q2 of current year
    quarter = 2;
  } else {
    // Q4: Look for Q3 of current year
    quarter = 3;
  }

  return { year, quarter };
}

/**
 * Main serverless function handler
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
    // Get query parameters or use defaults
    const ticker = req.query.ticker?.toUpperCase();
    const yearParam = req.query.year;
    const quarterParam = req.query.quarter;

    // If specific ticker is requested, fetch only that one
    if (ticker) {
      const { year, quarter } = yearParam && quarterParam
        ? { year: parseInt(yearParam), quarter: parseInt(quarterParam) }
        : getMostRecentQuarter();

      try {
        const transcriptData = await fetchEarningsTranscript(ticker, apiKey, year, quarter);

        // Find company name
        const company = COMPANIES.find(c => c.ticker === ticker);

        return res.status(200).json({
          success: true,
          timestamp: new Date().toISOString(),
          data: {
            ...transcriptData,
            companyName: company ? company.name : ticker
          }
        });
      } catch (error) {
        console.error(`Error fetching ${ticker}:`, error.message);
        return res.status(404).json({
          success: false,
          error: 'Not found',
          message: `No earnings transcript found for ${ticker} Q${quarter} ${year}`,
          ticker,
          year,
          quarter
        });
      }
    }

    // Otherwise, return list of available companies with most recent quarter info
    const { year, quarter } = getMostRecentQuarter();

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      availableCompanies: COMPANIES,
      suggestedPeriod: {
        year,
        quarter,
        description: `Q${quarter} ${year}`
      },
      usage: {
        message: 'To fetch a specific transcript, use query parameters:',
        example: `/api/earnings?ticker=MSFT&year=2024&quarter=2`,
        parameters: {
          ticker: 'Stock ticker symbol (required)',
          year: 'Fiscal year (optional, defaults to most recent)',
          quarter: 'Quarter 1-4 (optional, defaults to most recent)'
        }
      }
    });

  } catch (error) {
    // Handle unexpected errors
    console.error('Unexpected error in earnings API:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: 'An unexpected error occurred while fetching earnings data',
      timestamp: new Date().toISOString()
    });
  }
}
