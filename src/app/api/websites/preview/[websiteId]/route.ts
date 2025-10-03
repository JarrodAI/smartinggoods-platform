import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { websiteId: string } }
) {
  try {
    const { websiteId } = params

    // Extract userId from websiteId (assuming format: site_timestamp or userId-websiteId)
    // This is a simplified approach - in production, you'd query the database
    const userId = websiteId.includes('-') ? websiteId.split('-')[0] : 'demo'

    const websiteDir = path.join(process.cwd(), 'generated-sites', userId, websiteId)
    const indexPath = path.join(websiteDir, 'index.html')

    try {
      const html = await fs.readFile(indexPath, 'utf-8')
      return NextResponse.json({ html })
    } catch (fileError) {
      // If file doesn't exist, return a demo preview
      const demoHtml = generateDemoPreview(websiteId)
      return NextResponse.json({ html: demoHtml })
    }

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { error: 'Failed to load preview' },
      { status: 500 }
    )
  }
}

function generateDemoPreview(websiteId: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Website Preview - ${websiteId}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        .header { background: #3B82F6; color: white; padding: 1rem 0; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; }
        
        .hero { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; text-align: center; padding: 4rem 0; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9; }
        .cta-button { background: white; color: #3B82F6; padding: 1rem 2rem; text-decoration: none; border-radius: 50px; font-weight: 600; display: inline-block; }
        
        .services { padding: 4rem 0; background: #f8f9fa; }
        .services h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; color: #3B82F6; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .service-card { background: white; padding: 2rem; border-radius: 15px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        .service-card h3 { color: #3B82F6; margin-bottom: 1rem; }
        .service-price { font-size: 2rem; font-weight: bold; color: #8B5CF6; margin: 1rem 0; }
        
        .contact { padding: 4rem 0; }
        .contact h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; color: #3B82F6; }
        .contact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .contact-card { background: #f8f9fa; padding: 2rem; border-radius: 15px; text-align: center; }
        
        .footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
        
        .preview-banner { background: #FEF3C7; border: 2px solid #F59E0B; color: #92400E; padding: 1rem; text-align: center; font-weight: 600; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .nav-links { display: none; }
            .services-grid { grid-template-columns: 1fr; }
        }
    </style>
</head>
<body>
    <div class="preview-banner">
        🔍 PREVIEW MODE - This is how your website will look to visitors
    </div>

    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">Your Business Name</div>
                <ul class="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Welcome to Your Business</h1>
            <p>Professional services tailored to your needs</p>
            <a href="#contact" class="cta-button">Get Started</a>
        </div>
    </section>

    <section class="services" id="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                <div class="service-card">
                    <h3>Premium Service</h3>
                    <p>High-quality service with attention to detail</p>
                    <div class="service-price">$99</div>
                    <p>60 minutes</p>
                </div>
                <div class="service-card">
                    <h3>Standard Service</h3>
                    <p>Great value service for everyday needs</p>
                    <div class="service-price">$69</div>
                    <p>45 minutes</p>
                </div>
                <div class="service-card">
                    <h3>Basic Service</h3>
                    <p>Essential service to get you started</p>
                    <div class="service-price">$39</div>
                    <p>30 minutes</p>
                </div>
            </div>
        </div>
    </section>

    <section class="contact" id="contact">
        <div class="container">
            <h2>Contact Us</h2>
            <div class="contact-grid">
                <div class="contact-card">
                    <h3>📍 Address</h3>
                    <p>123 Main Street<br>Your City, State 12345</p>
                </div>
                <div class="contact-card">
                    <h3>📞 Phone</h3>
                    <p>(555) 123-4567</p>
                </div>
                <div class="contact-card">
                    <h3>✉️ Email</h3>
                    <p>info@yourbusiness.com</p>
                </div>
                <div class="contact-card">
                    <h3>🕒 Hours</h3>
                    <p>Mon-Fri: 9AM-6PM<br>Sat: 10AM-4PM<br>Sun: Closed</p>
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 Your Business Name. All rights reserved.</p>
        </div>
    </footer>

    <script>
        // Smooth scrolling
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    </script>
</body>
</html>
  `
}