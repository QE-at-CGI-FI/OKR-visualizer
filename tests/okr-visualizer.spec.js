import { test, expect } from '@playwright/test';
import fs from 'fs';

test.describe('OKR Visualizer', () => {
  test.beforeEach(async ({ page }) => {
    // Load OKR data from JSON file
    const okrData = JSON.parse(fs.readFileSync('./okr-data-2026-02-25-4.json', 'utf8'));
    
    // Navigate to the OKR visualizer page before each test
    await page.goto('https://qe-at-cgi-fi.github.io/OKR-visualizer/');
    
    // Wait for the page to load completely
    await page.waitForLoadState('networkidle');
    
    // Import the OKR data into localStorage
    await page.evaluate((data) => {
      localStorage.setItem('okr-visualizer-data', JSON.stringify(data));
    }, okrData);
    
    // Reload the page to apply the imported data
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test.afterEach(async ({ page }) => {
    // Close the page after each test
    await page.close();
  });

  test('should open the OKR visualizer page', async ({ page }) => {
    
    // Verify the page title or a key element to ensure it loaded correctly
    await expect(page).toHaveTitle(/OKR/);
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/okr-visualizer-page.png', fullPage: true });
  });

  test('should have basic page structure', async ({ page }) => {
    // Check for basic HTML structure
    const bodyElement = await page.locator('body');
    await expect(bodyElement).toBeVisible();
  });

  test('should show condensed view when print to PowerPoint button is clicked', async ({ page }) => {
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Locate and click the "Print for PowerPoint" button
    const printPptButton = page.locator('#print-ppt-btn');
    await expect(printPptButton).toBeVisible();
    await printPptButton.click();
    
    // Verify the condensed view overlay is displayed
    const condensedView = page.locator('#condensed-view');
    await expect(condensedView).toBeVisible();
    
    // Verify the condensed view has the expected structure
    const condensedContent = page.locator('.condensed-content');
    await expect(condensedContent).toBeVisible();
    
    // Verify the header is present
    const condensedHeader = page.locator('.condensed-header h2');
    await expect(condensedHeader).toHaveText('OKR Overview');
    
    // Verify the close button is present
    const closeButton = page.locator('.condensed-close');
    await expect(closeButton).toBeVisible();
    
    // Verify summary statistics are shown
    const summarySection = page.locator('.condensed-summary');
    await expect(summarySection).toBeVisible();
    
    // Verify objectives columns are present
    const objectiveColumns = page.locator('.condensed-column');
    await expect(objectiveColumns).toHaveCount(3);
    
    // Take a screenshot for visual verification
    await page.screenshot({ path: 'tests/screenshots/condensed-view.png', fullPage: true });
    
    // Close the condensed view by clicking the close button
    await closeButton.click();
    
    // Verify the condensed view is hidden after closing
    await expect(condensedView).toBeHidden();
  });
});