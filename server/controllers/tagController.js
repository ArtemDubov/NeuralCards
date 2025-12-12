// server/controllers/tagController.js
const tagService = require("../services/tagService");

exports.getTags = async (req, res) => {
  try {
    const tags = await tagService.getTags();
    res.json(tags);
  } catch (error) {
    res.status(500).json({ error: "Ошибка получения тегов" });
  }
};

exports.createTag = async (req, res) => {
  try {
    const { name } = req.body;
    const tag = await tagService.createTag(name);
    res.json(tag);
  } catch (error) {
    res.status(500).json({ error: "Ошибка создания тега" });
  }
};
