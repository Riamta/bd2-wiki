import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, code } = body;

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Missing required fields', errorCode: 'InvalidRequest' },
        { status: 400 }
      );
    }

    // 转发请求到实际的API
    const response = await fetch(
      'https://loj2urwaua.execute-api.ap-northeast-1.amazonaws.com/prod/coupon',
      {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'accept-language': 'vi,en-US;q=0.9,en;q=0.8',
          'cache-control': 'max-age=0',
          'content-type': 'application/json',
          'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'cross-site',
          'Referer': 'https://redeem.bd2.pmang.cloud/',
          'Referrer-Policy': 'strict-origin-when-cross-origin'
        },
        body: JSON.stringify({
          appId: 'bd2-live',
          userId,
          code
        })
      }
    );

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error in claim-code API route:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
} 