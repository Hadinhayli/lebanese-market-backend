import prisma from '../config/database.js';
import type { CreateProductInput, UpdateProductInput, ProductQueryInput } from '../utils/product.validation.js';

export const getAllProducts = async (query: ProductQueryInput) => {
  const {
    categoryId,
    subcategoryId,
    minPrice,
    maxPrice,
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    page = 1,
    limit = 20,
  } = query;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (subcategoryId) {
    where.subcategoryId = subcategoryId;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Build orderBy
  const orderBy: any = {};
  orderBy[sortBy] = sortOrder;

  // Get products and total count
  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
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
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getProductById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
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
  });

  if (!product) {
    throw new Error('Product not found');
  }

  return product;
};

export const createProduct = async (input: CreateProductInput) => {
  // Verify category and subcategory exist and match
  const category = await prisma.category.findUnique({
    where: { id: input.categoryId },
    include: {
      subcategories: true,
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const subcategory = category.subcategories.find(sub => sub.id === input.subcategoryId);
  if (!subcategory) {
    throw new Error('Subcategory not found or does not belong to the specified category');
  }

  const product = await prisma.product.create({
    data: {
      name: input.name,
      description: input.description,
      price: input.price,
      image: input.image,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      stock: input.stock,
      rating: input.rating || 0,
      reviewCount: input.reviewCount || 0,
    },
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
  });

  return product;
};

export const updateProduct = async (id: string, input: UpdateProductInput) => {
  // Check if product exists
  const existingProduct = await prisma.product.findUnique({
    where: { id },
  });

  if (!existingProduct) {
    throw new Error('Product not found');
  }

  // If category or subcategory is being updated, verify they exist and match
  if (input.categoryId || input.subcategoryId) {
    const categoryId = input.categoryId || existingProduct.categoryId;
    const subcategoryId = input.subcategoryId || existingProduct.subcategoryId;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        subcategories: true,
      },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategory) {
      throw new Error('Subcategory not found or does not belong to the specified category');
    }
  }

  const product = await prisma.product.update({
    where: { id },
    data: input,
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
  });

  return product;
};

export const deleteProduct = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await prisma.product.delete({
    where: { id },
  });

  return { message: 'Product deleted successfully' };
};


