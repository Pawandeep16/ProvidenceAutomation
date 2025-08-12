import { google } from 'googleapis';

interface OrderRow {
  orderNumber: string;
  [key: string]: any;
}

export class GoogleSheetsService {
  public sheets: any;
  
 constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'], // Changed to allow read and write
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }
  
  extractSpreadsheetId(url: string): string {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL format');
    }
    return match[1];
  }
  
  parseDateString(dateStr: string): Date | null {
    // Handle formats like "08/09", "8/9", "12/25", etc.
    const currentYear = new Date().getFullYear();
    
    // Try MM/DD or M/D format
    const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (match) {
      const month = parseInt(match[1], 10);
      const day = parseInt(match[2], 10);
      
      if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
        return new Date(currentYear, month - 1, day);
      }
    }
    
    return null;
  }
  
  async getLatestDateSheet(spreadsheetId: string): Promise<string> {
    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });
      
      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error('No sheets found in the spreadsheet');
      }
      
      let latestSheet = '';
      let latestDate: Date | null = null;
      
      for (const sheet of sheets) {
        const title = sheet.properties?.title;
        if (!title) continue;
        
        const parsedDate = this.parseDateString(title);
        if (parsedDate && (!latestDate || parsedDate > latestDate)) {
          latestDate = parsedDate;
          latestSheet = title;
        }
      }
      
      if (!latestSheet) {
        // If no date sheets found, use the first sheet
        latestSheet = sheets[0].properties?.title || 'Sheet1';
      }
      
      return latestSheet;
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw new Error('Failed to access Google Sheet. Please check permissions and URL.');
    }
  }
  
  async getOrderNumbers(spreadsheetId: string, sheetName: string): Promise<OrderRow[]> {
    try {
      // Get all data from the sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`, // Get all columns
      });
      
      const rows = response.data.values;
      if (!rows || rows.length === 0) {
        return [];
      }
      
      // Find the column that contains order numbers
      // Look for common headers like "Order", "Order Number", "Order ID", etc.
      const headerRow = rows[0];
      const orderColumnIndex = this.findOrderColumn(headerRow);
      
      if (orderColumnIndex === -1) {
        throw new Error('Could not find order number column. Expected headers like "Order", "Order Number", or "Order ID"');
      }
      
      const orders: OrderRow[] = [];
      
      // Process data rows (skip header)
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const orderNumber = row[orderColumnIndex]?.toString().trim();
        
        if (orderNumber) {
          // Create order object with all row data
          const orderData: OrderRow = { orderNumber };
          
          // Add other column data using headers as keys
          for (let j = 0; j < headerRow.length; j++) {
            if (j !== orderColumnIndex && row[j]) {
              const header = headerRow[j]?.toString().toLowerCase().replace(/\s+/g, '_');
              orderData[header] = row[j];
            }
          }
          
          orders.push(orderData);
        }
      }
      
      return orders;
    } catch (error) {
      console.error('Error reading sheet data:', error);
      throw new Error('Failed to read order data from the sheet');
    }
  }
  
  private findOrderColumn(headers: any[]): number {
    const orderHeaders = [
      'order',
      'order number',
      'order_number',
      'ordernumber',
      'order id',
      'order_id',
      'orderid',
    ];
    
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i]?.toString().toLowerCase().trim();
      if (orderHeaders.includes(header)) {
        return i;
      }
    }
    
    return -1;
  }
  async processSheet(googleSheetUrl: string): Promise<OrderRow[]> {
    const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);

    console.log('=== PROCESSING GOOGLE SHEET ===');
    console.log('Sheet URL:', googleSheetUrl);
    console.log('Spreadsheet ID:', spreadsheetId);

    // Get the first sheet
    const response = await this.sheets.spreadsheets.get({
      spreadsheetId,
      fields: 'sheets.properties.title',
    });

    const sheets = response.data.sheets;
    if (!sheets || sheets.length === 0) {
      throw new Error('No sheets found in the spreadsheet');
    }

    const sheetName = sheets[0].properties?.title || 'Sheet1';
    console.log('Using sheet:', sheetName);

    // Get all data from the sheet
    const dataResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:M`, // A to M covers all columns shown in the image
    });

    const rows = dataResponse.data.values;
    if (!rows || rows.length === 0) {
      return [];
    }

    console.log(`Found ${rows.length} total rows (including header)`);

    // Process the data - header is in row 0
    const headerRow = rows[0];
    console.log('Headers:', headerRow);

    // Process orders based on the sheet structure from the image
    const orders: OrderRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const orderNumber = row[4]?.toString().trim(); // Column E (Order Number)

      if (orderNumber) {
        const order: OrderRow = {
          orderNumber: orderNumber,
          vehicle: row[0] || '', // Column A
          sequence: row[1] || '', // Column B  
          route_number: row[2] || '', // Column C
          route_name: row[3] || '', // Column D
          locations: row[5] || '', // Column F
          status: row[6] || '', // Column G
          customer_name: row[7] || '', // Column H
          customer_address: row[8] || '', // Column I
          appointment_type: row[9] || '', // Column J
          article_count: row[10] || '', // Column K
        };

        orders.push(order);
      }
    }

    console.log(`Found ${orders.length} orders in sheet "${sheetName}"`);

    // Filter and log BoltYYZ3 orders
    const boltOrders = orders.filter(order => 
      order.orderNumber && order.orderNumber.toString().startsWith('BoltYYZ3')
    );

    console.log(`Found ${boltOrders.length} BoltYYZ3 orders:`);
    boltOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.customer_name} - ${order.customer_address}`);
    });

    return orders;
  }


  async updateLocationInSheet(googleSheetUrl: string, orderNumber: string, locations: string[]): Promise<void> {
    const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);

    console.log(`=== UPDATING GOOGLE SHEET ===`);
    console.log(`Order: ${orderNumber}`);
    console.log(`Locations: ${locations.join(', ') || 'No locations'}`);
    console.log(`Sheet URL: ${googleSheetUrl}`);
    console.log(`Spreadsheet ID: ${spreadsheetId}`);

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties.title',
      });

      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) throw new Error('No sheets found in the spreadsheet');

      const sheetName = sheets[0].properties?.title || 'Sheet1';
      console.log(`Using sheet: ${sheetName}`);

      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:M`,
      });

      const rows = dataResponse.data.values || [];
      if (rows.length === 0) throw new Error('No data found in sheet');

      console.log(`Found ${rows.length} rows in sheet`);
      const headerRow = rows[0];
      console.log('Sheet headers:', headerRow);

      const orderColumnIndex = 4; // Column E (Order Number)
      const locationColumnIndex = 5; // Column F (Locations)

      let targetRowIndex = -1;
      let originalRowData: string[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cellOrderNumber = row[orderColumnIndex]?.toString().trim();
        console.log(`Row ${i + 1}: Checking "${cellOrderNumber}" against "${orderNumber}"`);

        if (cellOrderNumber === orderNumber) {
          targetRowIndex = i + 1; // 1-indexed
          originalRowData = [...row]; // Store the entire original row
          console.log(`✅ Found order ${orderNumber} at row ${targetRowIndex}`);
          break;
        }
      }

      if (targetRowIndex === -1) {
        console.log(`❌ Order ${orderNumber} not found in sheet`);
        throw new Error(`Order ${orderNumber} not found in sheet`);
      }

      // Handle no locations case
      if (locations.length === 0) {
        const range = `${sheetName}!F${targetRowIndex}`;
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: { values: [['No location']] }
        });
        console.log(`✅ Updated ${orderNumber} with "No location" in range ${range}`);
        return;
      }

      // Update the original row with the first location, preserving other data
      const firstLocationRange = `${sheetName}!F${targetRowIndex}`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: firstLocationRange,
        valueInputOption: 'RAW',
        requestBody: { values: [[locations[0]]] }
      });
      console.log(`✅ Updated first location "${locations[0]}" in range ${firstLocationRange}`);

      // Insert new rows for additional locations
      if (locations.length > 1) {
        const numNewRows = locations.length - 1;
        const requests = [];

        for (let i = 1; i < locations.length; i++) {
          // Insert a new row below the current target (shifts down each time)
          requests.push({
            insertDimension: {
              range: {
                sheetId: sheets[0].properties.sheetId,
                dimension: 'ROWS',
                startIndex: targetRowIndex + i - 1,
                endIndex: targetRowIndex + i
              },
              inheritFromBefore: true // Inherit formatting from above
            }
          });

          // Prepare new row data: copy order number, set location, blank other columns
          const newRowData = originalRowData.map((cell, idx) => {
            if (idx === orderColumnIndex) return orderNumber; // Retain order number
            if (idx === locationColumnIndex) return locations[i]; // Set new location
            return ''; // Blank other columns
          });

          requests.push({
            updateCells: {
              range: {
                sheetId: sheets[0].properties.sheetId,
                startRowIndex: targetRowIndex + i - 1,
                endRowIndex: targetRowIndex + i,
                startColumnIndex: 0,
                endColumnIndex: originalRowData.length
              },
              rows: [{ values: newRowData.map(v => ({ userEnteredValue: { stringValue: v } })) }],
              fields: 'userEnteredValue'
            }
          });
        }

        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          requestBody: { requests }
        });
        console.log(`✅ Inserted ${numNewRows} new rows with additional locations for ${orderNumber}`);
      }
    } catch (error) {
      console.error('❌ Error updating sheet:', error);
      throw error;
    }
  }
}