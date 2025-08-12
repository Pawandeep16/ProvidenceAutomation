import { NextRequest } from 'next/server';
import { GoogleSheetsService } from '@/src/lib/googleSheets';
import { ProvidenceAutomation } from '@/src/lib/providenceAutomation';

interface ProcessingResult {
  orderNumber: string;
  status: 'success' | 'error' | 'processing';
  message?: string;
  locations?: string[]; // Array to support multiple locations
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      let currentProcessingStepId = '';
      
      (async () => {
        try {
          const { username, password, googleSheetUrl } = await request.json();
          
          if (!username || !password || !googleSheetUrl) {
            throw new Error('Missing required configuration (username, password, or Google Sheet URL)');
          }
          
          // Step 1: Initialize Browser
          currentProcessingStepId = 'initialize';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'initialize',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'running' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'pending' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'pending' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          const automation = new ProvidenceAutomation();
          await automation.initialize();
          
          // Step 2: Navigate to Providence
          currentProcessingStepId = 'navigate';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'navigate',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'running' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'pending' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToLogin();
          
          // Step 3: Login
          currentProcessingStepId = 'login';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'login',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'running' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'pending' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.login(username, password);
          
          // Step 4: Select Facility
          currentProcessingStepId = 'facility';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'facility',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'running' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'pending' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.selectFacility();
          
          // Step 5: Navigate to Inventory Management
          currentProcessingStepId = 'inventory';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'inventory',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'running' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'pending' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToInventoryManagement();
          
          // Step 6: Open Manual Items
          currentProcessingStepId = 'manual-items';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'manual-items',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'running' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'pending' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          await automation.navigateToManualItems();
          
          // Step 7: Read Google Sheet
          currentProcessingStepId = 'read-sheet';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'read-sheet',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'running' },
              { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations', status: 'pending' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          const sheetsService = new GoogleSheetsService();
          const allOrders = await sheetsService.processSheet(googleSheetUrl);
          
          const boltOrders = allOrders.filter(order => 
            order.orderNumber && order.orderNumber.toString().startsWith('BoltYYZ3')
          );
          
          console.log(`Found ${boltOrders.length} BoltYYZ3 orders to process`);
          
          // Step 8: Process Orders
          currentProcessingStepId = 'process-orders';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: true,
            currentStepId: 'process-orders',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'completed' },
              { id: 'process-orders', title: 'Process Orders', description: `Processing ${boltOrders.length} BoltYYZ3 orders`, status: 'running' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
            ]
          })}\n\n`));
          
          const results: ProcessingResult[] = [];
          
          for (let i = 0; i < Math.min(boltOrders.length, 5); i++) {
            const order = boltOrders[i];
            const orderNumber = order.orderNumber.toString();
            
            try {
              console.log(`Processing order ${i + 1}/${boltOrders.length}: ${orderNumber}`);
              
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                isRunning: true,
                currentStepId: 'process-orders',
                steps: [
                  { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
                  { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
                  { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
                  { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
                  { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
                  { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
                  { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'completed' },
                  { id: 'process-orders', title: 'Process Orders', description: `Processing ${orderNumber} (${i + 1}/${Math.min(boltOrders.length, 5)})`, status: 'running' },
                  { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
                ],
                results: [...results, { orderNumber, status: 'processing' }]
              })}\n\n`));
              
              const orderData = await automation.searchOrder(orderNumber);
              console.log(`Order data for ${orderNumber}:`, JSON.stringify(orderData, null, 2)); // Detailed logging of orderData
              
              if (orderData.locations && orderData.locations.length > 0 && !orderData.error) {
                console.log(`Found ${orderData.locations.length} locations for ${orderNumber}: ${orderData.locations.join(', ')}`);
                try {
                  await sheetsService.updateLocationInSheet(googleSheetUrl, orderNumber, orderData.locations);
                  console.log(`✅ Successfully updated sheet for ${orderNumber} with ${orderData.locations.length} locations`);
                } catch (sheetError) {
                  console.error(`❌ Failed to update sheet for ${orderNumber}:`, sheetError);
                  throw sheetError;
                }
                
                const result: ProcessingResult = {
                  orderNumber,
                  status: 'success',
                  message: `Updated ${orderData.locations.length} locations successfully`,
                  locations: orderData.locations
                };
                results.push(result);
                
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({
                  isRunning: true,
                  currentStepId: 'process-orders',
                  steps: [
                    { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
                    { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
                    { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
                    { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
                    { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
                    { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
                    { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'completed' },
                    { id: 'process-orders', title: 'Process Orders', description: `✅ Updated ${orderNumber} (${i + 1}/${Math.min(boltOrders.length, 5)}) with ${orderData.locations.length} locations`, status: 'running' },
                    { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'pending' }
                  ],
                  results: results
                })}\n\n`));
              } else {
                const errorMessage = orderData.error || 'No locations found';
                console.log(`❌ No locations found for ${orderNumber}: ${errorMessage}`);
                try {
                  await sheetsService.updateLocationInSheet(googleSheetUrl, orderNumber, []);
                  console.log(`✅ Updated sheet for ${orderNumber} with "No location"`);
                } catch (sheetError) {
                  console.error(`❌ Failed to update sheet for ${orderNumber}:`, sheetError);
                }
                
                const result: ProcessingResult = {
                  orderNumber,
                  status: 'error',
                  message: errorMessage
                };
                results.push(result);
              }
              
              await new Promise(resolve => setTimeout(resolve, 4000)); // Delay for sheet updates
              
            } catch (error) {
              console.error(`Error processing order ${orderNumber}:`, error);
              try {
                await sheetsService.updateLocationInSheet(googleSheetUrl, orderNumber, ['Error']);
                console.log(`✅ Updated sheet for ${orderNumber} with "Error"`);
              } catch (sheetError) {
                console.error(`❌ Failed to update sheet for ${orderNumber}:`, sheetError);
              }
              
              const result: ProcessingResult = {
                orderNumber,
                status: 'error',
                message: error instanceof Error ? error.message : 'Unknown error occurred'
              };
              results.push(result);
            }
          }
          
          // Step 9: Complete
          currentProcessingStepId = 'complete';
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: false,
            currentStepId: 'complete',
            steps: [
              { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation', status: 'completed' },
              { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login', status: 'completed' },
              { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in', status: 'completed' },
              { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown', status: 'completed' },
              { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab', status: 'completed' },
              { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section', status: 'completed' },
              { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet', status: 'completed' },
              { id: 'process-orders', title: 'Process Orders', description: `Processed ${results.length} orders successfully`, status: 'completed' },
              { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully', status: 'completed' }
            ],
            results: results
          })}\n\n`));
          
      
          
        } catch (error) {
          console.error('Automation error:', error);
          
          const allSteps = [
            { id: 'initialize', title: 'Initialize Browser', description: 'Starting Chrome browser and preparing automation' },
            { id: 'navigate', title: 'Navigate to Providence', description: 'Opening https://providence.gobolt.com/login' },
            { id: 'login', title: 'Login to Providence', description: 'Entering credentials and logging in' },
            { id: 'facility', title: 'Select Facility', description: 'Selecting YYZ5 from facility dropdown' },
            { id: 'inventory', title: 'Navigate to Inventory Management', description: 'Clicking on Inventory Management tab' },
            { id: 'manual-items', title: 'Open Manual Items', description: 'Clicking on Manual Items section' },
            { id: 'read-sheet', title: 'Read Google Sheet', description: 'Fetching BoltYYZ3 orders from Google Sheet' },
            { id: 'process-orders', title: 'Process Orders', description: 'Searching orders and updating locations' },
            { id: 'complete', title: 'Automation Complete', description: 'All steps completed successfully' }
          ];
          
          const errorSteps = allSteps.map(step => {
            if (step.id === currentProcessingStepId) {
              return { ...step, status: 'error', error: error instanceof Error ? error.message : 'Unknown error' };
            } else if (allSteps.findIndex(s => s.id === currentProcessingStepId) > allSteps.findIndex(s => s.id === step.id)) {
              return { ...step, status: 'completed' };
            } else {
              return { ...step, status: 'pending' };
            }
          });
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({
            isRunning: false,
            currentStepId: currentProcessingStepId,
            steps: errorSteps,
            error: error instanceof Error ? error.message : 'Unknown error occurred'
          })}\n\n`));
        } finally {
          controller.close();
        }
      })();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}