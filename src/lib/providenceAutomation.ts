import { Builder, By, WebDriver, until, Key ,WebElement} from 'selenium-webdriver';
import path from 'path';
import chrome, { ServiceBuilder } from 'selenium-webdriver/chrome';

export class ProvidenceAutomation {

  private driver: WebDriver | null = null;


  async initialize(): Promise<void> {
    

     const options = new chrome.Options();
    // Chrome options to suppress errors and optimize performance
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--start-maximized');
    
    // Suppress Chrome service errors that cause delays
    options.addArguments('--disable-background-timer-throttling');
    options.addArguments('--disable-backgrounding-occluded-windows');
    options.addArguments('--disable-renderer-backgrounding');
    options.addArguments('--disable-features=TranslateUI');
    options.addArguments('--disable-ipc-flooding-protection');
    options.addArguments('--disable-background-networking');
    options.addArguments('--disable-sync');
    options.addArguments('--disable-default-apps');
    options.addArguments('--disable-extensions');
    options.addArguments('--disable-plugins');
    options.addArguments('--disable-web-security');
    options.addArguments('--disable-features=VizDisplayCompositor');
    
    // Suppress GCM/registration errors
    options.addArguments('--disable-component-extensions-with-background-pages');
    options.addArguments('--disable-background-mode');
    options.addArguments('--disable-client-side-phishing-detection');
    options.addArguments('--disable-hang-monitor');
    options.addArguments('--disable-prompt-on-repost');
    options.addArguments('--disable-domain-reliability');
    
    // Logging preferences to reduce console noise
    const loggingPrefs = {
      'browser': 'OFF',
      'driver': 'OFF',
      'performance': 'OFF'
    };
    options.setLoggingPrefs(loggingPrefs);
    
    // Suppress specific error messages
    options.excludeSwitches('enable-logging');
    options.addArguments('--log-level=3'); // Only fatal errors
    options.addArguments('--silent');
    options.addArguments('--disable-logging');
    
   
    // Set timeouts
   
        
    const chromedriverPath = path.resolve(process.cwd(), 'drivers', 'chromedriver.exe');
    const serviceBuilder = new ServiceBuilder(chromedriverPath);

        // options.addArguments('--headless');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1920,1080');
    options.addArguments('--start-maximized');

    this.driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .setChromeService(serviceBuilder)
      .build();

    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000,
    });
  }

  async navigateToLogin(): Promise<void> {
    
    if (!this.driver) throw new Error('Driver not initialized');

    console.log('Navigating to Providence login page...');
    await this.driver.get('https://providence.gobolt.com/login');
    await this.driver.wait(until.elementLocated(By.id('normal_login_email')), 15000);
  }

  async login(normal_login_email: string, normal_login_password: string): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');

    console.log('Attempting to login with provided credentials...');

    await this.driver.wait(until.elementLocated(By.id('normal_login_email')), 15000);

    const normal_login_emailField = await this.driver.findElement(By.id('normal_login_email'));
    const normal_login_passwordField = await this.driver.findElement(By.id('normal_login_password'));

    await normal_login_emailField.clear();
    await normal_login_emailField.sendKeys(normal_login_email);
    await normal_login_passwordField.clear();
    await normal_login_passwordField.sendKeys(normal_login_password);

    const submitButton = await this.driver.findElement(By.css('button[type="submit"]'));
    await submitButton.click();

    
    console.log('Login successful, redirected to dashboard');
  }

  async selectFacility(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for facility selection modal dialog...');
    
    // Wait for the modal to appear after login
    await this.driver.sleep(1000);
    
    try {
      // Wait for the modal dialog to appear
      console.log('Waiting for facility selection modal...');
      await this.driver.wait(until.elementLocated(By.css('.ant-modal-root, .ant-modal')), 15000);
      
      // Look for the "Select Facility" modal specifically
      const modalSelectors = [
        '.ant-modal-content',
        '.ant-modal-body',
        '[role="dialog"]'
      ];
      
      let modalElement = null;
      for (const selector of modalSelectors) {
        try {
          modalElement = await this.driver.findElement(By.css(selector));
          console.log(`Found modal with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!modalElement) {
        throw new Error('Facility selection modal not found');
      }
      
      // Look for the dropdown within the modal
      const dropdownSelectors = [
        '.ant-select',
        '.ant-select-selector',
        '[role="combobox"]',
        '.ant-select-selection-search-input'
      ];
      
      let dropdownElement = null;
      for (const selector of dropdownSelectors) {
        try {
          dropdownElement = await modalElement.findElement(By.css(selector));
          console.log(`Found dropdown with selector: ${selector}`);
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!dropdownElement) {
        throw new Error('Facility dropdown not found in modal');
      }
      
      // Scroll dropdown into view and click it
      await this.driver.executeScript("arguments[0].scrollIntoView(true);", dropdownElement);
      await this.driver.sleep(1000);
      
      console.log('Clicking facility dropdown...');
      await dropdownElement.click();
      await this.driver.sleep(1000);
      
      // Wait for dropdown options to appear
      await this.driver.wait(until.elementLocated(By.css('.ant-select-dropdown, .rc-virtual-list')), 10000);
      
      // Look for YYZ5 option in the dropdown
      const yyz5Selectors = [
        "//div[@title='YYZ5']",
        "//div[contains(@class, 'ant-select-item') and contains(text(), 'YYZ5')]",
        "//div[contains(@class, 'ant-select-item-option') and contains(text(), 'YYZ5')]",
        "//*[contains(text(), 'YYZ5') and contains(@class, 'ant-select-item')]",
        "//div[@role='option' and contains(text(), 'YYZ5')]"
      ];
      
      let yyz5Element = null;
      for (const selector of yyz5Selectors) {
        try {
          console.log(`Looking for YYZ5 with selector: ${selector}`);
          yyz5Element = await this.driver.findElement(By.xpath(selector));
          console.log('Found YYZ5 option');
          break;
        } catch (e) {
          continue;
        }
      }
      
      if (!yyz5Element) {
        // Try a more generic approach - look for any option containing YYZ5
        try {
          yyz5Element = await this.driver.findElement(By.xpath("//*[contains(text(), 'YYZ5')]"));
          console.log('Found YYZ5 option with generic selector');
        } catch (e) {
          throw new Error('YYZ5 facility option not found in the dropdown');
        }
      }
      
      // Click the YYZ5 option
      await this.driver.executeScript("arguments[0].scrollIntoView(true);", yyz5Element);
      await this.driver.sleep(500);
      await yyz5Element.click();
      console.log('Selected YYZ5 facility');
      await this.driver.sleep(1000);
      
      
    } catch (error) {
      console.error('Error in facility selection:', error);
      throw new Error(`Failed to select facility: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async navigateToInventoryManagement(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for Inventory Management tab...');
    
    // Wait for the main navigation to load
    await this.driver.sleep(3000);
    
    // Look for Inventory Management tab using various selectors
    const inventorySelectors = [
      '[role="tab"][aria-controls*="Inventory"]',
      '[data-node-key="Inventory Management"]',
      '//div[@role="tab" and contains(text(), "Inventory Management")]',
      '//div[contains(@class, "ant-tabs-tab") and contains(text(), "Inventory Management")]',
      '.ant-tabs-tab:contains("Inventory Management")',
      '[aria-labelledby*="Inventory Management"]'
    ];
    
    let inventoryTab = null;
    for (const selector of inventorySelectors) {
      try {
        if (selector.startsWith('//')) {
          inventoryTab = await this.driver.findElement(By.xpath(selector));
        } else {
          inventoryTab = await this.driver.findElement(By.css(selector));
        }
        console.log(`Found Inventory Management tab with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!inventoryTab) {
      throw new Error('Inventory Management tab not found');
    }
    
    // Scroll into view and click
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", inventoryTab);
    await this.driver.sleep(1000);
    
    console.log('Clicking Inventory Management tab...');
    await inventoryTab.click();
    
    // Wait for the tab content to load
    await this.driver.sleep(3000);
    console.log('Inventory Management tab opened successfully');
  }
  
  async navigateToManualItems(): Promise<void> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log('Looking for Manual Items section...');
    
    // Look for Manual Items card/button using various selectors
    const manualItemsSelectors = [
      '//div[contains(@class, "sc-eldPxv") and contains(text(), "MANUAL ITEMS")]',
      '//div[contains(text(), "MANUAL ITEMS")]',
      '[data-testid="manual-items"]',
      '.manual-items-card',
      '//div[contains(@class, "ant-col") and .//div[contains(text(), "MANUAL")]]',
      '//div[contains(@class, "card") and contains(text(), "MANUAL")]'
    ];
    
    let manualItemsElement = null;
    for (const selector of manualItemsSelectors) {
      try {
        if (selector.startsWith('//')) {
          manualItemsElement = await this.driver.findElement(By.xpath(selector));
        } else {
          manualItemsElement = await this.driver.findElement(By.css(selector));
        }
        console.log(`Found Manual Items with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!manualItemsElement) {
      throw new Error('Manual Items section not found');
    }
    
    // Scroll into view and click
    await this.driver.executeScript("arguments[0].scrollIntoView(true);", manualItemsElement);
    await this.driver.sleep(1000);
    
    console.log('Clicking Manual Items...');
    await manualItemsElement.click();
    
    // Wait for Manual Items page to load
    await this.driver.sleep(3000);
    
    // Verify we're on the Manual Items page by looking for the search input
    try {
      await this.driver.wait(until.elementLocated(By.css('input[placeholder*="Search"], input[placeholder*="search"]')), 10000);
      console.log('Manual Items page loaded successfully');
    } catch (error) {
      console.log('Manual Items page may have loaded, continuing...');
    }
  }


  //  updation 


  async searchOrder(orderNumber: string): Promise<any> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    console.log(`Searching for order: ${orderNumber}`);
    
    const searchSelectors = [
      'input[placeholder*="Search code, order #, organization, customer"]',
      'input.ant-input.ant-input-lg.css-43bhvr',
      'input[autocapitalize="off"][type="search"]',
      '.ant-input-search input',
      'input[placeholder*="search"]',
      'input[type="search"]'
    ];
    
    let searchInput = null;
    for (const selector of searchSelectors) {
      try {
        searchInput = await this.driver.findElement(By.css(selector));
        console.log(`Found search input with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!searchInput) throw new Error('Could not find search input field');
    
    console.log('Clearing search input field...');
    await searchInput.clear();
    await this.driver.sleep(300);
    await searchInput.sendKeys(Key.CONTROL, 'a');
    await this.driver.sleep(200);
    await searchInput.sendKeys(Key.DELETE);
    await this.driver.sleep(300);
    
    const currentValue = await searchInput.getAttribute('value');
    if (currentValue && currentValue.trim() !== '') {
      console.log(`Field still contains: "${currentValue}", clearing again...`);
      await searchInput.clear();
      await this.driver.sleep(300);
    }
    
    console.log(`Entering order number: ${orderNumber}`);
    await searchInput.sendKeys(orderNumber);
    await this.driver.sleep(800);
    
    const enteredValue = await searchInput.getAttribute('value');
    console.log(`Entered value: "${enteredValue}"`);
    
    if (enteredValue !== orderNumber) {
      console.log('Value mismatch, clearing and re-entering...');
      await searchInput.clear();
      await this.driver.sleep(300);
      await searchInput.sendKeys(orderNumber);
      await this.driver.sleep(500);
    }
    
    const searchButtonSelectors = [
      'button.ant-btn.css-43bhvr.ant-btn-default.ant-btn-color-default.ant-btn-variant-outlined.ant-btn-lg.ant-btn-icon-only.ant-input-search-button',
      '.ant-input-search-button',
      '.ant-input-group-addon button',
      'button[type="button"][class*="search-button"]',
      'span.ant-input-group-addon button'
    ];
    
    let searchButton = null;
    for (const selector of searchButtonSelectors) {
      try {
        searchButton = await this.driver.findElement(By.css(selector));
        console.log(`Found search button with selector: ${selector}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (searchButton) {
      await searchButton.click();
      console.log('Clicked search button');
    } else {
      await searchInput.sendKeys(Key.ENTER);
      console.log('Used Enter key to search');
    }
    
    await this.driver.sleep(3000);
    return await this.extractOrderData(orderNumber);
  }

  private async extractOrderData(orderNumber: string): Promise<any> {
    if (!this.driver) throw new Error('Driver not initialized');
    
    const data: any = { locations: [] };
    
    try {
      await this.driver.wait(until.elementLocated(By.css('.ant-table-tbody tr.ant-table-row')), 8000);
      const rows = await this.driver.findElements(By.css('.ant-table-tbody tr.ant-table-row'));
      console.log(`Found ${rows.length} rows in search results`);
      
      if (rows.length > 0) {
        let firstMatch = true;
        for (const row of rows) {
          const cells = await row.findElements(By.css('td'));
          if (cells.length >= 5) {
            const currentOrder = (await cells[4].getText()).trim(); // Order number in column E (index 4)
            console.log(`Checking row with order: ${currentOrder}`);
            
            if (currentOrder === orderNumber) {
              const locationCell = cells[1]; // Location in column B (index 1)
              let location = '';
              try {
                const locationLink = await locationCell.findElement(By.css('a[href*="/locations/"]'));
                location = (await locationLink.getText()).trim();
                console.log(`✅ Found location link: ${location}`);
              } catch (linkError) {
                location = (await locationCell.getText()).trim();
                console.log(`✅ Found location text: ${location}`);
              }
              
              if (location) {
                data.locations.push(location);
              }
              
              if (firstMatch) {
                data.code = (await cells[0].getText()).trim(); // Code in column A (index 0)
                data.organization = (await cells[2].getText()).trim(); // Organization in column C (index 2)
                data.customer = (await cells[3].getText()).trim(); // Customer in column D (index 3)
                data.order = currentOrder;
                firstMatch = false;
              }
            }
          }
        }
        
        if (data.locations.length > 0) {
          console.log(`Extracted data: Code=${data.code}, Locations=${data.locations.join(', ')}, Organization=${data.organization}, Customer=${data.customer}, Order=${data.order}`);
        } else {
          console.log('❌ No locations found for this order');
          data.error = 'No locations found';
        }
      } else {
        console.log('No results found for this order');
        data.error = 'No results found';
      }
    } catch (error) {
      console.error('Error extracting order data:', error);
      data.error = 'Error extracting data';
    }
    
    return data;
  }

   async close(): Promise<void> {
    if (this.driver) {
      try {
        await this.driver.quit(); // cleanly close browser and driver session
      } catch (err) {
        console.error('Error while closing driver:', err);
      }
      this.driver = null;
    }
  }
}