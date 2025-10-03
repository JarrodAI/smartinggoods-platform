import Link from 'next/link'
import { Facebook, Twitter, Instagram, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-muted py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                Smarting Goods
              </span>
            </Link>
            <p className="text-muted-foreground">
              Transforming businesses with cutting-edge digital marketing solutions.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted-foreground/10">
                <Facebook className="h-[18px] w-[18px]" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted-foreground/10">
                <Twitter className="h-[18px] w-[18px]" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted-foreground/10">
                <Instagram className="h-[18px] w-[18px]" />
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-muted-foreground/10">
                <Linkedin className="h-[18px] w-[18px]" />
              </Link>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-medium mb-4">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/web-design" className="text-muted-foreground hover:text-foreground transition-colors">
                  Website Design
                </Link>
              </li>
              <li>
                <Link href="/services/web-development" className="text-muted-foreground hover:text-foreground transition-colors">
                  Website Development
                </Link>
              </li>
              <li>
                <Link href="/services/online-marketing" className="text-muted-foreground hover:text-foreground transition-colors">
                  Online Marketing
                </Link>
              </li>
              <li>
                <Link href="/services/ai-social-media" className="text-muted-foreground hover:text-foreground transition-colors">
                  AI Social Media
                </Link>
              </li>
              <li>
                <Link href="/services/domain-hosting" className="text-muted-foreground hover:text-foreground transition-colors">
                  Domain & Hosting
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-lg font-medium mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/templates" className="text-muted-foreground hover:text-foreground transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Stay Updated</h3>
            <p className="text-muted-foreground">
              Subscribe to our newsletter for the latest marketing tips and updates.
            </p>
            <form className="flex flex-col space-y-2">
              <div className="flex">
                <input 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-r-none"
                  placeholder="Your email"
                  type="email"
                />
                <button 
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-l-none"
                  type="submit"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © 2025 Smarting Goods. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}