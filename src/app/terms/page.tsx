export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-xl text-muted-foreground">
              Last updated: January 1, 2025
            </p>
          </div>

          <div className="prose prose-lg max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">1. Agreement to Terms</h2>
              <p className="text-muted-foreground mb-4">
                By accessing and using SmartingGoods ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
              <p className="text-muted-foreground">
                If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground mb-4">
                SmartingGoods provides website creation, hosting, and digital marketing services through our platform. Our services include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Website template selection and customization</li>
                <li>Web hosting and domain management</li>
                <li>Digital marketing tools and analytics</li>
                <li>Customer support and maintenance</li>
                <li>E-commerce and payment processing integration</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground mb-4">
                To access certain features of our service, you must create an account. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Providing accurate and complete information</li>
                <li>Notifying us immediately of any unauthorized use</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">4. Payment Terms</h2>
              <p className="text-muted-foreground mb-4">
                Our services are provided on a subscription basis. Payment terms include:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Monthly or annual billing cycles</li>
                <li>Automatic renewal unless cancelled</li>
                <li>30-day money-back guarantee for new customers</li>
                <li>Refunds processed within 5-7 business days</li>
                <li>Price changes with 30-day advance notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">5. Acceptable Use Policy</h2>
              <p className="text-muted-foreground mb-4">
                You agree not to use our service for:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Illegal activities or content</li>
                <li>Spam, phishing, or malicious software</li>
                <li>Copyright or trademark infringement</li>
                <li>Harassment, abuse, or hate speech</li>
                <li>Adult content or gambling services</li>
                <li>Activities that could harm our infrastructure</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">6. Intellectual Property</h2>
              <p className="text-muted-foreground mb-4">
                You retain ownership of your content. We retain ownership of our platform, templates, and proprietary technology. By using our service, you grant us a license to host, display, and distribute your content as necessary to provide our services.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">7. Service Availability</h2>
              <p className="text-muted-foreground mb-4">
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We may perform maintenance that temporarily affects availability, with advance notice when possible.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">8. Limitation of Liability</h2>
              <p className="text-muted-foreground mb-4">
                SmartingGoods shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our service. Our total liability is limited to the amount you paid for our services in the 12 months preceding the claim.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">9. Termination</h2>
              <p className="text-muted-foreground mb-4">
                Either party may terminate this agreement at any time. Upon termination:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-2">
                <li>Your access to our services will cease</li>
                <li>We will provide 30 days to export your data</li>
                <li>Prepaid fees are non-refundable except as stated</li>
                <li>We may delete your data after the export period</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">10. Changes to Terms</h2>
              <p className="text-muted-foreground mb-4">
                We reserve the right to modify these terms at any time. We will notify users of significant changes via email or platform notification. Continued use after changes constitutes acceptance of new terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
              <p className="text-muted-foreground mb-4">
                For questions about these Terms of Service, please contact us:
              </p>
              <ul className="list-none text-muted-foreground space-y-2">
                <li>Email: legal@smartinggoods.com</li>
                <li>Phone: +1 (555) 123-4567</li>
                <li>Address: 123 Business Ave, Suite 100, City, State 12345</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}