import { NextRequest, NextResponse } from 'next/server'
import { TemplateEngine, type TemplateData } from '@/lib/template-engine'

export async function POST(request: NextRequest) {
  try {
    const { templateType, templateData, userId } = await request.json() as {
      templateType: string
      templateData: TemplateData
      userId: string
    }

    let generatedHTML: string

    // Generate HTML based on template type
    switch (templateType) {
      case 'nail-salon':
        generatedHTML = TemplateEngine.generateNailSalonTemplate(templateData)
        break
      case 'restaurant':
        generatedHTML = TemplateEngine.generateRestaurantTemplate(templateData)
        break
      case 'fitness':
        generatedHTML = TemplateEngine.generateFitnessTemplate(templateData)
        break
      default:
        return NextResponse.json(
          { error: 'Invalid template type' },
          { status: 400 }
        )
    }

    // TODO: Save to database
    // await saveUserWebsite({
    //   userId,
    //   templateType,
    //   templateData,
    //   generatedHTML,
    //   status: 'draft'
    // })

    return NextResponse.json({
      success: true,
      previewUrl: `/preview/${userId}`,
      websiteId: `website_${userId}_${Date.now()}`
    })

  } catch (error) {
    console.error('Template customization error:', error)
    return NextResponse.json(
      { error: 'Failed to customize template' },
      { status: 500 }
    )
  }
}