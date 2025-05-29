// Brevo (formerly Sendinblue) email service - 300 emails/day free
export async function sendPasswordResetEmail(
  userEmail: string,
  tempPassword: string,
  username: string
): Promise<boolean> {
  try {
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || ''
      },
      body: JSON.stringify({
        sender: {
          name: 'CodeQuest Security',
          email: 'ganesan.sixphrase@gmail.com'
        },
        to: [{
          email: userEmail,
          name: username
        }],
        subject: 'CodeQuest - New Temporary Password',
        htmlContent: `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4f46e5; text-align: center;">Temporary Password</h2>
          <p style="color: #374151; line-height: 1.6;">Hello ${username},</p>
          <p style="color: #374151; line-height: 1.6;">Your temporary password is: <strong style="font-size: 18px; color: #1f2937;">${tempPassword}</strong></p>
          <p style="color: #374151; line-height: 1.6;">Please use this to log in and change your password immediately for security.</p>
          <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #f3f4f6; border-radius: 8px;">
            <p style="color: #374151; margin: 0;">Use this temporary password to log in and change it immediately.</p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this password reset, please ignore this email.</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #6b7280; font-size: 12px; text-align: center;">This email was sent by CodeQuest Security System.</p>
        </div>`
      })
    });

    const responseData = await brevoResponse.json();
    
    if (brevoResponse.ok) {
      console.log(`📧 PASSWORD RESET EMAIL SENT:`);
      console.log(`   To: ${userEmail} (${username})`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log(`   Status: Email delivered via Brevo`);
      return true;
    } else {
      console.log(`📧 Password Reset Email Error:`);
      console.log(`   Status: ${brevoResponse.status}`);
      console.log(`   Response:`, responseData);
      return false;
    }
  } catch (error) {
    console.log(`📧 Password reset email service error:`, error);
    return false;
  }
}

export async function sendAdminMessage(
  userEmail: string,
  message: string,
  adminName: string
): Promise<boolean> {
  try {
    // Brevo API integration
    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || ''
      },
      body: JSON.stringify({
        sender: {
          name: `CodeQuest Admin - ${adminName}`,
          email: 'ganesan.sixphrase@gmail.com'
        },
        to: [{
          email: userEmail,
          name: 'CodeQuest User'
        }],
        subject: `Message from CodeQuest Admin - ${adminName}`,
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4f46e5;">Message from CodeQuest Admin</h2>
            <p style="color: #374151; line-height: 1.6;">${message}</p>
            <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
            <p style="color: #6b7280; font-size: 14px;">
              This message was sent by ${adminName} from the CodeQuest Admin Panel.
            </p>
          </div>
        `
      })
    });

    const responseData = await brevoResponse.json();
    
    if (brevoResponse.ok) {
      console.log(`📧 BREVO EMAIL SENT:`);
      console.log(`   From: ${adminName} (Admin)`);
      console.log(`   To: ${userEmail}`);
      console.log(`   Time: ${new Date().toISOString()}`);
      console.log(`   Status: Email delivered via Brevo`);
      console.log(`   Brevo Response:`, responseData);
      return true;
    } else {
      console.log(`📧 Brevo API Error:`);
      console.log(`   Status: ${brevoResponse.status}`);
      console.log(`   Response:`, responseData);
      console.log(`   From: ${adminName} (Admin)`);
      console.log(`   To: ${userEmail}`);
      console.log(`   Message: ${message}`);
      console.log(`   Time: ${new Date().toISOString()}`);
      return false;
    }
  } catch (error) {
    console.log(`📧 Email service fallback:`);
    console.log(`   From: ${adminName} (Admin)`);
    console.log(`   To: ${userEmail}`);
    console.log(`   Message: ${message}`);
    console.log(`   Error: ${error}`);
    return false;
  }
}
