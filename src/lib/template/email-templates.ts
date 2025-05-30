import { SITE } from '@constants/site';

export function sendWelcomeEmailTemplate (name?: string) {
  return `
    <div>
      <h1>Welcome to ${SITE.NAME}!</h1>
      <p>Hi ${name || 'there'},</p>
      <p>Thanks for signing up for ${SITE.NAME}. We're excited to have you on board!</p>
      <p>With your free account, you can create one giveaway right away.</p>
      <p>Ready to get started?</p>
      <a href="${SITE.URL}/dashboard" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Best regards,<br>The ${SITE.NAME} Team</p>
    </div>
  `
};

export function sendPasswordResetEmailTemplate (token: string) {
  const resetUrl = `${SITE.URL}/auth/reset-password?token=${token}`;

  return `
    <div>
        <h1>Reset Your Password</h1>
        <p>Hello,</p>
        <p>We received a request to reset your password for your ${SITE.NAME} account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Reset Password</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
        <p>Best regards,<br>The ${SITE.NAME} Team</p>
    </div>
  `
};

export function sendGiveawayStartedEmailTemplate (email: string, giveawayTitle: string, giveawayId: string) {
  const giveawayUrl = `${SITE.URL}/dashboard/giveaways/${giveawayId}`;

  return `
    <div>
      <h1>Your Giveaway Has Started!</h1>
      <p>Hello,</p>
      <p>Good news! Your giveaway "${giveawayTitle}" has officially started.</p>
      <p>We'll be monitoring comments for your chosen keyword and will automatically send messages to winners.</p>
      <p>You can track the progress in real-time:</p>
      <a href="${giveawayUrl}" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">View Giveaway</a>
      <p>Best regards,<br>The ${SITE.NAME} Team</p>
    </div>
  `;
}

export function sendGiveawayCompletedEmailTemplate (
  email: string,
  giveawayTitle: string,
  giveawayId: string,
  winnerCount: number
) {
  const giveawayUrl = `${SITE.URL}/dashboard/giveaways/${giveawayId}`;

  return `
    <div>
      <h1>Your Giveaway Has Completed!</h1>
      <p>Hello,</p>
      <p>Congratulations! Your giveaway "${giveawayTitle}" has successfully completed.</p>
      <p>We found ${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'} who used your keyword.</p>
      <p>Here's a summary:</p>
      <ul>
        <li>${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'} selected</li>
        <li>Direct messages sent to winners</li>
        <li>Comments from winners have been liked</li>
      </ul>
      <p>View the full details here:</p>
      <a href="${giveawayUrl}" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">View Results</a>
      <p>Best regards,<br>The ${SITE.NAME} Team</p>
    </div>
  `;
}

export function sendSubscriptionConfirmationEmailTemplate (planName: string) {
  return `
    <div>
      <h1>Thank You for Your Subscription!</h1>
      <p>Hello,</p>
      <p>Your ${planName} subscription to ${SITE.NAME} is now active.</p>
      <p>You now have access to all the features included in the ${planName} plan.</p>
      <a href="${SITE.URL}/dashboard" style="display: inline-block; background-color: #0070f3; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin-top: 20px;">Go to Dashboard</a>
      <p>If you have any questions about your subscription, please don't hesitate to contact our support team.</p>
      <p>Best regards,<br>The ${SITE.NAME} Team</p>
    </div>
  `;
}

export const EmailTemplates = {
  WELCOME: sendWelcomeEmailTemplate,
  PASSWORD_RESET: sendPasswordResetEmailTemplate,
  GIVEAWAY_STARTED: sendGiveawayStartedEmailTemplate,
  GIVEAWAY_COMPLETED: sendGiveawayCompletedEmailTemplate,
  SUBSCRIPTION_CONFIRMATION: sendSubscriptionConfirmationEmailTemplate,
};
