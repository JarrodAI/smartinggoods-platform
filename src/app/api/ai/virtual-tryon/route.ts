import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { VirtualTryOnService } from '@/lib/ai/virtual-tryon';

const tryOnService = new VirtualTryOnService();

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'process_tryon':
        const result = await tryOnService.processVirtualTryOn({
          businessId: session.user.id,
          ...params
        });
        return NextResponse.json({ success: true, result });

      case 'get_design_catalog':
        const catalog = await tryOnService.getDesignCatalog(params.filters);
        return NextResponse.json({ success: true, catalog });

      case 'get_trending_designs':
        const trending = await tryOnService.getTrendingDesigns(params.limit || 10);
        return NextResponse.json({ success: true, designs: trending });

      case 'search_designs':
        const searchResults = await tryOnService.searchDesigns(params.query);
        return NextResponse.json({ success: true, designs: searchResults });

      case 'get_recommendations':
        const recommendations = await tryOnService.getRecommendedDesigns(
          params.userPreferences,
          params.limit || 5
        );
        return NextResponse.json({ success: true, recommendations });

      case 'add_custom_design':
        const designId = await tryOnService.addCustomDesign(params.design);
        return NextResponse.json({ success: true, designId });

      case 'update_popularity':
        await tryOnService.updateDesignPopularity(params.designId, params.increment);
        return NextResponse.json({ success: true });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Virtual try-on API error:', error);
    return NextResponse.json(
      { error: 'Virtual try-on processing failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'design_categories':
        const categories = [
          { id: 'classic', name: 'Classic', description: 'Timeless and elegant designs' },
          { id: 'french', name: 'French', description: 'Classic French manicure styles' },
          { id: 'ombre', name: 'Ombre', description: 'Gradient color transitions' },
          { id: 'glitter', name: 'Glitter', description: 'Sparkly and glamorous designs' },
          { id: 'art', name: 'Nail Art', description: 'Artistic and creative designs' },
          { id: 'seasonal', name: 'Seasonal', description: 'Holiday and seasonal themes' }
        ];
        return NextResponse.json({ success: true, categories });

      case 'color_palette':
        const colors = [
          { hex: '#DC143C', name: 'Classic Red' },
          { hex: '#FF69B4', name: 'Hot Pink' },
          { hex: '#FFD700', name: 'Gold' },
          { hex: '#FFFFFF', name: 'White' },
          { hex: '#000000', name: 'Black' },
          { hex: '#FF6B35', name: 'Orange' },
          { hex: '#98FB98', name: 'Light Green' },
          { hex: '#E6F3FF', name: 'Light Blue' },
          { hex: '#DDA0DD', name: 'Plum' },
          { hex: '#F0E68C', name: 'Khaki' }
        ];
        return NextResponse.json({ success: true, colors });

      case 'nail_shapes':
        const shapes = [
          { id: 'square', name: 'Square', description: 'Classic square shape' },
          { id: 'round', name: 'Round', description: 'Natural rounded shape' },
          { id: 'oval', name: 'Oval', description: 'Elegant oval shape' },
          { id: 'almond', name: 'Almond', description: 'Tapered almond shape' },
          { id: 'coffin', name: 'Coffin', description: 'Trendy coffin/ballerina shape' },
          { id: 'stiletto', name: 'Stiletto', description: 'Dramatic pointed shape' }
        ];
        return NextResponse.json({ success: true, shapes });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Virtual try-on GET API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}