import { prisma } from "@/src/lib/prisma";

const getAllUsers = async () => {
  return prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      avatarUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

const updateUserStatus = async (userId: string, newStatus: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new Error("User not found");
  }

  if (user.role === "ADMIN") {
    throw new Error("Cannot change status of an admin account");
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { status: newStatus as any },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
    },
  });

  return updatedUser;
};

const getAllGear = async () => {
  return prisma.gearItem.findMany({
    include: {
      category: true,
      provider: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const getAllRentals = async () => {
  return prisma.rentalOrder.findMany({
    include: {
      customer: { select: { id: true, name: true, email: true } },
      provider: { select: { id: true, name: true, email: true } },
      rentalItems: { include: { gearItem: true } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });
};

export const adminService = {
  getAllUsers,
  updateUserStatus,
  getAllGear,
  getAllRentals,
};
