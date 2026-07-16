import type { gearItem, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/src/lib/prisma";

type GearQuery = {
  searchTerm?: string;
  category?: string;
  brand?: string;
  minPrice?: string;
  maxPrice?: string;
  available?: string;
};

// Public
const allGear = async (query: GearQuery): Promise<gearItem[]> => {
  const andConditions: Prisma.gearItemWhereInput[] = [];

  if (query.searchTerm) {
    andConditions.push({
      OR: [
        { name: { contains: query.searchTerm, mode: "insensitive" } },
        { description: { contains: query.searchTerm, mode: "insensitive" } },
        { brand: { contains: query.searchTerm, mode: "insensitive" } },
      ],
    });
  }

  if (query.category) {
    andConditions.push({ category: { slug: query.category } });
  }

  if (query.brand) {
    andConditions.push({
      brand: { contains: query.brand, mode: "insensitive" },
    });
  }

  if (query.minPrice || query.maxPrice) {
    andConditions.push({
      pricePerDay: {
        ...(query.minPrice && { gte: Number(query.minPrice) }),
        ...(query.maxPrice && { lte: Number(query.maxPrice) }),
      },
    });
  }

  if (query.available !== undefined) {
    andConditions.push({ isAvailable: query.available === "true" });
  }

  const gearItems = await prisma.gearItem.findMany({
    where: andConditions.length > 0 ? { AND: andConditions } : {},
    orderBy: { createdAt: "desc" },
    include: {
      category: true,
      provider: { select: { id: true, name: true } },
    },
  });

  return gearItems;
};

// Public
const getGearById = async (gearId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
    include: {
      category: true,
      provider: { select: { id: true, name: true } },
      reviews: {
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!gear) {
    throw new Error("Gear item not found");
  }

  return gear;
};

const providerInventory = async (providerId: string) => {
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
    include: { gearItems: true },
  });

  if (!provider) {
    throw new Error("Provider not found");
  }

  if (provider.role !== "PROVIDER") {
    throw new Error("You are not a provider");
  }

  return provider.gearItems;
};

const newGear = async (
  payload: Omit<
    gearItem,
    "id" | "createdAt" | "updatedAt" | "categoryId" | "providerId"
  >,
  categorySlug: string,
  providerId: string,
): Promise<gearItem> => {
  const {
    name,
    description,
    brand,
    pricePerDay,
    stockQuantity,
    isAvailable,
    imageUrl,
  } = payload;

  const category = await prisma.category.findUnique({
    where: { slug: categorySlug },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  const existingGear = await prisma.gearItem.findFirst({
    where: {
      providerId,
      name: { equals: name, mode: "insensitive" },
      brand: { equals: brand, mode: "insensitive" },
      categoryId: category.id,
    },
  });

  if (existingGear) {
    throw new Error(
      `You already have a listing for "${name}" (${brand}) in this category. Update its stockQuantity instead of creating a duplicate.`,
    );
  }

  const newGearItem = await prisma.gearItem.create({
    data: {
      name,
      description,
      brand,
      pricePerDay,
      stockQuantity,
      isAvailable,
      imageUrl,
      categoryId: category.id,
      providerId,
    },
  });

  return newGearItem;
};

const updateGear = async (
  payload: Partial<gearItem>,
  gearId: string,
  providerId: string,
) => {
  const {
    name,
    description,
    brand,
    pricePerDay,
    stockQuantity,
    isAvailable,
    imageUrl,
  } = payload;

  const gearItem = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gearItem) {
    throw new Error("Gear not found");
  }

  if (gearItem.providerId !== providerId) {
    throw new Error("You are not authorized to update this gear item");
  }

  const updatedGear = await prisma.gearItem.update({
    where: { id: gearId },
    data: {
      name,
      description,
      brand,
      pricePerDay,
      stockQuantity,
      isAvailable,
      imageUrl,
    },
  });

  return updatedGear;
};

const deleteGear = async (gearId: string, providerId: string) => {
  const gear = await prisma.gearItem.findUnique({
    where: { id: gearId },
  });

  if (!gear) {
    throw new Error("Gear not found");
  }

  if (gear.providerId !== providerId) {
    throw new Error("You are not authorized to delete this gear item");
  }

  const deletedGear = await prisma.gearItem.delete({
    where: { id: gearId },
  });
  return deletedGear;
};

export const gearService = {
  allGear,
  getGearById,
  newGear,
  updateGear,
  deleteGear,
  providerInventory,
};
