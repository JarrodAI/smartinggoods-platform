'use client'

import { useParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import TemplateCustomizer from '@/components/template-customizer'
import { TemplateData } from '@/lib/template-engine'

export default function BuilderPage() {
  const params = useParams()
  const router = useRouter()
  const templateType = params.templateType as string
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDeploying, setIsDeploying] = useState(false)
  const [generatedWebsite, setGeneratedWebsite] = useState<{
    websiteId: string
    previewUrl: string
  } | null>(null)

  const handleSave = async (templateData: TemplateData) => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/websites/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'demo-user', // TODO: Get from auth session
          templateType,
          templateData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate website')
      }

      const result = await response.json()
      setGeneratedWebsite({
        websiteId: result.websiteId,
        previewUrl: result.previewUrl
      })

      // Show success message
      alert('Website generated successfully! You can now preview it.')
      
    } catch (error) {
      console.error('Error generating website:', error)
      alert('Failed to generate website. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePreview = async (templateData: TemplateData) => {
    // Generate a temporary preview
    const previewId = `preview_${Date.now()}`
    const previewUrl = `/preview/${previewId}`
    
    // Open preview in new tab
    window.open(previewUrl, '_blank')
  }

  const handleDeploy = async () => {
    if (!generatedWebsite) return

    setIsDeploying(true)
    try {
      const response = await fetch('/api/templates/deploy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          websiteId: generatedWebsite.websiteId,
          userId: 'demo-user', // TODO: Get from auth session
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to deploy website')
      }

      const result = await response.json()
      
      // Redirect to success page or dashboard
      router.push(`/dashboard?deployed=${result.deploymentId}`)
      
    } catch (error) {
      console.error('Error deploying website:', error)
      alert('Failed to deploy website. Please try again.')
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Build Your {templateType.replace('-', ' ').toUpperCase()} Website
              </h1>
              <p className="text-gray-600 mt-2">
                Customize your template with your business information
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {generatedWebsite && (
                <>
                  <a
                    href={generatedWebsite.previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700"
                  >
                    View Preview
                  </a>
                  <button
                    onClick={handleDeploy}
                    disabled={isDeploying}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                  >
                    {isDeploying ? 'Deploying...' : 'Deploy Website'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <span className="text-sm font-medium text-blue-600">Customize</span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                generatedWebsite 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                generatedWebsite ? 'text-blue-600' : 'text-gray-500'
              }`}>
                Preview
              </span>
            </div>
            <div className="flex-1 h-px bg-gray-200"></div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 text-gray-500 rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <span className="text-sm font-medium text-gray-500">Deploy</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {isGenerating && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Generating Your Website</h3>
                <p className="text-gray-600">
                  Please wait while we create your personalized website...
                </p>
              </div>
            </div>
          </div>
        )}

        <TemplateCustomizer
          templateType={templateType}
          onSave={handleSave}
          onPreview={handlePreview}
        />

        {generatedWebsite && (
          <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-green-600 mb-2">
                  ✅ Website Generated Successfully!
                </h3>
                <p className="text-gray-600">
                  Your website has been generated and is ready for preview. 
                  When you're satisfied with the result, click "Deploy Website" to make it live.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <a
                  href={generatedWebsite.previewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Preview Website
                </a>
                <button
                  onClick={handleDeploy}
                  disabled={isDeploying}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isDeploying ? 'Deploying...' : 'Deploy Website'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}