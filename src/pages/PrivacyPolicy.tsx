import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="border-b border-[var(--border-default)] bg-gradient-to-b from-[var(--bg-overlay)] to-[var(--bg-base)]">
        <div className="mx-auto max-w-4xl px-4 py-16 lg:px-8 lg:py-20">
          <div className="flex items-center gap-4 mb-6">
            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="size-4" />
                Back to Home
              </Button>
            </Link>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 mb-4">
              <Shield className="size-4 text-[var(--color-emphasis)]" />
              <span className="text-xs font-semibold uppercase text-[var(--color-emphasis)]">Legal</span>
            </div>
            <h1 className="font-display text-4xl font-bold text-[var(--text-default)] mb-4 text-balance">
              Privacy Policy
            </h1>
            <p className="text-base text-[var(--text-subtle)] max-w-2xl mx-auto text-pretty leading-relaxed">
              Last updated: April 10, 2026
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-4xl px-4 py-16 lg:px-8">
        <div className="prose prose-sm max-w-none text-[var(--text-default)]">
          <h2>1. Introduction</h2>
          <p>
            At OctoFlow, we are committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
          </p>
          <p>
            This policy complies with the UK General Data Protection Regulation (UK GDPR) and the Data Protection Act 2018.
          </p>

          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We may collect the following personal information:</p>
          <ul>
            <li><strong>Account Information:</strong> Name, email address, and password when you create an account</li>
            <li><strong>Usage Data:</strong> Information about how you use our service, including calculations performed and pages visited</li>
            <li><strong>Device Information:</strong> IP address, browser type, operating system, and device identifiers</li>
            <li><strong>Location Data:</strong> General location information based on IP address for tariff calculations</li>
            <li><strong>Feature Requests:</strong> Any feature requests you submit through our roadmap system</li>
          </ul>

          <h3>2.2 Cookies and Tracking Technologies</h3>
          <p>We use cookies and similar technologies to enhance your experience. See our Cookie Policy for detailed information.</p>

          <h2>3. How We Use Your Information</h2>
          <p>We use the information we collect for the following purposes:</p>
          <ul>
            <li><strong>Service Provision:</strong> To provide and maintain our payback calculation services</li>
            <li><strong>Account Management:</strong> To create and manage your user account</li>
            <li><strong>Communication:</strong> To send you important updates about our service</li>
            <li><strong>Improvement:</strong> To analyze usage patterns and improve our services</li>
            <li><strong>Legal Compliance:</strong> To comply with legal obligations</li>
            <li><strong>Feature Development:</strong> To process and manage feature requests</li>
          </ul>

          <h2>4. Legal Basis for Processing</h2>
          <p>Under UK GDPR, we process your personal data based on the following lawful bases:</p>
          <ul>
            <li><strong>Consent:</strong> When you explicitly agree to our processing activities</li>
            <li><strong>Contract:</strong> To perform our contractual obligations to you</li>
            <li><strong>Legitimate Interest:</strong> To improve our services and communicate with you</li>
            <li><strong>Legal Obligation:</strong> To comply with applicable laws and regulations</li>
          </ul>

          <h2>5. Information Sharing and Disclosure</h2>
          <p>We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:</p>
          <ul>
            <li><strong>Service Providers:</strong> We may share information with trusted third-party service providers who assist us in operating our website and conducting our business</li>
            <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to legal process</li>
            <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale of assets</li>
            <li><strong>Consent:</strong> With your explicit consent</li>
          </ul>

          <h2>6. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include:
          </p>
          <ul>
            <li>Encryption of data in transit and at rest</li>
            <li>Regular security assessments</li>
            <li>Access controls and authentication</li>
            <li>Secure hosting infrastructure</li>
          </ul>

          <h2>7. Data Retention</h2>
          <p>
            We retain your personal data only as long as necessary for the purposes outlined in this policy, unless a longer retention period is required by law. When we no longer need your data, we will securely delete or anonymize it.
          </p>

          <h2>8. International Data Transfers</h2>
          <p>
            Your data may be transferred to and processed in countries other than the United Kingdom. When we transfer data outside the UK, we ensure appropriate safeguards are in place to protect your data in accordance with UK GDPR requirements.
          </p>

          <h2>9. Your Rights</h2>
          <p>Under UK GDPR, you have the following rights regarding your personal data:</p>
          <ul>
            <li><strong>Right to Access:</strong> Request a copy of your personal data</li>
            <li><strong>Right to Rectification:</strong> Request correction of inaccurate data</li>
            <li><strong>Right to Erasure:</strong> Request deletion of your data</li>
            <li><strong>Right to Restrict Processing:</strong> Request limitation of how we process your data</li>
            <li><strong>Right to Data Portability:</strong> Request transfer of your data</li>
            <li><strong>Right to Object:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
          </ul>

          <h2>10. Cookies</h2>
          <p>
            We use cookies to enhance your browsing experience. For detailed information about our use of cookies, please see our Cookie Policy.
          </p>

          <h2>11. Third-Party Services</h2>
          <p>
            Our service integrates with third-party APIs, including Octopus Energy's API for tariff data. These third parties have their own privacy policies, and we encourage you to review them.
          </p>

          <h2>12. Children's Privacy</h2>
          <p>
            Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13. If we become aware that we have collected personal information from a child under 13, we will take steps to delete such information.
          </p>

          <h2>13. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
          </p>

          <h2>14. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <ul>
            <li><strong>Email:</strong> privacy@octoflow.co.uk</li>
            <li><strong>Data Protection Officer:</strong> dpo@octoflow.co.uk</li>
            <li><strong>Address:</strong> [Company Address], United Kingdom</li>
          </ul>

          <h2>15. Complaints</h2>
          <p>
            If you believe we have not complied with our obligations under UK GDPR, you have the right to lodge a complaint with the Information Commissioner's Office (ICO), the UK's data protection authority.
          </p>
          <ul>
            <li><strong>ICO Contact:</strong> ico.org.uk</li>
            <li><strong>Phone:</strong> 0303 123 1113</li>
          </ul>
        </div>
      </section>
    </div>
  );
}