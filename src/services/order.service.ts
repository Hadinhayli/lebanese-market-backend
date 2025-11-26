import prisma from '../config/database.js';
import type { CreateOrderInput, UpdateOrderStatusInput, OrderQueryInput } from '../utils/order.validation.js';
import { Prisma } from '@prisma/client';

export const createOrder = async (userId: string, data: CreateOrderInput) => {
  // Validate that all products exist and have sufficient stock
  const productIds = data.items.map(item => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
    },
  });

  if (products.length !== productIds.length) {
    throw new Error('One or more products not found');
  }

  // Check stock availability and calculate total
  let totalAmount = 0;
  const orderItems: Array<{ productId: string; quantity: number; price: number }> = [];

  for (const item of data.items) {
    const product = products.find(p => p.id === item.productId);
    if (!product) {
      throw new Error(`Product ${item.productId} not found`);
    }

    if (product.stock < item.quantity) {
      throw new Error(`Insufficient stock for product ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
    }

    const itemTotal = product.price * item.quantity;
    totalAmount += itemTotal;

    orderItems.push({
      productId: product.id,
      quantity: item.quantity,
      price: product.price,
    });
  }

  // Create order and order items in a transaction
  const order = await prisma.$transaction(async (tx) => {
    // Create the order
    const newOrder = await tx.order.create({
      data: {
        userId,
        status: 'PENDING',
        totalAmount,
        address: data.address,
        phoneNumber: data.phoneNumber,
        notes: data.notes,
        items: {
          create: orderItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Update product stock
    for (const item of orderItems) {
      await tx.product.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return newOrder;
  });

  return order;
};

export const getUserOrders = async (userId: string, query: OrderQueryInput = {}) => {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    userId,
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAllOrders = async (query: OrderQueryInput = {}) => {
  const {
    status,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = query;

  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    ...(status && { status }),
  };

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrderById = async (orderId: string, userId?: string) => {
  const where: Prisma.OrderWhereInput = {
    id: orderId,
    ...(userId && { userId }),
  };

  const order = await prisma.order.findFirst({
    where,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  return order;
};

export const updateOrderStatus = async (orderId: string, data: UpdateOrderStatusInput) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Prevent status changes for cancelled or delivered orders
  if (data.status) {
    if (order.status === 'CANCELLED') {
      throw new Error('Cannot update status of a cancelled order');
    }

    if (order.status === 'DELIVERED' && data.status !== 'DELIVERED') {
      throw new Error('Cannot change status of a delivered order');
    }
  }

  const updateData: any = {};
  if (data.status) {
    updateData.status = data.status;
  }
  if (data.trackingNumber !== undefined) {
    updateData.trackingNumber = data.trackingNumber || null;
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return updatedOrder;
};

export const deleteOrder = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  // Only allow deletion of pending or cancelled orders
  if (order.status !== 'PENDING' && order.status !== 'CANCELLED') {
    throw new Error('Can only delete pending or cancelled orders');
  }

  await prisma.order.delete({
    where: { id: orderId },
  });

  return { message: 'Order deleted successfully' };
};

