// server/repositories/cardSetRepository.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.findAllByUser = async (userId) => {
  return await prisma.cardSet.findMany({
    where: { authorId: userId },
    include: {
      cards: true,
      tags: true,
      _count: {
        select: {
          cards: true,
          favoriteCardSets: {
            where: { userId },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

exports.findById = async (id) => {
  return await prisma.cardSet.findUnique({
    where: { id: parseInt(id) },
    include: {
      cards: true,
      tags: true,
      _count: {
        select: {
          favoriteCardSets: true,
        },
      },
    },
  });
};

exports.findByIdSimple = async (id) => {
  return await prisma.cardSet.findUnique({
    where: { id: parseInt(id) },
  });
};

exports.create = async (data) => {
  const { title, description, isPublic, authorId, tags } = data;

  return await prisma.cardSet.create({
    data: {
      title,
      description: description || null,
      isPublic: isPublic || false,
      authorId,
      tags:
        tags && tags.length > 0
          ? {
              connectOrCreate: tags.map((tag) => ({
                where: { name: tag },
                create: { name: tag },
              })),
            }
          : undefined,
    },
    include: {
      cards: true,
      tags: true,
    },
  });
};

exports.update = async (id, data) => {
  const { title, description, isPublic, tags } = data;

  const existingSet = await prisma.cardSet.findUnique({
    where: { id: parseInt(id) },
    include: { tags: true },
  });

  const updateData = {
    title: title !== undefined ? title : existingSet.title,
    description:
      description !== undefined ? description || null : existingSet.description,
    isPublic: isPublic !== undefined ? Boolean(isPublic) : existingSet.isPublic,
  };

  if (tags !== undefined) {
    if (existingSet.tags && existingSet.tags.length > 0) {
      await prisma.cardSet.update({
        where: { id: parseInt(id) },
        data: {
          tags: {
            disconnect: existingSet.tags.map((tag) => ({ id: tag.id })),
          },
        },
      });
    }

    if (Array.isArray(tags) && tags.length > 0) {
      const tagConnections = tags.map((tagName) => ({
        where: { name: tagName.trim() },
        create: { name: tagName.trim() },
      }));

      updateData.tags = {
        connectOrCreate: tagConnections,
      };
    }
  }

  return await prisma.cardSet.update({
    where: { id: parseInt(id) },
    data: updateData,
    include: {
      cards: true,
      tags: true,
    },
  });
};

exports.delete = async (id) => {
  return await prisma.cardSet.delete({
    where: { id: parseInt(id) },
  });
};

exports.search = async (query, userId) => {
  return await prisma.cardSet.findMany({
    where: {
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
        {
          tags: { some: { name: { contains: query, mode: "insensitive" } } },
        },
      ],
      OR: [{ authorId: userId }, { isPublic: true }],
    },
    include: {
      cards: true,
      tags: true,
      _count: {
        select: {
          cards: true,
          favoriteCardSets: {
            where: { userId: userId },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
