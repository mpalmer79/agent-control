import { prisma } from "@/lib/prisma/client";

export const organizationRepository = {
  list() {
    return prisma.organization.findMany({ orderBy: { createdAt: "asc" } });
  },

  findById(id: string) {
    return prisma.organization.findUnique({ where: { id } });
  },

  findBySlug(slug: string) {
    return prisma.organization.findUnique({ where: { slug } });
  },

  count() {
    return prisma.organization.count();
  },
};
