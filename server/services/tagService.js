// server/services/tagService.js
const tagRepository = require("../repositories/tagRepository");

exports.getTags = async () => {
  try {
    console.log("🔍 [SERVICE] Getting all tags");
    return await tagRepository.findAll();
  } catch (error) {
    console.error("❌ [SERVICE] Error getting tags:", error);
    throw error;
  }
};

exports.createTag = async (name) => {
  try {
    console.log("🔍 [SERVICE] Creating tag:", name);
    return await tagRepository.create(name);
  } catch (error) {
    console.error("❌ [SERVICE] Error creating tag:", error);
    throw error;
  }
};
