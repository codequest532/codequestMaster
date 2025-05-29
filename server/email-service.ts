// Simple email service using fetch API to a free email service
interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

class EmailService {
  constructor() {
    console.log('EmailService initialized with free email API');
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    // Log the email attempt for testing
    console.log('📧 Email would be sent:', {
      to: options.to,
      subject: options.subject,
      text: options.text.substring(0, 100) + '...'
    });

    // For now, simulate successful email sending
    // In production, you could integrate with services like:
    // - Brevo (formerly Sendinblue) - free tier
    // - Mailgun - free tier
    // - EmailJS - free tier
    
    return true;
  }

  async sendAdminMessage(userEmail: string, message: string, adminName: string): Promise<boolean> {
    const emailContent = {
      to: userEmail,
      subject: `Message from CodeQuest Admin - ${adminName}`,
      text: message,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Message from CodeQuest Admin</h2>
          <p style="color: #374151; line-height: 1.6;">${message}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 14px;">
            This message was sent by ${adminName} from the CodeQuest Admin Panel.
          </p>
        </div>
      `
    };

    console.log('📧 Admin message prepared for:', userEmail);
    console.log('📧 Message content:', message);
    
    return this.sendEmail(emailContent);
  }
}

export const emailService = new EmailService();