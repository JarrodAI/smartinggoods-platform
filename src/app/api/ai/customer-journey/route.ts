import { NextRequest, NextResponse } from 'next/server';
import { customerJourneyService } from '@/lib/ai/customer-journey';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'createJourney':
        const journey = await customerJourneyService.createJourney(params);
        return NextResponse.json({ journey });

      case 'createWelcomeSeries':
        const welcomeJourney = await customerJourneyService.createWelcomeSeriesJourney(
          params.businessId
        );
        return NextResponse.json({ journey: welcomeJourney });

      case 'createWinBack':
        const winBackJourney = await customerJourneyService.createWinBackJourney(
          params.businessId
        );
        return NextResponse.json({ journey: winBackJourney });

      case 'createBirthdaySeries':
        const birthdayJourney = await customerJourneyService.createBirthdayJourney(
          params.businessId
        );
        return NextResponse.json({ journey: birthdayJourney });

      case 'enrollCustomer':
        const enrollment = await customerJourneyService.enrollCustomer(
          params.customerId,
          params.journeyId,
          params.businessId
        );
        return NextResponse.json({ enrollment });

      case 'setupAllJourneys':
        // Set up all predefined journeys for a business
        const welcomeSeries = await customerJourneyService.createWelcomeSeriesJourney(
          params.businessId
        );
        const winBack = await customerJourneyService.createWinBackJourney(
          params.businessId
        );
        const birthday = await customerJourneyService.createBirthdayJourney(
          params.businessId
        );

        return NextResponse.json({
          journeys: {
            welcomeSeries,
            winBack,
            birthday
          },
          message: 'All customer journeys set up successfully'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Customer journey API error:', error);
    return NextResponse.json(
      { error: 'Failed to process customer journey request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const type = searchParams.get('type');
  const active = searchParams.get('active');

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'Customer Journey Automation',
        description: 'Automated customer lifecycle management with welcome series, win-back campaigns, and special occasion messaging',
        endpoints: {
          createWelcomeSeries: 'Set up automated welcome series for new customers',
          createWinBack: 'Create win-back campaigns for inactive customers',
          createBirthdaySeries: 'Set up birthday celebration journeys',
          enrollCustomer: 'Enroll customer in a journey',
          setupAllJourneys: 'Set up all predefined journeys for a business'
        },
        features: [
          'Multi-stage customer journeys',
          'Email and SMS automation',
          'Discount and gift automation',
          'Conditional logic and targeting',
          'Journey analytics and tracking',
          'Welcome series automation',
          'Win-back campaigns',
          'Birthday and anniversary celebrations'
        ]
      });
    }

    const filters: any = {};
    if (type) filters.type = type;
    if (active !== null) filters.active = active === 'true';

    const journeys = await customerJourneyService.getCustomerJourneys(
      businessId,
      filters
    );

    return NextResponse.json({
      businessId,
      journeys,
      count: journeys.length
    });
  } catch (error) {
    console.error('Get customer journeys error:', error);
    return NextResponse.json(
      { error: 'Failed to get customer journeys' },
      { status: 500 }
    );
  }
}
