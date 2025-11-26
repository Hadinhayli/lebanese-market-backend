import prisma from '../config/database.js';

export const getCartItems = async (userId: string) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: {
      product: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return cartItems;
};

export const addToCart = async (userId: string, productId: string, quantity: number = 1) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stock}`);
  }

  // Check if item already exists in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingItem) {
    // Update quantity
    const newQuantity = existingItem.quantity + quantity;
    if (product.stock < newQuantity) {
      throw new Error(`Insufficient stock. Available: ${product.stock}, Requested: ${newQuantity}`);
    }

    const updatedItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });

    return updatedItem;
  } else {
    // Create new cart item
    const newItem = await prisma.cartItem.create({
      data: {
        userId,
        productId,
        quantity,
      },
      include: {
        product: true,
      },
    });

    return newItem;
  }
};

export const updateCartItemQuantity = async (userId: string, productId: string, quantity: number) => {
  if (quantity <= 0) {
    // Remove item from cart
    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });
    return null;
  }

  // Check product stock
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  if (product.stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${product.stock}`);
  }

  const updatedItem = await prisma.cartItem.update({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
    data: {
      quantity,
    },
    include: {
      product: true,
    },
  });

  return updatedItem;
};

export const removeFromCart = async (userId: string, productId: string) => {
  await prisma.cartItem.delete({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  return { message: 'Item removed from cart' };
};

export const clearCart = async (userId: string) => {
  await prisma.cartItem.deleteMany({
    where: { userId },
  });

  return { message: 'Cart cleared' };
};


