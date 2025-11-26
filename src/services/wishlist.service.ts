import prisma from '../config/database.js';

export const getWishlist = async (userId: string) => {
  const wishlistItems = await prisma.wishlistItem.findMany({
    where: { userId },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return wishlistItems;
};

export const addToWishlist = async (userId: string, productId: string) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Check if already in wishlist
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    throw new Error('Product is already in your wishlist');
  }

  // Add to wishlist
  const wishlistItem = await prisma.wishlistItem.create({
    data: {
      userId,
      productId,
    },
    include: {
      product: {
        include: {
          category: {
            select: {
              id: true,
              name: true,
            },
          },
          subcategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return wishlistItem;
};

export const removeFromWishlist = async (userId: string, productId: string) => {
  // Check if item exists
  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (!wishlistItem) {
    throw new Error('Item not found in wishlist');
  }

  // Remove from wishlist
  await prisma.wishlistItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return { message: 'Item removed from wishlist' };
};

export const isInWishlist = async (userId: string, productId: string) => {
  const wishlistItem = await prisma.wishlistItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return !!wishlistItem;
};


