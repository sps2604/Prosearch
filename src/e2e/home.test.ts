// src/e2e/home.test.ts
import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import { describe, it, afterAll, beforeAll, expect } from 'vitest';

describe('Homepage Tests', () => {
  let driver: WebDriver;

  // Before all tests, create a new browser session
  beforeAll(async () => {
    // This command now automatically handles downloading the correct driver!
    driver = await new Builder().forBrowser('chrome').build();
    await driver.manage().setTimeouts({ implicit: 10000 }); 
  }, 30000);

  // After all tests, close the browser
  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  }, 30000);

  it('should load the homepage and find the main title', async () => {
    await driver.get('http://localhost:5173/');

    const mainTitle = await driver.wait(
      until.elementLocated(By.xpath('//*[contains(text(), "Professional Search")]')),
      15000
    );

    expect(await mainTitle.isDisplayed()).toBe(true);

    const pageTitle = await driver.getTitle();
    expect(pageTitle).toContain('Vite + React + TS');

    // Add this line to pause the test for 10 seconds (10000 milliseconds)
    await driver.sleep(10000);
  });
});
