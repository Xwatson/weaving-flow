import { chromium } from "playwright";
import { CrawlerConfig, CrawlerResult } from "@weaving-flow/core";

export class CrawlerService {
  private browser: any;

  async initialize() {
    this.browser = await chromium.launch();
  }

  async destroy() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async crawl(config: CrawlerConfig): Promise<CrawlerResult> {
    try {
      const context = await this.browser.newContext();
      const page = await context.newPage();

      await page.goto(config.url);

      if (config.waitFor) {
        if (typeof config.waitFor === "string") {
          await page.waitForSelector(config.waitFor);
        } else {
          await page.waitForTimeout(config.waitFor);
        }
      }

      let data: any;
      if (config.selector) {
        data = await page.$$eval(config.selector, (elements: any[]) =>
          elements.map((el) => ({
            text: el.textContent,
            html: el.innerHTML,
            href: el.href,
          }))
        );
      } else {
        data = await page.content();
      }

      await context.close();

      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }
}
