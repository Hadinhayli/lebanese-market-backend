import prisma from '../config/database.js';

export const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    include: {
      subcategories: {
        orderBy: {
          name: 'asc',
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
};

export const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      subcategories: {
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  return category;
};

export const createCategory = async (name: string) => {
  const category = await prisma.category.create({
    data: {
      name,
    },
    include: {
      subcategories: true,
    },
  });

  return category;
};

export const createSubcategory = async (categoryId: string, name: string) => {
  // Verify category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  const subcategory = await prisma.subCategory.create({
    data: {
      name,
      categoryId,
    },
  });

  return subcategory;
};

export const updateCategory = async (id: string, name: string) => {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Update category
  const updatedCategory = await prisma.category.update({
    where: { id },
    data: { name },
    include: {
      subcategories: {
        orderBy: {
          name: 'asc',
        },
      },
    },
  });

  return updatedCategory;
};

export const deleteCategory = async (id: string) => {
  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
          subcategories: true,
        },
      },
    },
  });

  if (!category) {
    throw new Error('Category not found');
  }

  // Check if category has products
  if (category._count.products > 0) {
    throw new Error(`Cannot delete category. It has ${category._count.products} product(s) associated with it. Please remove or reassign products first.`);
  }

  // Delete category (subcategories will be cascade deleted)
  await prisma.category.delete({
    where: { id },
  });

  return { message: 'Category deleted successfully' };
};

export const updateSubcategory = async (id: string, name: string) => {
  // Check if subcategory exists
  const subcategory = await prisma.subCategory.findUnique({
    where: { id },
  });

  if (!subcategory) {
    throw new Error('Subcategory not found');
  }

  // Update subcategory
  const updatedSubcategory = await prisma.subCategory.update({
    where: { id },
    data: { name },
  });

  return updatedSubcategory;
};

export const deleteSubcategory = async (id: string) => {
  // Check if subcategory exists
  const subcategory = await prisma.subCategory.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!subcategory) {
    throw new Error('Subcategory not found');
  }

  // Check if subcategory has products
  if (subcategory._count.products > 0) {
    throw new Error(`Cannot delete subcategory. It has ${subcategory._count.products} product(s) associated with it. Please remove or reassign products first.`);
  }

  // Delete subcategory
  await prisma.subCategory.delete({
    where: { id },
  });

  return { message: 'Subcategory deleted successfully' };
};

