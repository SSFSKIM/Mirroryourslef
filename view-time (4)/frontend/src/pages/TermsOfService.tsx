import React from "react";

const TermsOfService = () => {
  return (
    <div
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{
        __html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Terms of Service - MirrorYourself</title>
            <style>
              body {
                font-family: sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 2rem;
                background-color: #f9f9f9;
                color: #222;
              }
              h1, h2 {
                color: #111;
              }
              a {
                color: #0066cc;
              }
            </style>
          </head>
          <body>
            <h1>Terms of Service for MirrorYourself</h1>
            <p><strong>Effective Date:</strong> 06.20.2025</p>
            <p>These Terms of Service (“Terms”) govern your use of the MirrorYourself mobile and/or web application (“App,” “Service”) operated by [Your Company Name] (“we,” “our,” or “us”). By using MirrorYourself, you agree to be bound by these Terms. If you do not agree to these Terms, do not use the App.</p>

            <h2>1. Description of Service</h2>
            <p>MirrorYourself is an analytics app that provides insights into your YouTube watch behavior, including watch time trends, category preferences, and engagement statistics. To do this, we access your YouTube account data with your consent via Google OAuth and YouTube API Services.</p>

            <h2>2. Eligibility</h2>
            <p>You must be at least 13 years old (or 16 in jurisdictions where required) to use this Service. By using the App, you confirm that you meet the legal age requirement and that the information you provide is accurate and complete.</p>

            <h2>3. Google API Services Disclosure</h2>
            <p>Our use and transfer of information received from Google APIs to any other app will adhere to:</p>
            <ul>
              <li><a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank">Google API Services User Data Policy</a>, including the Limited Use requirements</li>
              <li><a href="https://www.youtube.com/t/terms" target="_blank">YouTube Terms of Service</a></li>
            </ul>

            <h2>4. User Responsibilities</h2>
            <p>By using MirrorYourself, you agree to:</p>
            <ul>
              <li>Use the app for personal, non-commercial purposes only</li>
              <li>Not use the app in a way that violates any applicable laws or regulations</li>
              <li>Not attempt to gain unauthorized access to our systems or other users' data</li>
            </ul>
            <p>You are responsible for maintaining the confidentiality of your login credentials and for any activity conducted under your account.</p>

            <h2>5. Account Linking and Data Access</h2>
            <p>To use MirrorYourself, you must authenticate via your Google account. You may revoke this access at any time at:</p>
            <p><a href="https://myaccount.google.com/permissions" target="_blank">https://myaccount.google.com/permissions</a></p>
            <p>Revoking access may affect your ability to use key features of the app.</p>

            <h2>6. Intellectual Property</h2>
            <p>All content, trademarks, logos, and software used in the app are the property of [Your Company Name] or licensed appropriately. You may not copy, modify, distribute, sell, or lease any part of our service or software.</p>

            <h2>7. Termination</h2>
            <p>We reserve the right to terminate or suspend your access to MirrorYourself at any time, without notice or liability, if you violate these Terms or if required by law. You may stop using the app at any time by uninstalling it or revoking app access from your Google account.</p>

            <h2>8. Disclaimer of Warranties</h2>
            <p>The service is provided “as is” and “as available” without warranties of any kind. We do not guarantee that the app will always be available, secure, or error-free.</p>

            <h2>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, [Your Company Name] shall not be liable for any indirect, incidental, consequential, or punitive damages arising out of or relating to your use of the app.</p>

            <h2>10. Modifications</h2>
            <p>We reserve the right to update these Terms at any time. If we make material changes, we will notify you through the app or by email. Continued use of the app after changes means you accept the new Terms.</p>

            <h2>11. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of [Your Country/State], without regard to conflict of laws principles.</p>

            <h2>12. Contact Information</h2>
            <p>This policy is provided by the developer of MirrorYourself</p>
            <p>If you have any questions about these Terms, please contact us at:</p>
            <p>Email: <a href="mailto:kimmi@ssfs.org">kimmi@ssfs.org</a> / <a href="mailto:supremekim17@gmail.com">supremekim17@gmail.com</a><br />
               Website: <a href="https://www.mirroryourself.org">www.mirroryourself.org</a></p>

          </body>
          </html>
        `,
      }}
    />
  );
};

export default TermsOfService;
