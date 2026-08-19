const fs = require('fs');
const content = `

/**
 * Staff Welcome Email
 */
export async function sendStaffWelcomeEmail(data: {
  staffEmail: string;
  staffName: string;
  role: "admin" | "reception";
}) {
  const loginUrl = data.role === "admin"
    ? "https://flora.ferenc.com/admin/login"
    : "https://flora.ferenc.com/reception/login";

  const detailsHtml = \`
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;" width="40%">Name</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;letter-spacing:0.15em;" align="right">\${data.staffName}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Role</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;text-transform:capitalize;" align="right">\${data.role}</td>
    </tr>
    <tr>
      <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Login Portal</td>
      <td style="padding:6px 0;font-family:Georgia,serif;font-size:14px;color:#c6a15b;" align="right"><a href="\${loginUrl}" style="color:#c6a15b;text-decoration:none;">Sign In Here</a></td>
    </tr>
  \`;

  const html = emailWrapper({
    headline: "Welcome to the Flora Team",
    statusBadge: \`<span style="display:inline-block;padding:4px 12px;background-color:#d4e5d7;color:#1b2a3f;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #b8ccbe;">Account Active</span>\`,
    messageIntro: \`Dear \${data.staffName},<br><br>Welcome to Flora Palazzo! Your staff account has been successfully created. You can now log in to the staff portal using your email address and the password you set.\`,
    detailsHtml,
    callToActionHtml: \`
      <div style="margin:32px 0;text-align:center;">
        <a href="\${loginUrl}" style="display:inline-block;padding:14px 32px;background-color:#1b2a3f;color:#fdfbf6;text-decoration:none;font-family:Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.15em;text-transform:uppercase;border-radius:4px;">Log in to Portal</a>
      </div>
    \`,
  });

  return sendEmail({
    to: data.staffEmail,
    subject: "Welcome to the Flora Team",
    html,
  });
}

/**
 * Staff Removal Email
 */
export async function sendStaffRemovalEmail(data: {
  staffEmail: string;
  staffName: string;
}) {
  const html = emailWrapper({
    headline: "Staff Access Revoked",
    statusBadge: \`<span style="display:inline-block;padding:4px 12px;background-color:#ead3cd;color:#2b2016;font-size:11px;font-weight:600;letter-spacing:0.12em;text-transform:uppercase;border-radius:20px;border:1px solid #d9afa8;">Access Removed</span>\`,
    messageIntro: \`Dear \${data.staffName},<br><br>This is to confirm that your staff access to the Flora Palazzo management system has been successfully revoked. You will no longer be able to sign in to the portal.\`,
    detailsHtml: \`
      <tr>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;" width="40%">Account Status</td>
        <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;letter-spacing:0.15em;" align="right">Closed</td>
      </tr>
      <tr>
        <td style="padding:6px 0;font-family:Arial,sans-serif;font-size:12px;color:#6b6660;text-transform:uppercase;letter-spacing:0.08em;">Action</td>
        <td style="padding:6px 0;font-family:Georgia,serif;font-size:15px;color:#1b2a3f;font-weight:bold;" align="right">Access Revoked</td>
      </tr>
    \`,
  });

  return sendEmail({
    to: data.staffEmail,
    subject: "Update to your Flora Account Access",
    html,
  });
}
`;
fs.appendFileSync('lib/email.ts', content);
