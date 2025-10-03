'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function PreviewPage() {
  const params = useParams()
  const websiteId = params.websiteId as string
  const [websiteContent, setWebsiteContent] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const loadWebsitePreview = async () => {
      try {
        const response = await fetch(`/api/websites/preview/${websiteId}`)
        if (!response.ok) {
          throw new Error('Failed to load preview')
        }
        const data = await response.json()
        setWebsiteContent(data.html)
      } catch (err) {
        setError('Failed to load website preview')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (websiteId) {
      loadWebsitePreview()
    }
  }, [websiteId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading preview...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Preview Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-lg font-semibold">Website Preview</h1>
          <span className="text-sm text-gray-300">ID: {websiteId}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => window.open(`/preview/${websiteId}?fullscreen=true`, '_blank')}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 text-sm"
          >
            Full Screen
          </button>
          <button
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 text-sm"
          >
            Back
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <iframe
              srcDoc={websiteContent}
              className="w-full h-screen border-0"
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        </div>
      </div>
    </div>
  )
}