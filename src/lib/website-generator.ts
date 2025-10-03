import { TemplateData } from './template-engine'

export interface WebsiteConfig {
  userId: string
  websiteId: string
  templateType: string
  templateData: TemplateData
  customDomain?: string
  sslEnabled: boolean
  analyticsId?: string
}

export class WebsiteGenerator {
  static async generateStaticSite(config: WebsiteConfig): Promise<{
    files: { [filename: string]: string }
    assets: string[]
  }> {
    const { templateData, templateType } = config

    // Generate main HTML file
    const indexHtml = this.generateIndexHTML(templateData, templateType)
    
    // Generate CSS file
    const stylesCss = this.generateCSS(templateData.theme)
    
    // Generate JavaScript file
    const mainJs = this.generateJavaScript(config)
    
    // Generate sitemap
    const sitemapXml = this.generateSitemap(config)
    
    // Generate robots.txt
    const robotsTxt = this.generateRobotsTxt(config)

    return {
      files: {
        'index.html': indexHtml,
        'styles.css': stylesCss,
        'main.js': mainJs,
        'sitemap.xml': sitemapXml,
        'robots.txt': robotsTxt,
        'manifest.json': this.generateManifest(templateData.businessInfo)
      },
      assets: [
        // List of required assets (images, fonts, etc.)
        'logo.png',
        'hero-bg.jpg',
        'favicon.ico'
      ]
    }
  }

  private static generateIndexHTML(data: TemplateData, templateType: string): string {
    const { businessInfo, services } = data

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${businessInfo.businessName} - Professional ${templateType.replace('-', ' ').toUpperCase()}</title>
    <meta name="description" content="${businessInfo.description}">
    <meta name="keywords" content="${templateType}, ${businessInfo.city}, ${businessInfo.state}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${businessInfo.businessName}">
    <meta property="og:description" content="${businessInfo.description}">
    <meta property="og:type" content="business.business">
    <meta property="og:url" content="${businessInfo.website || ''}">
    
    <!-- Schema.org markup -->
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "${businessInfo.businessName}",
      "description": "${businessInfo.description}",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "${businessInfo.address}",
        "addressLocality": "${businessInfo.city}",
        "addressRegion": "${businessInfo.state}",
        "postalCode": "${businessInfo.zipCode}"
      },
      "telephone": "${businessInfo.phone}",
      "email": "${businessInfo.email}",
      "url": "${businessInfo.website || ''}"
    }
    </script>
    
    <link rel="stylesheet" href="styles.css">
    <link rel="manifest" href="manifest.json">
    <link rel="icon" href="favicon.ico">
</head>
<body>
    <!-- Navigation -->
    <nav class="navbar">
        <div class="container">
            <div class="nav-brand">${businessInfo.businessName}</div>
            <div class="nav-menu">
                <a href="#home">Home</a>
                <a href="#services">Services</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section id="home" class="hero">
        <div class="container">
            <h1>${businessInfo.businessName}</h1>
            <p class="hero-subtitle">${businessInfo.description}</p>
            <a href="#contact" class="cta-button">Book Now</a>
        </div>
    </section>

    <!-- Services Section -->
    <section id="services" class="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                ${services.map(service => `
                    <div class="service-card">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-price">$${service.price}</div>
                        <div class="service-duration">${service.duration} min</div>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="contact">
        <div class="container">
            <h2>Contact Us</h2>
            <div class="contact-grid">
                <div class="contact-info">
                    <div class="contact-item">
                        <h3>Address</h3>
                        <p>${businessInfo.address}<br>${businessInfo.city}, ${businessInfo.state} ${businessInfo.zipCode}</p>
                    </div>
                    <div class="contact-item">
                        <h3>Phone</h3>
                        <p><a href="tel:${businessInfo.phone}">${businessInfo.phone}</a></p>
                    </div>
                    <div class="contact-item">
                        <h3>Email</h3>
                        <p><a href="mailto:${businessInfo.email}">${businessInfo.email}</a></p>
                    </div>
                </div>
                <div class="contact-form">
                    <form id="contact-form">
                        <input type="text" name="name" placeholder="Your Name" required>
                        <input type="email" name="email" placeholder="Your Email" required>
                        <input type="tel" name="phone" placeholder="Your Phone">
                        <textarea name="message" placeholder="Your Message" required></textarea>
                        <button type="submit">Send Message</button>
                    </form>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${businessInfo.businessName}. All rights reserved.</p>
            <div class="social-links">
                ${businessInfo.socialMedia.facebook ? `<a href="${businessInfo.socialMedia.facebook}">Facebook</a>` : ''}
                ${businessInfo.socialMedia.instagram ? `<a href="${businessInfo.socialMedia.instagram}">Instagram</a>` : ''}
                ${businessInfo.socialMedia.twitter ? `<a href="${businessInfo.socialMedia.twitter}">Twitter</a>` : ''}
            </div>
        </div>
    </footer>

    <script src="main.js"></script>
</body>
</html>`
  }

  private static generateCSS(theme: TemplateData['theme']): string {
    return `
:root {
    --primary-color: ${theme.primaryColor};
    --secondary-color: ${theme.secondaryColor};
    --font-family: ${theme.fontFamily};
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: var(--font-family), -apple-system, BlinkMacSystemFont, sans-serif;
    line-height: 1.6;
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Navigation */
.navbar {
    background: white;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 1000;
}

.navbar .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem 20px;
}

.nav-brand {
    font-size: 1.5rem;
    font-weight: bold;
    color: var(--primary-color);
}

.nav-menu {
    display: flex;
    gap: 2rem;
}

.nav-menu a {
    text-decoration: none;
    color: #333;
    font-weight: 500;
    transition: color 0.3s;
}

.nav-menu a:hover {
    color: var(--primary-color);
}

/* Hero Section */
.hero {
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    color: white;
    text-align: center;
    padding: 8rem 0 4rem;
    margin-top: 70px;
}

.hero h1 {
    font-size: 3.5rem;
    margin-bottom: 1rem;
    font-weight: 700;
}

.hero-subtitle {
    font-size: 1.25rem;
    margin-bottom: 2rem;
    opacity: 0.9;
}

.cta-button {
    display: inline-block;
    background: white;
    color: var(--primary-color);
    padding: 1rem 2rem;
    text-decoration: none;
    border-radius: 50px;
    font-weight: 600;
    transition: transform 0.3s, box-shadow 0.3s;
}

.cta-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
}

/* Services Section */
.services {
    padding: 4rem 0;
    background: #f8f9fa;
}

.services h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

.service-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    transition: transform 0.3s;
}

.service-card:hover {
    transform: translateY(-5px);
}

.service-card h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.25rem;
}

.service-price {
    font-size: 2rem;
    font-weight: bold;
    color: var(--secondary-color);
    margin: 1rem 0;
}

/* Contact Section */
.contact {
    padding: 4rem 0;
}

.contact h2 {
    text-align: center;
    font-size: 2.5rem;
    margin-bottom: 3rem;
    color: var(--primary-color);
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
}

.contact-item {
    margin-bottom: 2rem;
}

.contact-item h3 {
    color: var(--primary-color);
    margin-bottom: 0.5rem;
}

.contact-form {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 15px;
}

.contact-form input,
.contact-form textarea {
    width: 100%;
    padding: 1rem;
    margin-bottom: 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: inherit;
}

.contact-form button {
    background: var(--primary-color);
    color: white;
    padding: 1rem 2rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.contact-form button:hover {
    background: var(--secondary-color);
}

/* Footer */
.footer {
    background: #333;
    color: white;
    text-align: center;
    padding: 2rem 0;
}

.social-links {
    margin-top: 1rem;
}

.social-links a {
    color: white;
    text-decoration: none;
    margin: 0 1rem;
}

/* Responsive Design */
@media (max-width: 768px) {
    .hero h1 {
        font-size: 2.5rem;
    }
    
    .nav-menu {
        display: none;
    }
    
    .contact-grid {
        grid-template-columns: 1fr;
    }
    
    .services-grid {
        grid-template-columns: 1fr;
    }
}
`
  }

  private static generateJavaScript(config: WebsiteConfig): string {
    return `
// Contact form handling
document.getElementById('contact-form').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData);
    
    // TODO: Send to backend API
    console.log('Form submitted:', data);
    
    // Show success message
    alert('Thank you for your message! We will get back to you soon.');
    this.reset();
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Analytics tracking (if enabled)
${config.analyticsId ? `
// Google Analytics
gtag('config', '${config.analyticsId}');

// Track button clicks
document.querySelectorAll('.cta-button').forEach(button => {
    button.addEventListener('click', () => {
        gtag('event', 'click', {
            event_category: 'CTA',
            event_label: button.textContent
        });
    });
});
` : ''}
`
  }

  private static generateSitemap(config: WebsiteConfig): string {
    const baseUrl = config.customDomain 
      ? `https://${config.customDomain}` 
      : `https://${config.userId}-${config.websiteId}.smartinggoods.com`

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>${baseUrl}/</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>1.0</priority>
    </url>
    <url>
        <loc>${baseUrl}/#services</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>${baseUrl}/#contact</loc>
        <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>
</urlset>`
  }

  private static generateRobotsTxt(config: WebsiteConfig): string {
    const baseUrl = config.customDomain 
      ? `https://${config.customDomain}` 
      : `https://${config.userId}-${config.websiteId}.smartinggoods.com`

    return `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml`
  }

  private static generateManifest(businessInfo: TemplateData['businessInfo']): string {
    return JSON.stringify({
      name: businessInfo.businessName,
      short_name: businessInfo.businessName,
      description: businessInfo.description,
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: "#000000",
      icons: [
        {
          src: "favicon.ico",
          sizes: "64x64 32x32 24x24 16x16",
          type: "image/x-icon"
        }
      ]
    }, null, 2)
  }
}