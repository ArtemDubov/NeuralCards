// server/repositories/tagRepository.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.findAll = async () => {
  return await prisma.tag.findMany({
    include: {
      cardSets: true,
    },
  });
};

exports.create = async (name) => {
  return await prisma.tag.create({
    data: { name },
  });
};
