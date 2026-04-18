import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async ({ to, subject, html }) => {
  const mailOptions = {
    from: `"Real Estate BD" <${process.env.EMAIL_FROM}>`,
    to,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};

// Notify admin of new lead
export const sendLeadNotification = async (lead) => {
  const html = `
    <h2>New Lead: ${lead.type}</h2>
    <p><strong>Name:</strong> ${lead.name}</p>
    <p><strong>Email:</strong> ${lead.email}</p>
    <p><strong>Phone:</strong> ${lead.phone || "N/A"}</p>
    <p><strong>Message:</strong> ${lead.message || "N/A"}</p>
    ${lead.projectInterest ? `<p><strong>Project Interest:</strong> ${lead.projectInterest}</p>` : ""}
    <p><strong>Submitted At:</strong> ${new Date().toLocaleString()}</p>
  `;
  await sendEmail({
    to: process.env.ADMIN_EMAIL,
    subject: `New ${lead.type} Inquiry from ${lead.name}`,
    html,
  });
};

// Auto-reply to user
export const sendLeadAutoReply = async (lead) => {
  const html = `
    <h2>Thank you for contacting us!</h2>
    <p>Dear ${lead.name},</p>
    <p>We have received your inquiry and our team will get back to you within 24 hours.</p>
    <br/>
    <p>Best regards,<br/>Real Estate BD Team</p>
  `;
  await sendEmail({
    to: lead.email,
    subject: "We received your inquiry",
    html,
  });
};

// export default email;
