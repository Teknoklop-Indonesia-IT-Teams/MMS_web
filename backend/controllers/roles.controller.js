const { db } = require("../config/db.js");

const getRoles = async (req, res) => {
  try {
    const [roles] = await db.query(
      "SELECT roleId, roleName FROM tbl_roles WHERE roleName != 'ADMIN'",
    );

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getAllRoles = async (req, res) => {
  try {
    const roles = [
      { roleId: 1, roleName: "admin" },
      { roleId: 2, roleName: "manager" },
      { roleId: 3, roleName: "ast_manager" },
      { roleId: 4, roleName: "engineer" },
    ];
    res.json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const getRoleById = async (req, res) => {
  try {
    const roleId = parseInt(req.params.id);
    const roles = {
      1: { roleId: 1, roleName: "admin" },
      2: { roleId: 2, roleName: "manager" },
      3: { roleId: 3, roleName: "ast_manager" },
      4: { roleId: 4, roleName: "engineer" },
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

const createRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    const [result] = await db.query(
      "INSERT INTO tbl_roles (roleName) VALUES (?)",
      [roleName],
    );

    res.status(201).json({
      roleId: result.insertId,
      roleName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const updateRole = async (req, res) => {
  try {
    const { roleName } = req.body;

    await db.query("UPDATE tbl_roles SET roleName = ? WHERE roleId = ?", [
      roleName,
      req.params.id,
    ]);

    res.json({
      roleId: req.params.id,
      roleName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

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
