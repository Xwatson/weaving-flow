import * as nodemailer from "nodemailer";
import { Attachment } from "nodemailer/lib/mailer";

/**
 * 邮件配置选项
 */
export interface EmailOptions {
  /** 发件人邮箱 */
  from?: string;
  /** 收件人邮箱，多个收件人用逗号分隔 */
  to: string;
  /** 抄送，多个收件人用逗号分隔 */
  cc?: string;
  /** 密送，多个收件人用逗号分隔 */
  bcc?: string;
  /** 邮件主题 */
  subject: string;
  /** 邮件正文（纯文本） */
  text?: string;
  /** 邮件正文（HTML） */
  html?: string;
  /** 附件列表 */
  attachments?: Attachment[];
  /** 优先级: 'high', 'normal', 'low' */
  priority?: "high" | "normal" | "low";
}

/**
 * SMTP服务器配置
 */
export interface SmtpConfig {
  /** SMTP服务器地址 */
  host: string;
  /** SMTP服务器端口 */
  port: number;
  /** 是否使用安全连接 */
  secure?: boolean;
  /** 认证信息 */
  auth: {
    /** 用户名 */
    user: string;
    /** 密码或授权码 */
    pass: string;
  };
  /** 超时时间（毫秒） */
  timeout?: number;
}

/**
 * 邮件发送结果
 */
export interface EmailResult {
  /** 是否成功 */
  success: boolean;
  /** 消息ID（成功时） */
  messageId?: string;
  /** 错误信息（失败时） */
  error?: Error;
}

/**
 * 邮件服务类
 * 提供静态方法用于发送电子邮件通知
 */
export class EmailService {
  /**
   * 默认SMTP配置
   * 使用前必须通过setDefaultConfig方法设置
   */
  private static defaultConfig: SmtpConfig | null = null;

  /**
   * 设置默认SMTP配置
   * @param config SMTP服务器配置
   */
  public static setDefaultConfig(config: SmtpConfig): void {
    EmailService.defaultConfig = config;
  }

  /**
   * 获取默认SMTP配置
   * @returns 默认SMTP配置
   * @throws 如果未设置默认配置则抛出错误
   */
  public static getDefaultConfig(): SmtpConfig {
    if (!EmailService.defaultConfig) {
      throw new Error("默认SMTP配置未设置，请先调用setDefaultConfig方法");
    }
    return EmailService.defaultConfig;
  }

  /**
   * 创建邮件传输器
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns Nodemailer传输器
   */
  private static createTransporter(config?: SmtpConfig) {
    const smtpConfig = config || EmailService.getDefaultConfig();
    return nodemailer.createTransport(smtpConfig);
  }

  /**
   * 发送邮件
   * @param options 邮件选项
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns 发送结果
   */
  public static async sendEmail(
    options: EmailOptions,
    config?: SmtpConfig
  ): Promise<EmailResult> {
    try {
      const transporter = EmailService.createTransporter(config);

      // 设置默认发件人
      if (!options.from && EmailService.defaultConfig) {
        options.from = EmailService.defaultConfig.auth.user;
      }

      // 发送邮件
      const info = await transporter.sendMail({
        from: options.from,
        to: options.to,
        cc: options.cc,
        bcc: options.bcc,
        subject: options.subject,
        text: options.text,
        html: options.html,
        attachments: options.attachments,
        priority: options.priority,
      });

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      console.error("发送邮件失败:", error);

      return {
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  }

  /**
   * 发送简单文本邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param text 邮件正文
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns 发送结果
   */
  public static async sendTextEmail(
    to: string,
    subject: string,
    text: string,
    config?: SmtpConfig
  ): Promise<EmailResult> {
    return EmailService.sendEmail(
      {
        to,
        subject,
        text,
      },
      config
    );
  }

  /**
   * 发送HTML邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param html HTML正文
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns 发送结果
   */
  public static async sendHtmlEmail(
    to: string,
    subject: string,
    html: string,
    config?: SmtpConfig
  ): Promise<EmailResult> {
    return EmailService.sendEmail(
      {
        to,
        subject,
        html,
      },
      config
    );
  }

  /**
   * 发送带附件的邮件
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param content 邮件正文（可以是text或html）
   * @param attachments 附件列表
   * @param isHtml 是否为HTML内容
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns 发送结果
   */
  public static async sendEmailWithAttachments(
    to: string,
    subject: string,
    content: string,
    attachments: Attachment[],
    isHtml: boolean = false,
    config?: SmtpConfig
  ): Promise<EmailResult> {
    return EmailService.sendEmail(
      {
        to,
        subject,
        ...(isHtml ? { html: content } : { text: content }),
        attachments,
      },
      config
    );
  }

  /**
   * 发送通知邮件（预设格式的HTML邮件）
   * @param to 收件人邮箱
   * @param subject 邮件主题
   * @param message 通知消息
   * @param notificationType 通知类型（info, success, warning, error）
   * @param config SMTP配置，如不提供则使用默认配置
   * @returns 发送结果
   */
  public static async sendNotification(
    to: string,
    subject: string,
    message: string,
    notificationType: "info" | "success" | "warning" | "error" = "info",
    config?: SmtpConfig
  ): Promise<EmailResult> {
    // 根据通知类型设置颜色
    const colors = {
      info: "#2196F3",
      success: "#4CAF50",
      warning: "#FF9800",
      error: "#F44336",
    };

    const color = colors[notificationType];

    // 创建HTML模板
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          .notification {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border-left: 4px solid ${color};
            background-color: #f9f9f9;
          }
          .header {
            color: ${color};
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          .message {
            color: #333;
            line-height: 1.5;
          }
          .footer {
            margin-top: 20px;
            font-size: 12px;
            color: #777;
          }
        </style>
      </head>
      <body>
        <div class="notification">
          <div class="header">${subject}</div>
          <div class="message">${message}</div>
          <div class="footer">此邮件由系统自动发送，请勿回复</div>
        </div>
      </body>
      </html>
    `;

    console.log("to", process.env.DEFAULT_SEND_EMAIL_USER);

    return EmailService.sendHtmlEmail(
      (to || process.env.DEFAULT_SEND_EMAIL_USER) as string,
      subject,
      html,
      config
    );
  }
}
