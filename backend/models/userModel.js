
const db = require("../config/db");

const User = {
  async findByUsername(username) {
    const [rows] = await db.execute(
      "SELECT * FROM users WHERE username = ?",
      [username]
    );

    return rows[0];
  },

  async findById(id) {
    const [rows] = await db.execute(
      `SELECT id, username, full_name, role
       FROM users
       WHERE id = ?`,
      [id]
    );

    return rows[0];
  },

  async updateFullName(id, fullName) {
    await db.execute(
      "UPDATE users SET full_name = ? WHERE id = ?",
      [fullName, id]
    );

    return this.findById(id);
  },

  async getPasswordHashById(id) {
    const [rows] = await db.execute(
      "SELECT password FROM users WHERE id = ?",
      [id]
    );

    return rows[0]?.password || null;
  },

  async updatePassword(id, passwordHash) {
    await db.execute(
      "UPDATE users SET password = ? WHERE id = ?",
      [passwordHash, id]
    );
  },

  async countByRole(role) {
    const [rows] = await db.execute(
      "SELECT COUNT(*) AS count FROM users WHERE role = ?",
      [role]
    );

    return rows[0].count;
  },
};

module.exports = User;
