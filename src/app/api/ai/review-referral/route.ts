import { NextRequest, NextResponse } from 'next/server';
import { reviewReferralService } from '@/lib/ai/review-referral-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'sendReviewRequest':
        const reviewRequest = await reviewReferralService.sendReviewRequest(
          params.customerId,
          params.businessId,
          params.appointmentId,
          params.options
        );
        return NextResponse.json({ reviewRequest });

      case 'createReferralProgram':
        const program = await reviewReferralService.createReferralProgram(
          params.businessId,
          params.programData
        );
        return NextResponse.json({ program });

      case 'sendReferralInvitation':
        const referral = await reviewReferralService.sendReferralInvitation(
          params.referrerId,
          params.businessId,
          params.programId,
          params.refereeContact
        );
        return NextResponse.json({ referral });

      case 'processReferralCompletion':
        const completion = await reviewReferralService.processReferralCompletion(
          params.referralCode,
          params.appointmentValue,
          params.businessId
        );
        return NextResponse.json(completion);

      case 'monitorReviews':
        const alerts = await reviewReferralService.monitorReviews(params.businessId);
        return NextResponse.json({ alerts });

      case 'generateReviewResponse':
        const response = await reviewReferralService.generateReviewResponse(
          params.review,
          params.businessId
        );
        return NextResponse.json({ response });

      case 'setupDefaultProgram':
        // Set up a default referral program for a business
        const defaultProgram = await reviewReferralService.createReferralProgram(
          params.businessId,
          {
            name: 'Friend Referral Program',
            referrerReward: {
              type: 'discount',
              value: 20,
              description: '20% off your next service'
            },
            refereeReward: {
              type: 'discount',
              value: 15,
              description: '15% off your first service'
            },
            conditions: {
              minSpend: 50,
              validityDays: 90,
              requiresCompletion: true
            }
          }
        );
        return NextResponse.json({ program: defaultProgram });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Review/Referral API error:', error);
    return NextResponse.json(
      { error: 'Failed to process review/referral request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const type = searchParams.get('type'); // 'reviews' or 'referrals'
  const programId = searchParams.get('programId');

  try {
    if (!businessId) {
      return NextResponse.json({
        service: 'Review and Referral Automation',
        description: 'Automated review requests, referral programs, and reputation management',
        endpoints: {
          sendReviewRequest: 'Send automated review request to customer',
          createReferralProgram: 'Create referral program with rewards',
          sendReferralInvitation: 'Send referral invitation to potential customer',
          processReferralCompletion: 'Process completed referral and issue rewards',
          monitorReviews: 'Monitor reviews and create reputation alerts',
          generateReviewResponse: 'Generate AI-powered review responses',
          setupDefaultProgram: 'Set up default referral program'
        },
        features: [
          'Automated review request timing',
          'Multi-platform review management (Google, Facebook, Yelp)',
          'Review incentive programs',
          'Referral program automation',
          'Dual reward system (referrer + referee)',
          'Reputation monitoring and alerts',
          'AI-generated review responses',
          'Referral tracking and analytics'
        ]
      });
    }

    if (type === 'reviews') {
      const reviewRequests = await reviewReferralService.getReviewRequests(businessId);
      return NextResponse.json({
        businessId,
        reviewRequests,
        count: reviewRequests.length
      });
    }

    if (type === 'referrals') {
      const analytics = await reviewReferralService.getReferralAnalytics(
        businessId,
        programId || undefined
      );
      return NextResponse.json({
        businessId,
        programId,
        analytics
      });
    }

    // Return overview
    const reviewRequests = await reviewReferralService.getReviewRequests(businessId);
    const referralAnalytics = await reviewReferralService.getReferralAnalytics(businessId);

    return NextResponse.json({
      businessId,
      overview: {
        reviews: {
          total: reviewRequests.length,
          completed: reviewRequests.filter(r => r.status === 'completed').length,
          pending: reviewRequests.filter(r => r.status === 'pending' || r.status === 'sent').length
        },
        referrals: referralAnalytics
      }
    });
  } catch (error) {
    console.error('Get review/referral data error:', error);
    return NextResponse.json(
      { error: 'Failed to get review/referral data' },
      { status: 500 }
    );
  }
}
