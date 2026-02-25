import { test, expect } from '@playwright/test';

test.describe('OKR Visualizer Tests', () => {
  test('seed', async ({ page }) => {
    // generate code here.
    // open to production URL https://qe-at-cgi-fi.github.io/OKR-visualizer/
    await page.goto('https://qe-at-cgi-fi.github.io/OKR-visualizer/');
  });

  test('should show condensed view when print to powerpoint button is pressed', async ({ page }) => {
    // Navigate to the production URL
    await page.goto('https://qe-at-cgi-fi.github.io/OKR-visualizer/');
    
    // Wait for the page to load and the print button to be available
    await page.waitForSelector('#print-ppt-btn');
    
    // Click the "Print for PowerPoint" button
    await page.click('#print-ppt-btn');
    
    // Verify that the condensed view overlay is shown
    await expect(page.locator('#condensed-view')).toBeVisible();
    
    // Verify that the condensed view has the correct class
    await expect(page.locator('#condensed-view')).toHaveClass(/condensed-overlay/);
    
    // Verify that the "OKR Overview" heading is present
    await expect(page.locator('.condensed-header h2')).toHaveText('OKR Overview');
    
    // Verify that the close button is present
    await expect(page.locator('.condensed-close')).toBeVisible();
    
    // Verify that the summary statistics section is present
    await expect(page.locator('.condensed-summary')).toBeVisible();
    
    // Verify that the three-column objectives layout is present
    await expect(page.locator('.condensed-objectives')).toBeVisible();
    await expect(page.locator('.condensed-column')).toHaveCount(3);
    
    // Test that the close button works
    await page.click('.condensed-close');
    await expect(page.locator('#condensed-view')).toBeHidden();
  });

