import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the request body
    const body = await req.json();
    const { promotionId, platform, content } = body;

    if (!promotionId || !platform || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify the promotion exists and belongs to the user
    const promotion = await prisma.promotion.findFirst({
      where: {
        id: promotionId,
        promoterId: session.user.id
      }
    });

    if (!promotion) {
      return NextResponse.json(
        { error: 'Promotion not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create a social media post record
    const socialPost = await prisma.socialPost.create({
      data: {
        promotionId,
        platform,
        content,
        status: 'pending',
        promoterId: session.user.id
      }
    });

    // Here you would integrate with actual social media APIs
    // For now, we'll simulate the posting process
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

    // Update the post status to completed
    await prisma.socialPost.update({
      where: { id: socialPost.id },
      data: { status: 'completed' }
    });

    return NextResponse.json({
      message: `Successfully posted to ${platform}`,
      post: socialPost
    });
  } catch (error) {
    console.error('Error creating social media post:', error);
    return NextResponse.json(
      { error: 'Failed to create social media post' },
      { status: 500 }
    );
  }
} 