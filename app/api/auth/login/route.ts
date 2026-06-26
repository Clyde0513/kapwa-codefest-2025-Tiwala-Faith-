import { NextRequest, NextResponse } from 'next/server';
import { isAuthorizedEmail, loginAdmin } from '../../../../lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if email is authorized
    if (!isAuthorizedEmail(email)) {
      return NextResponse.json(
        { error: 'Access denied. This email is not authorized for admin access.' },
        { status: 403 }
      );
    }

    const session = await loginAdmin(email, password);

    return NextResponse.json(
      { 
        success: true, 
        message: 'Login successful',
        user: {
          email: session.email,
          name: session.name,
          isAdmin: session.isAdmin,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);

    if (error instanceof Error && error.message.includes('Invalid credentials')) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
