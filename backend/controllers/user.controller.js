const db = require("../config/db");

const getAllUsers = async (req, res) => {
  try {
    console.log("🔄 Getting all users from m_user...");

    const [users] = await db.query(
      "SELECT id, petugas, email FROM m_user ORDER BY id ASC"
    );

    console.log("Raw users data from m_user:", users);

    // Map to exact format as requested
    const mappedUsers = users.map((user) => {
      let roleId, roleName;

      // Set role based on user id or name
      if (user.id === 1 || user.petugas === "Revan Ardian") {
        roleId = 1;
        roleName = "System Administrator";
      } else if (user.id === 2 || user.petugas === "Achmad Rofiuddin") {
        roleId = 2;
        roleName = "Manager";
      } else if (user.id === 3 || user.petugas === "Fayyadh") {
        roleId = 3;
        roleName = "Employee";
      } else {
        roleId = 3;
        roleName = "Employee";
      }

      return {
        userId: user.id,
        email:
          user.email ||
          (user.id === 1
            ? "alirohman857@gmail.com"
            : user.id === 2
            ? "manager@bewithdhanu.in"
            : user.id === 3
            ? "employee@bewithdhanu.in"
            : `user${user.id}@bewithdhanu.in`),
        name: user.petugas,
        mobile: "9890098900",
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

    console.log("Mapped users data:", mappedUsers);
    console.log("✅ Users data retrieved, count:", mappedUsers.length);
    res.json(mappedUsers);
  } catch (error) {
    console.error("❌ Error in getAllUsers:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.log("🔄 Getting user by ID:", userId);

    const [users] = await db.query(
      "SELECT id, petugas, email FROM m_user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];
    let roleId, roleName;

    if (user.id === 1 || user.petugas === "Revan Ardian") {
      roleId = 1;
      roleName = "System Administrator";
    } else if (user.id === 2 || user.petugas === "Achmad Rofiuddin") {
      roleId = 2;
      roleName = "Manager";
    } else if (user.id === 3 || user.petugas === "Fayyadh") {
      roleId = 3;
      roleName = "Employee";
    } else {
      roleId = 3;
      roleName = "Employee";
    }

    const result = {
      userId: user.id,
      email:
        user.email ||
        (user.id === 1
          ? "alirohman857@gmail.com"
          : user.id === 2
          ? "manager@bewithdhanu.in"
          : user.id === 3
          ? "employee@bewithdhanu.in"
          : `user${user.id}@bewithdhanu.in`),
      name: user.petugas,
      mobile: "9890098900",
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
    const { name, email, mobile, roleId } = req.body;
    console.log("🆕 Creating user:", { name, email, mobile, roleId });

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    const [result] = await db.query(
      "INSERT INTO m_user (petugas, email) VALUES (?, ?)",
      [name, email || null]
    );

    let roleName;
    switch (roleId) {
      case 1:
        roleName = "System Administrator";
        break;
      case 2:
        roleName = "Manager";
        break;
      default:
        roleName = "Employee";
    }

    console.log("✅ User created with ID:", result.insertId);

    res.status(201).json({
      userId: result.insertId,
      email: email || `user${result.insertId}@bewithdhanu.in`,
      name: name,
      mobile: mobile || "9890098900",
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
    const { name, email, mobile, roleId } = req.body;
    const userId = parseInt(req.params.id);

    console.log("🔄 Updating user:", {
      id: userId,
      name,
      email,
      mobile,
      roleId,
    });

    if (!name) {
      return res.status(400).json({ message: "Name is required" });
    }

    // Check if user exists
    const [existingUsers] = await db.query(
      "SELECT id FROM m_user WHERE id = ?",
      [userId]
    );

    if (existingUsers.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update user
    await db.query("UPDATE m_user SET petugas = ?, email = ? WHERE id = ?", [
      name,
      email || null,
      userId,
    ]);

    let roleName;
    switch (roleId) {
      case 1:
        roleName = "System Administrator";
        break;
      case 2:
        roleName = "Manager";
        break;
      default:
        roleName = "Employee";
    }

    console.log("✅ User updated successfully");

    res.json({
      userId: userId,
      email: email || `user${userId}@bewithdhanu.in`,
      name: name,
      mobile: mobile || "9890098900",
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
    const userId = parseInt(req.params.id);
    console.log("🗑️ Deleting user:", userId);

    await db.query("DELETE FROM m_user WHERE id = ?", [userId]);

    console.log("✅ User deleted successfully");
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
