import Papa from 'papaparse';

interface SheetData {
  tabName: string;
  data: any[];
}

// Function to fetch data from a specific sheet
async function fetchSingleSheet(spreadsheetId: string, sheetId: number, sheetName: string): Promise<SheetData> {
  const url = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${sheetId}`;
  
  try {
    const response = await fetch(url);
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          resolve({
            tabName: sheetName,
            data: results.data
          });
        },
        error: (error) => {
          reject(error);
        }
      });
    });
  } catch (error) {
    console.error(`Error fetching sheet ${sheetName}:`, error);
    throw error;
  }
}

// Main function to fetch all sheets
export async function fetchSpreadsheetData(): Promise<SheetData[]> {
  const SPREADSHEET_ID = '1LCo8QXF_aZzuM5IVSZ_HWAD0gctr2G2b7sH0CZY9Ty0';
  
  // Sheet information: [gid, name]
  // You need to manually specify each sheet's gid and name
  const sheets = [
    { id: 2141492415,  },  // First sheet has gid=0 by default
    { id: 1450520372, }, // Replace with actual gid
    { id: 536894899,  } ,
    { id: 449066995,  },
    { id: 1378651399,}  // Replace with actual gid
    // Replace with actual gid
    // Add more sheets as needed
  ];

  try {
    // Fetch all sheets in parallel
    const allSheetPromises = sheets.map(sheet => 
      fetchSingleSheet(SPREADSHEET_ID, sheet.id, sheet.name)
    );
    
    return await Promise.all(allSheetPromises);
  } catch (error) {
    console.error('Error fetching spreadsheet data:', error);
    throw error;
  }
}

// If you need a flattened version that combines all sheets
export async function fetchAllSpreadsheetDataFlattened(): Promise<any[]> {
  const sheetsData = await fetchSpreadsheetData();
  // Combine all data with a sheet identifier
  return sheetsData.flatMap(sheet => 
    sheet.data.map(row => ({
      ...row,
      _sheetName: sheet.tabName
    }))
  );
}