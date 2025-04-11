const { GoogleSpreadsheet } = require('google-spreadsheet');
// ...existing code...

// Replace the existing fetchData function with this one that fetches from all tabs
async function fetchDataFromAllTabs(docId, credentials) {
  try {
    const doc = new GoogleSpreadsheet(docId);
    
    // Authenticate with the Google Sheets API
    await doc.useServiceAccountAuth(credentials);
    
    // Load document properties and sheet info
    await doc.loadInfo();
    
    // Get all the tabs in the spreadsheet
    const allData = {};
    
    // Loop through all sheets and fetch data from each
    for (let i = 0; i < doc.sheetCount; i++) {
      const sheet = doc.sheetsByIndex[i];
      await sheet.loadCells();
      
      // Get sheet title to use as key in the returned data object
      const tabName = sheet.title;
      
      // Fetch rows from this sheet
      const rows = await sheet.getRows();
      
      // Process the rows (this will depend on your existing data structure)
      const processedData = rows.map(row => {
        // Map your row data according to your schema
        // Adjust this mapping based on your actual data structure
        return {
          // Add your properties here based on your data structure
          sku: row.sku,
          name: row.name,
          price: row.price,
          // Add any other fields you need
        };
      });
      
      // Store this sheet's data under its tab name
      allData[tabName] = processedData;
    }
    
    return allData;
  } catch (error) {
    console.error('Error fetching data from spreadsheet:', error);
    throw error;
  }
}

// Keep your existing fetchData function but mark it as deprecated
// ...existing code...

// Export the new function alongside any existing ones
module.exports = {
  // ...existing code...
  fetchDataFromAllTabs,
};
