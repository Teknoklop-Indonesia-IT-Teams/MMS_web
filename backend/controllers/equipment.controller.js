import { db } from "../config/db.js";

export const getAllEquipment = async (req, res) => {
  try {
    const [equipment] = await db.query("SELECT * FROM equipment");
    res.json(equipment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getEquipmentById = async (req, res) => {
  try {
    const [equipment] = await db.query("SELECT * FROM equipment WHERE id = ?", [
      req.params.id,
    ]);
    if (equipment.length === 0) {
      return res.status(404).json({ message: "Equipment not found" });
    }
    res.json(equipment[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createEquipment = async (req, res) => {
  try {
    const { name, type, status, location } = req.body;
    const [result] = await db.query(
      "INSERT INTO equipment (name, type, status, location) VALUES (?, ?, ?, ?)",
      [name, type, status, location]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { name, type, status, location } = req.body;
    await db.query(
      "UPDATE equipment SET name = ?, type = ?, status = ?, location = ? WHERE id = ?",
      [name, type, status, location, req.params.id]
    );
    res.json({ id: req.params.id, ...req.body });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    await db.query("DELETE FROM equipment WHERE id = ?", [req.params.id]);
    res.json({ message: "Equipment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
