const { db } = require("../config/db.js");

// Get all items
const getAllItems = async (req, res) => {
  try {
    const [items] = await db.query(`
      SELECT * FROM tbl_items 
      WHERE isDeleted = 0
      ORDER BY createdDtm DESC
    `);
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get item by ID
const getItemById = async (req, res) => {
  try {
    const [item] = await db.query(
      `
      SELECT * FROM tbl_items 
      WHERE itemId = ? AND isDeleted = 0
    `,
      [req.params.id]
    );

    if (item.length === 0) {
      return res.status(404).json({ message: "Item tidak ditemukan" });
    }
    res.json(item[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new item
const createItem = async (req, res) => {
  try {
    const { itemHeader, itemSub, itemDesc } = req.body;

    let itemImage = "";
    if (req.file) {
      itemImage = req.file.filename;
    }

    const [result] = await db.query(
      "INSERT INTO tbl_items (itemHeader, itemSub, itemDesc, itemImage, isDeleted, createdBy, createdDtm) VALUES (?, ?, ?, ?, 0, 1, NOW())",
      [itemHeader, itemSub, itemDesc, itemImage]
    );

    res.status(201).json({
      itemId: result.insertId,
      itemHeader,
      itemSub,
      itemDesc,
      itemImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update item
const updateItem = async (req, res) => {
  try {
    const { itemHeader, itemSub, itemDesc } = req.body;

    let itemImage = req.body.itemImage || "";
    if (req.file) {
      itemImage = req.file.filename;
    }

    await db.query(
      "UPDATE tbl_items SET itemHeader = ?, itemSub = ?, itemDesc = ?, itemImage = ?, updatedDtm = NOW(), updatedBy = 1 WHERE itemId = ?",
      [itemHeader, itemSub, itemDesc, itemImage, req.params.id]
    );

    res.json({
      itemId: req.params.id,
      itemHeader,
      itemSub,
      itemDesc,
      itemImage,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete item (soft delete)
const deleteItem = async (req, res) => {
  try {
    await db.query(
      "UPDATE tbl_items SET isDeleted = 1, updatedDtm = NOW(), updatedBy = 1 WHERE itemId = ?",
      [req.params.id]
    );
    res.json({ message: "Item berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Restore soft deleted item
const restoreItem = async (req, res) => {
  try {
    await db.query(
      "UPDATE tbl_items SET isDeleted = 0, updatedDtm = NOW(), updatedBy = 1 WHERE itemId = ?",
      [req.params.id]
    );
    res.json({ message: "Item berhasil dipulihkan" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  restoreItem,
};
