import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function InteriorDesignWebsites() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Interior Design Websites
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Create stunning websites for interior designers with AI-powered features
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Portfolio Showcase</h3>
            <p className="text-gray-600 mb-4">
              Beautiful galleries to showcase your interior design projects
            </p>
            <Button asChild>
              <Link href="/templates">View Templates</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Client Management</h3>
            <p className="text-gray-600 mb-4">
              Integrated tools for managing clients and projects
            </p>
            <Button asChild>
              <Link href="/templates">Get Started</Link>
            </Button>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">AI-Powered Content</h3>
            <p className="text-gray-600 mb-4">
              Automatically generate content for your design projects
            </p>
            <Button asChild>
              <Link href="/templates">Learn More</Link>
            </Button>
          </Card>
        </div>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/auth/signup">Start Building Today</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}