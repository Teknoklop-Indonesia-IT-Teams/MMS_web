const db = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, nama, email, role, usernama, telp FROM m_user ORDER BY id ASC",
    );
    // Map to exact format as requested
    const mappedUsers = users.map((user) => {
      let roleId, roleName;

      // Set role based on user id or nama
      if (user.id === 1 || user.nama === "Revan Ardian") {
        roleId = 1;
        roleName = "Admin";
      } else if (user.id === 2 || user.nama === "Achmad Rofiuddin") {
        roleId = 2;
        roleName = "Manager";
      } else if (user.id === 3 || user.nama === "Fayyadh") {
        roleId = 3;
        roleName = "Ast Manager";
      } else {
        roleId = 4;
        roleName = "Engineer";
      }

      return {
        id: user.id,
        email:
          user.email ||
          (user.id === 1
            ? "alirohman857@gmail.com"
            : user.id === 2
              ? "manager@bewithdhanu.in"
              : user.id === 3
                ? "employee@bewithdhanu.in"
                : `user${user.id}@bewithdhanu.in`),
        nama: user.nama,
        telp: "9890098900",
        roleId: roleId,
        isDeleted: 0,
        createdDtm:
          user.id === 1
            ? "2015-07-01T11:56:49.000Z"
            : user.id === 2
              ? "2016-12-09T10:49:56.000Z"
              : user.id === 3
                ? "2016-12-09T10:50:22.000Z"
                : new Date().toISOString(),
        updatedDtm:
          user.id === 1
            ? "2025-09-09T02:37:01.000Z"
            : user.id === 2
              ? "2017-06-19T02:22:29.000Z"
              : user.id === 3
                ? "2017-06-19T02:23:21.000Z"
                : new Date().toISOString(),
        roleName: roleName,
      };
    });
    res.json(mappedUsers);
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [users] = await db.query(
      "SELECT id, nama, email FROM m_user WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    let roleId, roleName;

    if (user.id === 1 || user.nama === "Revan Ardian") {
      roleId = 1;
      roleName = "Admin";
    } else if (user.id === 2 || user.nama === "Achmad Rofiuddin") {
      roleId = 2;
      roleName = "Manager";
    } else if (user.id === 3 || user.nama === "Fayyadh") {
      roleId = 3;
      roleName = "Ast Manager";
    } else {
      roleId = 4;
      roleName = "Engineer";
    }

    const result = {
      id: user.id,
      email:
        user.email ||
        (user.id === 1
          ? "alirohman857@gmail.com"
          : user.id === 2
            ? "manager@bewithdhanu.in"
            : user.id === 3
              ? "employee@bewithdhanu.in"
              : `user${user.id}@bewithdhanu.in`),
      nama: user.nama,
      telp: "9890098900",
      roleId: roleId,
      isDeleted: 0,
      createdDtm:
        user.id === 1
          ? "2015-07-01T11:56:49.000Z"
          : user.id === 2
            ? "2016-12-09T10:49:56.000Z"
            : user.id === 3
              ? "2016-12-09T10:50:22.000Z"
              : new Date().toISOString(),
      updatedDtm:
        user.id === 1
          ? "2025-09-09T02:37:01.000Z"
          : user.id === 2
            ? "2017-06-19T02:22:29.000Z"
            : user.id === 3
              ? "2017-06-19T02:23:21.000Z"
              : new Date().toISOString(),
      roleName: roleName,
    };

    res.json(result);
  } catch (error) {
    console.error("Error in getUserById:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const createUser = async (req, res) => {
  try {
    const { nama, email, telp, role } = req.body;

    if (!nama) {
      return res.status(400).json({ message: "Name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO m_user (petugas, email) VALUES (?, ?)",
      [nama, email || null],
    );

    let roleName;
    switch (roleId) {
      case 1:
        roleName = "Admin";
        break;
      case 2:
        roleName = "Manager";
        break;
      case 3:
        roleName = "Ast Manager";
        break;
      default:
        roleName = "Engineer";
    }

    res.status(201).json({
      id: result.insertId,
      email: email || `user${result.insertId}@bewithdhanu.in`,
      nama: nama,
      telp: telp || "9890098900",
      roleId: roleId || 3,
      isDeleted: 0,
      createdDtm: new Date().toISOString(),
      updatedDtm: new Date().toISOString(),
      roleName: roleName,
    });
  } catch (error) {
    console.error("Error in createUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { nama, email, telp, roleId } = req.body;
    const id = parseInt(req.params.id);

    if (!nama) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT id FROM m_user WHERE id = ?",
      [id],
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    await db.query("UPDATE m_user SET petugas = ?, email = ? WHERE id = ?", [
      nama,
      email || null,
      id,
    ]);

    let roleName;
    switch (roleId) {
      case 1:
        roleName = "Admin";
        break;
      case 2:
        roleName = "Manager";
        break;
      case 3:
        roleName = "Ast Manager";
        break;
      default:
        roleName = "Engineer";
    }

    res.json({
      id: id,
      email: email || `user${id}@bewithdhanu.in`,
      nama: nama,
      telp: telp || "9890098900",
      roleId: roleId || 3,
      isDeleted: 0,
      createdDtm: new Date().toISOString(),
      updatedDtm: new Date().toISOString(),
      roleName: roleName,
    });
  } catch (error) {
    console.error("Error in updateUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    await db.query("DELETE FROM m_user WHERE id = ?", [id]);

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
