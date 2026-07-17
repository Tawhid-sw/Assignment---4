import type { category } from "@/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";

const getAllCategorys = async () => {
  const Categorys = await prisma.category.findMany({});
  if (!Categorys || Categorys.length === 0) {
    throw new Error("No categorys found");
  }
  return Categorys;
};

const getCategoryById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const createNewCategory = async (payload: category) => {
  const { name, slug, description, imageUrl } = payload;

  const existingCategory = await prisma.category.findFirst({
    where: { OR: [{ name }, { slug }] },
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const newCategory = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      imageUrl,
    },
  });

  return newCategory;
};

const updateCategory = async (id: string, payload: Partial<category>) => {
  const { name, slug, description, imageUrl } = payload;

  const existingCategory = await prisma.category.findUnique({ where: { id } });
  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const hasChanges =
    (name !== undefined && name !== existingCategory.name) ||
    (slug !== undefined && slug !== existingCategory.slug) ||
    (description !== undefined &&
      description !== existingCategory.description) ||
    (imageUrl !== undefined && imageUrl !== existingCategory.imageUrl);

  if (!hasChanges) {
    throw new Error("No changes detected");
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data: {
      name,
      slug,
      description,
      imageUrl,
    },
  });

  return updatedCategory;
};

const deleteCategory = async (id: string) => {
  const existingCategory = await prisma.category.findUnique({
    where: { id },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const deletedCategory = await prisma.category.delete({
    where: { id },
  });

  return deletedCategory;
};

export const categoryService = {
  getAllCategorys,
  getCategoryById,
  createNewCategory,
  updateCategory,
  deleteCategory,
};
