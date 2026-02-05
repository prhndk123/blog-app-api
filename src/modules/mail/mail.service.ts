import { createTransport, Transporter } from "nodemailer";
import path, { dirname } from "path";
import fs from "fs/promises";
import handlebars from "handlebars";
import { fileURLToPath } from "url";

export class MailService {
  private transporter: Transporter;
  constructor() {
    this.transporter = createTransport({
      service: "gmail",
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  private renderTemplates = async (templateName: string, context: object) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const templateDir = path.resolve(__dirname, "./templates");

    const templatePath = path.join(templateDir, `${templateName}.hbs`);

    const templateSource = await fs.readFile(templatePath, "utf-8");

    const compiledTemplate = handlebars.compile(templateSource);

    return compiledTemplate(context);
  };
  sendEmail = async (
    to: string,
    subject: string,
    templateName: string,
    context: object,
  ) => {
    const html = await this.renderTemplates(templateName, context);
    await this.transporter.sendMail({
      to,
      subject,
      html,
    });
  };
}
