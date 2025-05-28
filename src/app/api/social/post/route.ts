import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Mock data store
const mockPromotions: Record<string, any> = {
  'promo1': { id: 'promo1', name: 'Test Promotion', promoterId: 'user1' }
};

const mockSocialPosts: Record<string, any> = {};
let nextId = 1;

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
    // For now we'll just mock this check
    const promotion = mockPromotions[promotionId] || 
      { id: promotionId, promoterId: session.user.id };

    if (promotion.promoterId !== session.user.id) {
      return NextResponse.json(
        { error: 'Promotion not found or unauthorized' },
        { status: 404 }
      );
    }

    // Create a social media post record
    const postId = `post${nextId++}`;
    const socialPost = {
      id: postId,
      promotionId,
      platform,
      content,
      status: 'pending',
      promoterId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store in our mock database
    mockSocialPosts[postId] = socialPost;

    // Here you would integrate with actual social media APIs
    // For now, we'll simulate the posting process
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

    // Update the post status to completed
    mockSocialPosts[postId].status = 'completed';
    mockSocialPosts[postId].updatedAt = new Date();

    return NextResponse.json({
      message: `Successfully posted to ${platform}`,
      post: mockSocialPosts[postId]
    });
  } catch (error) {
    console.error('Error creating social media post:', error);
    return NextResponse.json(
      { error: 'Failed to create social media post' },
      { status: 500 }
    );
  }
} 