// ...existing code...

const { fetchDataFromAllTabs } = require('../services/spreadsheetService');

// Update your existing function that gets prices
async function getPrices(req, res) {
  try {
    const credentials = {
      // Your Google API credentials
      // ...existing code...
    };
    
    const docId = process.env.GOOGLE_SHEET_ID; // Make sure this is defined in your environment
    
    // Use the new function to get data from all tabs
    const allTabsData = await fetchDataFromAllTabs(docId, credentials);
    
    // You can now work with data from all tabs
    // Return all data or process it further as needed
    res.status(200).json({
      success: true,
      data: allTabsData
    });
  } catch (error) {
    console.error('Error fetching prices:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch prices'
    });
  }
}

// ...existing code...

module.exports = {
  // ...existing code...
  getPrices,
};
