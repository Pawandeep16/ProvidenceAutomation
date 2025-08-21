// import { google } from 'googleapis';

// interface OrderRow {
//   orderNumber: string;
//   [key: string]: any;
// }

// export class GoogleSheetsService {
//   public sheets: any;

  
 
//   constructor() {
//     const auth = new google.auth.GoogleAuth({
//       credentials: {
//         client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
//         private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
//       },
//       scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//     });

//     this.sheets = google.sheets({ version: 'v4', auth });
//   }

//   // Extract spreadsheet ID and sheet ID from URL
//   extractSpreadsheetId(url: string): { spreadsheetId: string; sheetId?: string } {
//     const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
//     const gidMatch = url.match(/#gid=([0-9]+)/);
//     if (!match) {
//       throw new Error('Invalid Google Sheets URL format');
//     }
//     return {
//       spreadsheetId: match[1],
//       sheetId: gidMatch ? gidMatch[1] : undefined,
//     };
//   }

//   // Get sheet name from sheet ID
//   async getSheetNameFromId(spreadsheetId: string, sheetId?: string): Promise<string> {
//     try {
//       const response = await this.sheets.spreadsheets.get({
//         spreadsheetId,
//         fields: 'sheets.properties(title,sheetId)',
//       });

//       const sheets = response.data.sheets;
//       if (!sheets || sheets.length === 0) {
//         throw new Error('No sheets found in the spreadsheet');
//       }

//       if (sheetId) {
//         const targetSheet = sheets.find(sheet => sheet.properties?.sheetId?.toString() === sheetId);
//         if (targetSheet && targetSheet.properties?.title) {
//           console.log(`Found sheet with ID ${sheetId}: ${targetSheet.properties.title}`);
//           return targetSheet.properties.title;
//         }
//         console.warn(`Sheet with ID ${sheetId} not found, defaulting to first sheet`);
//       }

//       const defaultSheet = sheets[0].properties?.title || 'Sheet1';
//       console.log(`Using default sheet: ${defaultSheet}`);
//       return defaultSheet;
//     } catch (error) {
//       console.error('Error fetching sheet names:', error);
//       throw new Error('Failed to determine sheet name from URL');
//     }
//   }

//   // Parse date string in MM/DD format
//   parseDateString(dateStr: string): Date | null {
//     const currentYear = new Date().getFullYear();
//     const match = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
//     if (match) {
//       const month = parseInt(match[1], 10);
//       const day = parseInt(match[2], 10);
//       if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
//         return new Date(currentYear, month - 1, day);
//       }
//     }
//     return null;
//   }

//   // Get the latest sheet by date or default to first sheet
//   async getLatestDateSheet(spreadsheetId: string): Promise<string> {
//     try {
//       const response = await this.sheets.spreadsheets.get({
//         spreadsheetId,
//         fields: 'sheets.properties.title',
//       });

//       const sheets = response.data.sheets;
//       if (!sheets || sheets.length === 0) {
//         throw new Error('No sheets found in the spreadsheet');
//       }

//       let latestSheet = '';
//       let latestDate: Date | null = null;

//       for (const sheet of sheets) {
//         const title = sheet.properties?.title;
//         if (!title) continue;

//         const parsedDate = this.parseDateString(title);
//         if (parsedDate && (!latestDate || parsedDate > latestDate)) {
//           latestDate = parsedDate;
//           latestSheet = title;
//         }
//       }

//       if (!latestSheet) {
//         latestSheet = sheets[0].properties?.title || 'Sheet1';
//       }

//       console.log(`Selected sheet: ${latestSheet}`);
//       return latestSheet;
//     } catch (error) {
//       console.error('Error getting sheet names:', error);
//       throw new Error('Failed to access Google Sheet. Please check permissions and URL.');
//     }
//   }

//   async getOrderNumbers(spreadsheetId: string, sheetName: string): Promise<OrderRow[]> {
//     try {
//       const response = await this.sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: `${sheetName}!A:Z`,
//       });

//       const rows = response.data.values || [];
//       if (!rows || rows.length === 0) {
//         return [];
//       }

//       const headerRow = rows[0];
//       const orderColumnIndex = this.findOrderColumn(headerRow);

//       if (orderColumnIndex === -1) {
//         throw new Error('Could not find order number column. Expected headers like "Order", "Order Number", or "Order ID"');
//       }

//       const orders: OrderRow[] = [];

//       for (let i = 1; i < rows.length; i++) {
//         const row = rows[i];
//         const orderNumber = row[orderColumnIndex]?.toString().trim();

//         if (orderNumber) {
//           const orderData: OrderRow = { orderNumber };

//           for (let j = 0; j < headerRow.length; j++) {
//             if (j !== orderColumnIndex && row[j]) {
//               const header = headerRow[j]?.toString().toLowerCase().replace(/\s+/g, '_');
//               orderData[header] = row[j];
//             }
//           }

//           orders.push(orderData);
//         }
//       }

//       return orders;
//     } catch (error) {
//       console.error('Error reading sheet data:', error);
//       throw new Error('Failed to read order data from the sheet');
//     }
//   }

//   private findOrderColumn(headers: any[]): number {
//     const orderHeaders = [
//       'order',
//       'order number',
//       'order_number',
//       'ordernumber',
//       'order id',
//       'order_id',
//       'orderid',
//     ];

//     for (let i = 0; i < headers.length; i++) {
//       const header = headers[i]?.toString().toLowerCase().trim();
//       if (orderHeaders.includes(header)) {
//         return i;
//       }
//     }

//     return -1;
//   }

//   async processSheet(googleSheetUrl: string): Promise<OrderRow[]> {
//     const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);

//     console.log('=== PROCESSING GOOGLE SHEET ===');
//     console.log('Sheet URL:', googleSheetUrl);
//     console.log('Spreadsheet ID:', spreadsheetId);

//     const response = await this.sheets.spreadsheets.get({
//       spreadsheetId,
//       fields: 'sheets.properties.title',
//     });

//     const sheets = response.data.sheets;
//     if (!sheets || sheets.length === 0) {
//       throw new Error('No sheets found in the spreadsheet');
//     }

//     const sheetName = sheets[0].properties?.title || 'Sheet1';
//     console.log('Using sheet:', sheetName);

//     const dataResponse = await this.sheets.spreadsheets.values.get({
//       spreadsheetId,
//       range: `${sheetName}!A:Z`,
//     });

//     const rows = dataResponse.data.values;
//     if (!rows || rows.length === 0) {
//       return [];
//     }

//     console.log(`Found ${rows.length} total rows (including header)`);

//     const headerRow = rows[0];
//     console.log('Headers:', headerRow);

//     const orders: OrderRow[] = [];

//     for (let i = 1; i < rows.length; i++) {
//       const row = rows[i];
//       const orderNumber = row[4]?.toString().trim(); // Column E (Order Number)

//       if (orderNumber) {
//         // Log if order starts with 'SC'
//         if (orderNumber.startsWith('SC')) {
//           console.log('encounter Z5 code');
//         }

//         const order: OrderRow = {
//           orderNumber: orderNumber,
//           vehicle: row[0] || '', // Column A
//           sequence: row[1] || '', // Column B  
//           route_number: row[2] || '', // Column C
//           route_name: row[3] || '', // Column D
//           locations: row[5] || '', // Column F
//           status: row[6] || '', // Column G
//           customer_name: row[7] || '', // Column H
//           customer_address: row[8] || '', // Column I
//           appointment_type: row[9] || '', // Column J
//           article_count: row[10] || '', // Column K
//         };

//         orders.push(order);
//       }
//     }

//     console.log(`Found ${orders.length} orders in sheet "${sheetName}"`);

//     // Filter for BoltYYZ3 and DO4000 orders for logging
//     const boltOrders = orders.filter(order => 
//       order.orderNumber && 
//       (order.orderNumber.toString().startsWith('BoltYYZ3') || order.orderNumber.toString().startsWith('DO4000'))
//     );

//     console.log(`Found ${boltOrders.length} BoltYYZ3 or DO4000 orders:`);
//     boltOrders.forEach((order, index) => {
//       console.log(`${index + 1}. ${order.orderNumber} - ${order.customer_name} - ${order.customer_address}`);
//     });

//     return orders;
//   }

//   async updateLocationInSheet(googleSheetUrl: string, orderNumber: string, locations: string[]): Promise<void> {
//     const spreadsheetId = this.extractSpreadsheetId(googleSheetUrl);

//     console.log(`=== UPDATING GOOGLE SHEET ===`);
//     console.log(`Order: ${orderNumber}`);
//     console.log(`Locations: ${locations.join(', ') || 'No locations'}`);
//     console.log(`Sheet URL: ${googleSheetUrl}`);
//     console.log(`Spreadsheet ID: ${spreadsheetId}`);

//     try {
//       const response = await this.sheets.spreadsheets.get({
//         spreadsheetId,
//         fields: 'sheets.properties.title',
//       });

//       const sheets = response.data.sheets;
//       if (!sheets || sheets.length === 0) throw new Error('No sheets found in the spreadsheet');

//       const sheetName = sheets[0].properties?.title || 'Sheet1';
//       console.log(`Using sheet: ${sheetName}`);

//       const dataResponse = await this.sheets.spreadsheets.values.get({
//         spreadsheetId

// ,
//         range: `${sheetName}!A:M`,
//       });

//       const rows = dataResponse.data.values || [];
//       if (rows.length === 0) throw new Error('No data found in sheet');

//       console.log(`Found ${rows.length} rows in sheet`);
//       const headerRow = rows[0];
//       console.log('Sheet headers:', headerRow);

//       const orderColumnIndex = 4; // Column E (Order Number)
//       const locationColumnIndex = 5; // Column F (Locations)

//       let targetRowIndex = -1;
//       let originalRowData: string[] = [];
//       for (let i = 1; i < rows.length; i++) {
//         const row = rows[i];
//         const cellOrderNumber = row[orderColumnIndex]?.toString().trim();
//         console.log(`Row ${i + 1}: Checking "${cellOrderNumber}" against "${orderNumber}"`);

//         if (cellOrderNumber === orderNumber) {
//           targetRowIndex = i + 1; // 1-indexed
//           originalRowData = [...row]; // Store the entire original row
//           console.log(`✅ Found order ${orderNumber} at row ${targetRowIndex}`);
//           break;
//         }
//       }

//       if (targetRowIndex === -1) {
//         console.log(`❌ Order ${orderNumber} not found in sheet`);
//         throw new Error(`Order ${orderNumber} not found in sheet`);
//       }

//       // Handle no locations case
//       if (locations.length === 0) {
//         const range = `${sheetName}!F${targetRowIndex}`;
//         await this.sheets.spreadsheets.values.update({
//           spreadsheetId,
//           range,
//           valueInputOption: 'RAW',
//           requestBody: { values: [['No location']] }
//         });
//         console.log(`✅ Updated ${orderNumber} with "No location" in range ${range}`);
//         return;
//       }

//       // Update the original row with the first location, preserving other data
//       const firstLocationRange = `${sheetName}!F${targetRowIndex}`;
//       await this.sheets.spreadsheets.values.update({
//         spreadsheetId,
//         range: firstLocationRange,
//         valueInputOption: 'RAW',
//         requestBody: { values: [[locations[0]]] }
//       });
//       console.log(`✅ Updated first location "${locations[0]}" in range ${firstLocationRange}`);

//       // Insert new rows for additional locations
//       if (locations.length > 1) {
//         const numNewRows = locations.length - 1;
//         const requests = [];

//         for (let i = 1; i < locations.length; i++) {
//           // Insert a new row below the current target (shifts down each time)
//           const newRowIndex = targetRowIndex + i - 1;
//           requests.push({
//             insertDimension: {
//               range: {
//                 sheetId: sheets[0].properties.sheetId,
//                 dimension: 'ROWS',
//                 startIndex: newRowIndex,
//                 endIndex: newRowIndex + 1
//               },
//               inheritFromBefore: true // Inherit formatting from above
//             }
//           });

//           // Prepare new row data: copy order number, set location, blank other columns
//           const newRowData = originalRowData.map((cell, idx) => {
//             if (idx === orderColumnIndex) return orderNumber; // Retain order number
//             if (idx === locationColumnIndex) return locations[i]; // Set new location
//             return ''; // Blank other columns
//           });

//           requests.push({
//             updateCells: {
//               range: {
//                 sheetId: sheets[0].properties.sheetId,
//                 startRowIndex: newRowIndex,
//                 endRowIndex: newRowIndex + 1,
//                 startColumnIndex: 0,
//                 endColumnIndex: originalRowData.length
//               },
//               rows: [{ values: newRowData.map(v => ({ userEnteredValue: { stringValue: v || '' } })) }],
//               fields: 'userEnteredValue'
//             }
//           });
//           console.log(`Prepared request for row ${newRowIndex + 1} with location: ${locations[i]}`);
//         }

//         // Execute batch update with retry logic
//         let attempt = 0;
//         const maxAttempts = 3;
//         while (attempt < maxAttempts) {
//           try {
//             await this.sheets.spreadsheets.batchUpdate({
//               spreadsheetId,
//               requestBody: { requests }
//             });
//             console.log(`✅ Successfully inserted ${numNewRows} new rows for ${orderNumber}`);
//             break;
//           } catch (batchError) {
//             attempt++;
//             console.error(`❌ Batch update failed (attempt ${attempt}/${maxAttempts}):`, batchError);
//             if (attempt === maxAttempts) throw batchError;
//             await new Promise(resolve => setTimeout(resolve, 2000 * attempt)); // Exponential backoff
//           }
//         }
//       }

//       // Verify the update
//       const verifyResponse = await this.sheets.spreadsheets.values.get({
//         spreadsheetId,
//         range: `${sheetName}!A${targetRowIndex}:M${targetRowIndex + locations.length - 1}`,
//       });
//       const updatedRows = verifyResponse.data.values || [];
//       console.log(`Verified updated rows:`, updatedRows);
//     } catch (error) {
//       console.error('❌ Error updating sheet:', error);
//       throw error;
//     }
//   }
// }


import { google } from 'googleapis';
import { sheets_v4 } from 'googleapis';

interface OrderRow {
  orderNumber: string;
  [key: string]: any;
}

export class GoogleSheetsService {
  private sheets: sheets_v4.Sheets;

  constructor() {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
  }

  // Extract spreadsheet ID and sheet ID from URL
  extractSpreadsheetId(url: string): { spreadsheetId: string; sheetId?: string } {
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    const gidMatch = url.match(/#gid=([0-9]+)/);
    if (!match) {
      throw new Error('Invalid Google Sheets URL format');
    }
    const sheetId = gidMatch ? gidMatch[1] : undefined;
    console.log(`Extracted spreadsheetId: ${match[1]}, sheetId: ${sheetId || 'not provided'}`);
    return {
      spreadsheetId: match[1],
      sheetId,
    };
  }

  // Get sheet name from sheet ID
  async getSheetNameFromId(spreadsheetId: string, sheetId?: string): Promise<{ sheetName: string; sheetId: number }> {
    try {
      console.log(`Fetching sheet metadata for spreadsheetId: ${spreadsheetId}, sheetId: ${sheetId || 'not provided'}`);
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
        fields: 'sheets.properties(title,sheetId)',
      });

      const sheets = response.data.sheets;
      if (!sheets || sheets.length === 0) {
        throw new Error('No sheets found in the spreadsheet');
      }

      console.log(`Found ${sheets.length} sheets in spreadsheet`);
      if (sheetId) {
        const targetSheet = sheets.find(sheet => {
          const apiSheetId = sheet.properties?.sheetId?.toString();
          console.log(`Comparing sheetId ${apiSheetId} with URL gid ${sheetId}`);
          return apiSheetId === sheetId;
        });
        if (targetSheet && targetSheet.properties?.title && targetSheet.properties?.sheetId !== undefined) {
          console.log(`Found sheet with ID ${sheetId}: ${targetSheet.properties.title}`);
          return {
            sheetName: targetSheet.properties.title,
            sheetId: targetSheet.properties.sheetId,
          };
        }
        console.warn(`Sheet with ID ${sheetId} not found, defaulting to first sheet`);
      }

      const defaultSheet = sheets[0].properties?.title || 'Sheet1';
      const defaultSheetId = sheets[0].properties?.sheetId ?? 0;
      console.log(`Using default sheet: ${defaultSheet} (ID: ${defaultSheetId})`);
      return {
        sheetName: defaultSheet,
        sheetId: defaultSheetId,
      };
    } catch (error) {
      console.error('Error fetching sheet names:', error);
      throw new Error('Failed to determine sheet name from URL');
    }
  }

  // Parse date string in MM/DD format (kept as provided, unused for sheet selection)
  parseDateString(dateStr: string): Date | null {
    const currentYear = new Date().getFullYear();
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

  // Get the latest sheet by date or default to first sheet (kept as provided, unused for sheet selection)
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
        latestSheet = sheets[0].properties?.title || 'Sheet1';
      }

      console.log(`Selected sheet: ${latestSheet}`);
      return latestSheet;
    } catch (error) {
      console.error('Error getting sheet names:', error);
      throw new Error('Failed to access Google Sheet. Please check permissions and URL.');
    }
  }

  async getOrderNumbers(spreadsheetId: string, sheetName: string): Promise<OrderRow[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:Z`,
      });

      const rows = response.data.values || [];
      if (!rows || rows.length === 0) {
        console.log(`No data found in sheet "${sheetName}"`);
        return [];
      }

      const headerRow = rows[0];
      const orderColumnIndex = this.findOrderColumn(headerRow);

      if (orderColumnIndex === -1) {
        throw new Error('Could not find order number column. Expected headers like "Order", "Order Number", or "Order ID"');
      }

      const orders: OrderRow[] = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const orderNumber = row[orderColumnIndex]?.toString().trim();

        if (orderNumber) {
          const orderData: OrderRow = { orderNumber };

          for (let j = 0; j < headerRow.length; j++) {
            if (j !== orderColumnIndex && row[j]) {
              const header = headerRow[j]?.toString().toLowerCase().replace(/\s+/g, '_');
              orderData[header] = row[j];
            }
          }

          orders.push(orderData);
        }
      }

      console.log(`Found ${orders.length} orders in sheet "${sheetName}"`);
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
    console.log('=== PROCESSING GOOGLE SHEET ===');
    console.log('Sheet URL:', googleSheetUrl);

    const { spreadsheetId, sheetId } = this.extractSpreadsheetId(googleSheetUrl);
    const { sheetName } = await this.getSheetNameFromId(spreadsheetId, sheetId);
    console.log('Spreadsheet ID:', spreadsheetId);
    console.log('Using sheet:', sheetName);

    const dataResponse = await this.sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A:Z`,
    });

    const rows = dataResponse.data.values;
    if (!rows || rows.length === 0) {
      console.log(`No data found in sheet "${sheetName}"`);
      return [];
    }

    console.log(`Found ${rows.length} total rows (including header)`);
    console.log('Headers:', rows[0]);

    const orders: OrderRow[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const orderNumber = row[4]?.toString().trim(); // Column E (Order Number)

      if (orderNumber) {
        if (orderNumber.startsWith('SC')) {
          console.log('encounter Z5 code');
        }

        const order: OrderRow = {
          orderNumber: orderNumber,
          vehicle: row[0] || '',
          sequence: row[1] || '',
          route_number: row[2] || '',
          route_name: row[3] || '',
          locations: row[5] || '',
          status: row[6] || '',
          customer_name: row[7] || '',
          customer_address: row[8] || '',
          appointment_type: row[9] || '',
          article_count: row[10] || '',
        };

        orders.push(order);
      }
    }

    console.log(`Found ${orders.length} orders in sheet "${sheetName}"`);

    const boltOrders = orders.filter(order =>
      order.orderNumber &&
      (order.orderNumber.toString().startsWith('BoltYYZ3') || order.orderNumber.toString().startsWith('DO4000'))
    );

    console.log(`Found ${boltOrders.length} BoltYYZ3 or DO4000 orders:`);
    boltOrders.forEach((order, index) => {
      console.log(`${index + 1}. ${order.orderNumber} - ${order.customer_name} - ${order.customer_address}`);
    });

    return orders;
  }

  async updateLocationInSheet(googleSheetUrl: string, orderNumber: string, locations: string[]): Promise<void> {
    console.log('=== UPDATING GOOGLE SHEET ===');
    console.log(`Order: ${orderNumber}`);
    console.log(`Locations: ${locations.join(', ') || 'No locations'}`);
    console.log(`Sheet URL: ${googleSheetUrl}`);

    if (orderNumber.startsWith('SC')) {
      console.log('encounter Z5 code');
    }

    try {
      // Step 1: Extract spreadsheet ID and sheet ID
      const { spreadsheetId, sheetId } = this.extractSpreadsheetId(googleSheetUrl);
      console.log(`Spreadsheet ID: ${spreadsheetId}, Sheet ID: ${sheetId || 'not provided'}`);

      // Step 2: Get sheet name and ID
      const { sheetName, sheetId: targetSheetId } = await this.getSheetNameFromId(spreadsheetId, sheetId);
      console.log(`Target sheet: ${sheetName} (ID: ${targetSheetId})`);

      // Step 3: Fetch sheet data
      const dataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:M`,
      });

      const rows = dataResponse.data.values || [];
      if (rows.length === 0) {
        throw new Error(`No data found in sheet "${sheetName}"`);
      }
      console.log(`Found ${rows.length} rows in sheet "${sheetName}"`);
      console.log('Sheet headers:', rows[0]);

      const orderColumnIndex = 4; // Column E (Order Number)
      const locationColumnIndex = 5; // Column F (Locations)

      // Step 4: Find target row
      let targetRowIndex = -1;
      let originalRowData: string[] = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        const cellOrderNumber = row[orderColumnIndex]?.toString().trim();
        console.log(`Row ${i + 1}: Checking "${cellOrderNumber}" against "${orderNumber}"`);
        if (cellOrderNumber === orderNumber) {
          targetRowIndex = i + 1; // 1-indexed
          originalRowData = [...row];
          console.log(`✅ Found order ${orderNumber} at row ${targetRowIndex}`);
          break;
        }
      }

      if (targetRowIndex === -1) {
        console.log(`❌ Order ${orderNumber} not found in sheet "${sheetName}"`);
        throw new Error(`Order ${orderNumber} not found in sheet "${sheetName}"`);
      }

      // Step 5: Handle no locations case
      if (locations.length === 0) {
        const range = `${sheetName}!F${targetRowIndex}`;
        await this.sheets.spreadsheets.values.update({
          spreadsheetId,
          range,
          valueInputOption: 'RAW',
          requestBody: { values: [['No location']] },
        });
        console.log(`✅ Updated ${orderNumber} with "No location" in range ${range}`);
        return;
      }

      // Step 6: Update the original row with the first location
      const firstLocationRange = `${sheetName}!F${targetRowIndex}`;
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: firstLocationRange,
        valueInputOption: 'RAW',
        requestBody: { values: [[locations[0]]] },
      });
      console.log(`✅ Updated first location "${locations[0]}" in range ${firstLocationRange}`);

      // Step 7: Insert new rows for additional locations
      if (locations.length > 1) {
        const numNewRows = locations.length - 1;
        const requests: sheets_v4.Schema$Request[] = [];

        for (let i = 1; i < locations.length; i++) {
          const newRowIndex = targetRowIndex + i - 1;
          requests.push({
            insertDimension: {
              range: {
                sheetId: targetSheetId,
                dimension: 'ROWS',
                startIndex: newRowIndex,
                endIndex: newRowIndex + 1,
              },
              inheritFromBefore: true,
            },
          });

          const newRowData = originalRowData.map((cell, idx) => {
            if (idx === orderColumnIndex) return orderNumber;
            if (idx === locationColumnIndex) return locations[i];
            return '';
          });

          requests.push({
            updateCells: {
              range: {
                sheetId: targetSheetId,
                startRowIndex: newRowIndex,
                endRowIndex: newRowIndex + 1,
                startColumnIndex: 0,
                endColumnIndex: originalRowData.length,
              },
              rows: [{ values: newRowData.map(v => ({ userEnteredValue: { stringValue: v || '' } })) }],
              fields: 'userEnteredValue',
            },
          });
          console.log(`Prepared request for row ${newRowIndex + 1} with location: ${locations[i]}`);
        }

        // Execute batch update with retry logic
        let attempt = 0;
        const maxAttempts = 3;
        while (attempt < maxAttempts) {
          try {
            await this.sheets.spreadsheets.batchUpdate({
              spreadsheetId,
              requestBody: { requests },
            });
            console.log(`✅ Successfully inserted ${numNewRows} new rows for ${orderNumber}`);
            break;
          } catch (batchError) {
            attempt++;
            console.error(`❌ Batch update failed (attempt ${attempt}/${maxAttempts}):`, batchError);
            if (attempt === maxAttempts) {
              throw new Error(`Failed to update sheet after ${maxAttempts} attempts: ${(batchError as Error).message}`);
            }
            await new Promise(resolve => setTimeout(resolve, 2000 * attempt));
          }
        }
      }

      // Step 8: Verify the update
      const verifyResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A${targetRowIndex}:M${targetRowIndex + locations.length - 1}`,
      });
      const updatedRows = verifyResponse.data.values || [];
      console.log(`Verified updated rows in sheet "${sheetName}":`, updatedRows);
    } catch (error) {
      console.error('❌ Error updating sheet:', error);
      throw error;
    }
  }
}