import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any)?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { rank, category, gender, state } = body;

    const user = await prisma.user.update({
      where: { email: (session.user as any).email },
      data: {
        rank,
        category,
        gender,
        state
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Profile Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
