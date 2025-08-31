import React from "react";

const PrivacyPolicy = () => {
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
            <h1>Privacy Policy for MirrorYourself</h1>
            <p><strong>Effective Date:</strong> 06.20.2025</p>

            <p>At MirrorYourself, your privacy is extremely important to us. This Privacy Policy describes how we collect, use, share, and protect the personal information of users who use our app to track and analyze YouTube watch statistics.</p>

            <h2>1. Information We Collect</h2>
            <h3>a. YouTube Data</h3>
            <p>With your explicit consent, we access and process the following data via the YouTube API Services:</p>
            <ul>
              <li>Your YouTube watch history</li>
              <li>Your subscriptions and playlists (if applicable)</li>
              <li>Your account ID and public channel info</li>
            </ul>
            <p><em>Note: We only access this data after you sign in with your Google account and grant the necessary permissions via OAuth 2.0.</em></p>

            <h3>b. Device & Usage Data</h3>
            <ul>
              <li>Device information (model, OS, language, IP address)</li>
              <li>App usage metrics (screen views, session length)</li>
              <li>Diagnostic logs and crash reports</li>
            </ul>

            <h2>2. How We Use Your Data</h2>
            <p>We use the collected data to:</p>
            <ul>
              <li>Analyze and visualize your YouTube usage trends & statistics</li>
              <li>Generate personal insights (e.g., average watch time, most-watched categories/channels)</li>
              <li>Improve app performance and user experience</li>
              <li>Respond to user inquiries and technical issues</li>
            </ul>
            <p><strong>We do not use your data for advertising or behavioral tracking.</strong></p>

            <h2>3. Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li>Google APIs (YouTube Data API v3)</li>
              <li>Firebase (Authentication, Analytics, Crashlytics)</li>
              <li>[Any others: e.g., Stripe for payments]</li>
            </ul>
            <p>These providers may have access to certain data as required for functionality and are bound by their own privacy policies.</p>

            <p><strong>YouTube API Compliance:</strong> MirrorYourself adheres to the YouTube API Services Terms of Service and Google’s Privacy Policy:</p>
            <ul>
              <li><a href="https://developers.google.com/youtube/terms">YouTube API ToS</a></li>
              <li><a href="https://policies.google.com/privacy">Google Privacy Policy</a></li>
            </ul>

            <h2>4. Data Storage and Security</h2>
            <p>We store your data securely using industry-standard encryption and access controls. All sensitive data is transmitted over secure SSL connections. Data is stored on [e.g., Firebase Firestore / Supabase / AWS] and only retained as long as necessary for the app’s functionality.</p>

            <h2>5. Your Rights and Choices</h2>
            <p>Depending on your jurisdiction, you have the right to:</p>
            <ul>
              <li>Access the personal data we hold about you</li>
              <li>Request correction or deletion of your data</li>
              <li>Withdraw your consent at any time</li>
              <li>Request a copy of your stored data</li>
            </ul>
            <p>You can disconnect your Google account at any time via <a href="https://myaccount.google.com/permissions">Google Permissions</a>.</p>

            <h2>6. Children’s Privacy</h2>
            <p>This app is not intended for children under the age of 13 (or 16 where applicable). We do not knowingly collect data from children. If we learn we have collected personal information from a child, we will delete it promptly.</p>

            <h2>7. Changes to This Policy</h2>
            <p>We may update this Privacy Policy periodically. If changes are significant, we will notify you within the app or by email.</p>

            <h2>8. Contact Us</h2>
            <p>This policy is provided by the developer of MirrorYourself.</p>
            <p>If you have any questions, feedback, or concerns about this policy, please contact us:</p>
            <ul>
              <li>Email: <a href="mailto:kimmi@ssfs.org">kimmi@ssfs.org</a> / <a href="mailto:supremekim17@gmail.com">supremekim17@gmail.com</a></li>
              <li>Website: <a href="https://www.mirroryourself.org">www.mirroryourself.org</a></li>
            </ul>
          </body>
          </html>
        `,
      }}
    />
  );
};

export default PrivacyPolicy;
