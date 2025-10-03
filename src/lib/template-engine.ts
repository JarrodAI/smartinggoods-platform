export interface BusinessInfo {
  businessName: string
  description: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  website?: string
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
  }
  businessHours: {
    monday: { open: string; close: string; closed: boolean }
    tuesday: { open: string; close: string; closed: boolean }
    wednesday: { open: string; close: string; closed: boolean }
    thursday: { open: string; close: string; closed: boolean }
    friday: { open: string; close: string; closed: boolean }
    saturday: { open: string; close: string; closed: boolean }
    sunday: { open: string; close: string; closed: boolean }
  }
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  duration: number // in minutes
  image?: string
  category: string
}

export interface TemplateData {
  businessInfo: BusinessInfo
  services: Service[]
  gallery: string[]
  testimonials: Testimonial[]
  theme: {
    primaryColor: string
    secondaryColor: string
    fontFamily: string
  }
}

export interface Testimonial {
  id: string
  name: string
  rating: number
  comment: string
  image?: string
}

export class TemplateEngine {
  static generateNailSalonTemplate(data: TemplateData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.businessInfo.businessName} - Professional Nail Salon</title>
    <meta name="description" content="${data.businessInfo.description}">
    <style>
        :root {
            --primary-color: ${data.theme.primaryColor};
            --secondary-color: ${data.theme.secondaryColor};
            --font-family: ${data.theme.fontFamily};
        }
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: var(--font-family), sans-serif; line-height: 1.6; }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
        
        /* Header */
        .header { background: var(--primary-color); color: white; padding: 1rem 0; }
        .nav { display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 1.5rem; font-weight: bold; }
        .nav-links { display: flex; list-style: none; gap: 2rem; }
        .nav-links a { color: white; text-decoration: none; }
        
        /* Hero Section */
        .hero { background: linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/hero-bg.jpg'); 
                background-size: cover; color: white; text-align: center; padding: 4rem 0; }
        .hero h1 { font-size: 3rem; margin-bottom: 1rem; }
        .hero p { font-size: 1.2rem; margin-bottom: 2rem; }
        .cta-button { background: var(--secondary-color); color: white; padding: 1rem 2rem; 
                     text-decoration: none; border-radius: 5px; display: inline-block; }
        
        /* Services Section */
        .services { padding: 4rem 0; }
        .services h2 { text-align: center; margin-bottom: 3rem; font-size: 2.5rem; }
        .services-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem; }
        .service-card { border: 1px solid #ddd; border-radius: 10px; padding: 1.5rem; text-align: center; }
        .service-card h3 { color: var(--primary-color); margin-bottom: 1rem; }
        .service-price { font-size: 1.5rem; font-weight: bold; color: var(--secondary-color); }
        
        /* Contact Section */
        .contact { background: #f8f9fa; padding: 4rem 0; }
        .contact-info { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 2rem; }
        .contact-card { background: white; padding: 2rem; border-radius: 10px; text-align: center; }
        
        /* Footer */
        .footer { background: #333; color: white; text-align: center; padding: 2rem 0; }
        
        @media (max-width: 768px) {
            .hero h1 { font-size: 2rem; }
            .nav-links { display: none; }
        }
    </style>
</head>
<body>
    <header class="header">
        <div class="container">
            <nav class="nav">
                <div class="logo">${data.businessInfo.businessName}</div>
                <ul class="nav-links">
                    <li><a href="#home">Home</a></li>
                    <li><a href="#services">Services</a></li>
                    <li><a href="#gallery">Gallery</a></li>
                    <li><a href="#contact">Contact</a></li>
                </ul>
            </nav>
        </div>
    </header>

    <section class="hero" id="home">
        <div class="container">
            <h1>Welcome to ${data.businessInfo.businessName}</h1>
            <p>${data.businessInfo.description}</p>
            <a href="#contact" class="cta-button">Book Appointment</a>
        </div>
    </section>

    <section class="services" id="services">
        <div class="container">
            <h2>Our Services</h2>
            <div class="services-grid">
                ${data.services.map(service => `
                    <div class="service-card">
                        <h3>${service.name}</h3>
                        <p>${service.description}</p>
                        <div class="service-price">$${service.price}</div>
                        <p>${service.duration} minutes</p>
                    </div>
                `).join('')}
            </div>
        </div>
    </section>

    <section class="contact" id="contact">
        <div class="container">
            <h2>Contact Us</h2>
            <div class="contact-info">
                <div class="contact-card">
                    <h3>Address</h3>
                    <p>${data.businessInfo.address}<br>
                    ${data.businessInfo.city}, ${data.businessInfo.state} ${data.businessInfo.zipCode}</p>
                </div>
                <div class="contact-card">
                    <h3>Phone</h3>
                    <p>${data.businessInfo.phone}</p>
                </div>
                <div class="contact-card">
                    <h3>Email</h3>
                    <p>${data.businessInfo.email}</p>
                </div>
                <div class="contact-card">
                    <h3>Hours</h3>
                    ${Object.entries(data.businessInfo.businessHours).map(([day, hours]) => `
                        <p>${day.charAt(0).toUpperCase() + day.slice(1)}: ${
                            hours.closed ? 'Closed' : `${hours.open} - ${hours.close}`
                        }</p>
                    `).join('')}
                </div>
            </div>
        </div>
    </section>

    <footer class="footer">
        <div class="container">
            <p>&copy; 2024 ${data.businessInfo.businessName}. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>
    `
  }

  static generateRestaurantTemplate(data: TemplateData): string {
    // Similar structure but restaurant-focused
    return `<!-- Restaurant template HTML -->`
  }

  static generateFitnessTemplate(data: TemplateData): string {
    // Similar structure but fitness-focused
    return `<!-- Fitness template HTML -->`
  }
}