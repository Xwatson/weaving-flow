import { BaseNode, NodeInput, NodeOutput } from "../core/BaseNode";
import type { CrawlerConfig, CrawlerResult } from "@weaving-flow/core";

export class CrawlerNode extends BaseNode {
  private crawlerService: any; // 这里应该注入爬虫服务

  constructor(
    id: string,
    flowName: string,
    nodeName: string,
    config: Record<string, any> = {}
  ) {
    super(id, flowName, nodeName, "crawler", config);
  }

  getInputDefinitions(): NodeInput[] {
    return [
      {
        name: "url",
        type: "string",
        required: true,
      },
      {
        name: "selector",
        type: "string",
        required: false,
      },
      {
        name: "waitFor",
        type: "string | number",
        required: false,
      },
      {
        name: "isHeadless",
        type: "boolean",
        required: false,
        default: true,
      },
    ];
  }

  getOutputDefinitions(): NodeOutput[] {
    return [
      {
        name: "result",
        type: "CrawlerResult",
      },
      {
        name: "error",
        type: "Error",
      },
    ];
  }

  async execute(): Promise<void> {
    try {
      const config: CrawlerConfig = {
        url: this.getInput("url"),
        selector: this.getInput("selector"),
        waitFor: this.getInput("waitFor"),
        isHeadless: this.getInput("isHeadless"),
      };

      const result = await this.crawlerService.crawl(config);
      this.setOutput("result", result);
    } catch (error) {
      this.setOutput("error", error);
      throw error;
    }
  }
}
