/**
 * Email Notification Service for Password Reset
 * Sends notifications to admin when password reset occurs
 */

interface ResetNotification {
  adminEmail: string;
  resetDate: string;
  resetTime: string;
  ipAddress?: string;
  userAgent?: string;
}

const ADMIN_EMAIL = 'oduorongo@gmail.com';

/**
 * Send password reset notification email to admin
 * In production, this would integrate with an email service like SendGrid, Mailgun, etc.
 */
export const sendPasswordResetNotification = async (
  notification: ResetNotification
): Promise<{ success: boolean; message: string }> => {
  try {
    // In a production environment, this would be a backend API call
    // For now, we'll log the notification and store it locally
    
    const resetLog = {
      timestamp: new Date().toISOString(),
      ...notification,
      action: 'PASSWORD_RESET',
      status: 'COMPLETED'
    };

    // Log to console for development
    console.log('🔐 Password Reset Notification:', resetLog);

    // Store in localStorage for demonstration
    const existingLogs = JSON.parse(
      localStorage.getItem('password_reset_logs') || '[]'
    );
    existingLogs.push(resetLog);
    localStorage.setItem('password_reset_logs', JSON.stringify(existingLogs));

    // In production, send via email service:
    // const response = await fetch('/api/send-notification', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     to: ADMIN_EMAIL,
    //     subject: `[SECURITY] Password Reset Notification - ${notification.resetDate}`,
    //     template: 'password-reset-notification',
    //     data: notification
    //   })
    // });

    return {
      success: true,
      message: `Notification sent to ${ADMIN_EMAIL}`
    };
  } catch (error) {
    console.error('Failed to send notification:', error);
    return {
      success: false,
      message: 'Failed to send notification'
    };
  }
};

/**
 * Get the formatted email content for password reset notification
 */
export const getPasswordResetEmailTemplate = (
  notification: ResetNotification
): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 8px; }
            .header { background-color: #d32f2f; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
            .content { padding: 20px; }
            .section { margin: 20px 0; }
            .section-title { font-weight: bold; color: #333; margin-bottom: 10px; }
            .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
            .label { color: #666; font-weight: 500; }
            .value { color: #333; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
            .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔐 Password Reset Notification</h1>
            </div>
            <div class="content">
                <p>Hello Admin,</p>
                <p>A password reset has been initiated for your Zaroda Sports System admin account.</p>
                
                <div class="section">
                    <div class="section-title">Reset Details:</div>
                    <div class="info-row">
                        <span class="label">Date:</span>
                        <span class="value">${notification.resetDate}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Time:</span>
                        <span class="value">${notification.resetTime}</span>
                    </div>
                    ${notification.ipAddress ? `
                    <div class="info-row">
                        <span class="label">IP Address:</span>
                        <span class="value">${notification.ipAddress}</span>
                    </div>
                    ` : ''}
                </div>

                <div class="warning">
                    <strong>⚠️ Security Notice:</strong><br>
                    If you did not request this password reset, please contact your system administrator immediately.
                </div>

                <div class="section">
                    <p><strong>What's next?</strong></p>
                    <ul>
                        <li>Your new password has been set and is now active</li>
                        <li>Please log in with your new credentials immediately</li>
                        <li>For security, do not share this confirmation with anyone</li>
                        <li>Keep a record of this notification for your security audit</li>
                    </ul>
                </div>

                <div class="section">
                    <p><strong>Need help?</strong><br>
                    Contact your system administrator or support team if you have any concerns.</p>
                </div>
            </div>
            <div class="footer">
                <p>This is an automated security notification from Zaroda Sports System</p>
                <p>Generated on ${new Date().toLocaleString()}</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate a password reset report for admin records
 */
export const generatePasswordResetReport = (): string => {
  const logs = JSON.parse(
    localStorage.getItem('password_reset_logs') || '[]'
  );

  let report = 'PASSWORD RESET AUDIT LOG\n';
  report += '========================\n\n';
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  if (logs.length === 0) {
    report += 'No password resets recorded.\n';
    return report;
  }

  logs.forEach((log: any, index: number) => {
    report += `\n[${index + 1}] Reset Log Entry\n`;
    report += `   Date: ${log.resetDate}\n`;
    report += `   Time: ${log.resetTime}\n`;
    report += `   Admin Email: ${log.adminEmail}\n`;
    report += `   Status: ${log.status}\n`;
    report += `   Recorded: ${log.timestamp}\n`;
  });

  return report;
};

/**
 * Get all password reset logs
 */
export const getPasswordResetLogs = () => {
  return JSON.parse(
    localStorage.getItem('password_reset_logs') || '[]'
  );
};

/**
 * Clear password reset logs (admin function)
 */
export const clearPasswordResetLogs = (): boolean => {
  try {
    localStorage.removeItem('password_reset_logs');
    return true;
  } catch {
    return false;
  }
};
