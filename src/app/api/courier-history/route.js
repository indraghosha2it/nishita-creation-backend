// app/api/courier-history/route.js
import { NextResponse } from 'next/server';
import courierFraudService from '@/utils/courierFraudService';

export async function GET(request) {
  try {
    // Get phone number from query parameters
    const { searchParams } = new URL(request.url);
    const phoneNumber = searchParams.get('phone');

    // Validate phone number is provided
    if (!phoneNumber) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Phone number is required' 
        },
        { status: 400 }
      );
    }

    // Get lifetime courier history
    const history = await courierFraudService.getLifetimeHistory(phoneNumber);

    return NextResponse.json({
      success: true,
      data: history
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch courier history' 
      },
      { status: 500 }
    );
  }
}