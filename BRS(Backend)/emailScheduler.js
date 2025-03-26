// emailScheduler.js
import cron from 'node-cron';
import sgMail from '@sendgrid/mail';

// Set up SendGrid API key (ensure this is set in your AWS environment variables)
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/**
 * Dummy function: Replace this with a database query to fetch users who are overdue.
 * Each user object should contain: id, email, name, and overdueDays.
 */
async function getOverdueUsers() {
  // Example data. Replace with your actual DB query.
  return [
    { id: 1, email: 'user1@example.com', name: 'User One', overdueDays: 3 },
    { id: 2, email: 'user2@example.com', name: 'User Two', overdueDays: 8 },
  ];
}

/**
 * Dummy function: Update your DB to record that an email was sent.
 */
async function markUserNotified(userId) {
  console.log(`User ${userId} marked as notified.`);
}

function sendReminderEmail(user, frequency) {
  const msg = {
    to: user.email,
    from: 'no-reply@yourdomain.com', // Use your verified sender email
    subject: 'Reminder: Please submit your receipts',
    text: `Hi ${user.name},\n\nThis is a reminder to submit your receipts. We noticed you haven't submitted receipts for ${user.overdueDays} days.\n\nThank you,\nFinance Team`,
  };

  sgMail
    .send(msg)
    .then(() => {
      console.log(`Email sent to ${user.email} (${frequency} frequency)`);
    })
    .catch((error) => {
      console.error(`Error sending email to ${user.email}:`, error);
    });
}

// Daily scheduled job (runs at midnight) for normal reminders
cron.schedule('0 0 * * *', async () => {
  const users = await getOverdueUsers();
  users.forEach(user => {
    if (user.overdueDays >= 2 && user.overdueDays < 7) {
      sendReminderEmail(user, 'normal');
      markUserNotified(user.id);
    }
  });
});

// Escalated reminder: runs every 10 minutes for users overdue 7 days or more
cron.schedule('*/10 * * * *', async () => {
  const users = await getOverdueUsers();
  users.forEach(user => {
    if (user.overdueDays >= 7) {
      sendReminderEmail(user, 'escalated');
      markUserNotified(user.id);
    }
  });
});

console.log('Email scheduler is running...');