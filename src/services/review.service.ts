import prisma from '../config/database.js';
import type { CreateReviewInput, UpdateReviewInput, ReviewQueryInput } from '../utils/review.validation.js';
import { Prisma } from '@prisma/client';

export const getReviews = async (query: ReviewQueryInput = {}) => {
  const {
    productId,
    userId,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {};
  if (productId) where.productId = productId;
  if (userId) where.userId = userId;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  // Transform to include userName
  const transformedReviews = reviews.map(review => ({
    ...review,
    userName: review.user.name,
  }));

  return {
    reviews: transformedReviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getReviewById = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  return {
    ...review,
    userName: review.user.name,
  };
};

export const createReview = async (userId: string, data: CreateReviewInput) => {
  // Check if user already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId: data.productId,
      },
    },
  });

  if (existingReview) {
    throw new Error('You have already reviewed this product');
  }

  // Verify product exists
  const product = await prisma.product.findUnique({
    where: { id: data.productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      userId,
      productId: data.productId,
      rating: data.rating,
      text: data.text,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update product rating and review count
  await updateProductRating(data.productId);

  return {
    ...review,
    userName: review.user.name,
  };
};

export const updateReview = async (reviewId: string, userId: string, data: UpdateReviewInput) => {
  // Check if review exists and belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.userId !== userId) {
    throw new Error('You can only update your own reviews');
  }

  // Update review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.text !== undefined && { text: data.text }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // Update product rating
  await updateProductRating(review.productId);

  return {
    ...updatedReview,
    userName: updatedReview.user.name,
  };
};

export const deleteReview = async (reviewId: string, userId: string, isAdmin: boolean) => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  // Check if user owns the review or is admin
  if (review.userId !== userId && !isAdmin) {
    throw new Error('You can only delete your own reviews');
  }

  const productId = review.productId;

  // Delete review
  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update product rating
  await updateProductRating(productId);

  return { message: 'Review deleted successfully' };
};

// Helper function to update product rating and review count
const updateProductRating = async (productId: string) => {
  const reviews = await prisma.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  if (reviews.length === 0) {
    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: 0,
        reviewCount: 0,
      },
    });
    return;
  }

  const averageRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const reviewCount = reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      reviewCount,
    },
  });
};


