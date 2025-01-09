import { ipcMain } from 'electron';
import puppeteer from 'puppeteer-core';
import type { CrawlerConfig, CrawlerResult } from '@weaving-flow/core';

let browser: any = null;

// 初始化浏览器
const initBrowser = async (isHeadless = false) => {
  if (!browser) {
    browser = await puppeteer.launch({
      headless: isHeadless,
      executablePath: process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    });
  }
};

export const setupCrawlerHandlers = () => {
  // 初始化爬虫
  ipcMain.handle('crawler:init', async () => {
    await initBrowser();
  });

  // 执行爬虫任务
  ipcMain.handle('crawler:execute', async (_, config: CrawlerConfig): Promise<CrawlerResult> => {
    try {
      await initBrowser(config.isHeadless);

      const page = await browser.newPage();
      await page.goto(config.url);

      if (config.waitFor) {
        if (typeof config.waitFor === 'string') {
          await page.waitForSelector(config.waitFor);
        } else {
          await page.waitForTimeout(config.waitFor);
        }
      }

      let result: CrawlerResult = {
        success: true,
        data: null,
        error: null
      };

      if (config.selector) {
        const elements = await page.$$(config.selector);
        result.data = await Promise.all(
          elements.map(async (element: any) => 
            await element.evaluate((el: any) => ({
              text: el.textContent,
              html: el.innerHTML,
              href: el.href
            }))
          )
        );
      } else {
        result.data = await page.content();
      }

      await page.close();
      return result;
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  });

  // 清理爬虫
  ipcMain.handle('crawler:cleanup', async () => {
    if (browser) {
      await browser.close();
      browser = null;
    }
  });
};
