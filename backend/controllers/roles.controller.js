const { db } = require("../config/db.js");

// Get all roles for frontend
const getRoles = async (req, res) => {
  try {
    // Return static roles since we don't have tbl_roles table
    const mappedRoles = [
      {
        id: 1,
        name: "Admin",
        value: "admin",
      },
      {
        id: 2,
        name: "Operator",
        value: "operator",
      },
    ];

    res.json({
      success: true,
      data: mappedRoles.filter((role) => role.value !== "admin"), // Don't allow signup as admin
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Get all roles (original function)
const getAllRoles = async (req, res) => {
  try {
    const roles = [
      { roleId: 1, role: "admin" },
      { roleId: 2, role: "operator" },
    ];
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get role by ID
const getRoleById = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const roles = {
      1: { roleId: 1, role: "admin" },
      2: { roleId: 2, role: "operator" },
    };

    if (roles[roleId]) {
      res.json(roles[roleId]);
    } else {
      res.status(404).json({ message: "Role tidak ditemukan" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create new role
const createRole = async (req, res) => {
  try {
    const { role } = req.body;

    const [result] = await db.query("INSERT INTO tbl_roles (role) VALUES (?)", [
      role,
    ]);

    res.status(201).json({
      roleId: result.insertId,
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const { role } = req.body;

    await db.query("UPDATE tbl_roles SET role = ? WHERE roleId = ?", [
      role,
      req.params.id,
    ]);

    res.json({
      roleId: req.params.id,
      role,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    await db.query("DELETE FROM tbl_roles WHERE roleId = ?", [req.params.id]);
    res.json({ message: "Role berhasil dihapus" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getRoles,
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
};
