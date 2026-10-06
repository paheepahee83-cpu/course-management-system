const db = require("../config/db");


const Enrollment = {

  // ====================================================
  // CREATE ENROLLMENT
  // ====================================================

  async create(studentId, courseId) {

    const [result] = await db.execute(
      `INSERT INTO enrollments
       (student_id, course_id)
       VALUES (?, ?)`,
      [studentId, courseId]
    );


    return result.insertId;
  },


  // ====================================================
  // CHECK EXISTING ENROLLMENT
  // ====================================================

  async findByStudentAndCourse(
    studentId,
    courseId
  ) {

    const [rows] = await db.execute(
      `SELECT *
       FROM enrollments
       WHERE student_id = ?
       AND course_id = ?`,
      [
        studentId,
        courseId
      ]
    );


    return rows[0];
  },


  // ====================================================
  // GET MY ENROLLMENTS
  // ====================================================

  async getByStudent(studentId) {

    const [rows] = await db.execute(
      `SELECT
          e.id,
          e.enrolled_at,
          c.id AS course_id,
          c.title,
          c.category,
          c.level,
          c.duration,
          c.price,
          c.image,
          c.description

       FROM enrollments e

       JOIN courses c
         ON e.course_id = c.id

       WHERE e.student_id = ?

       ORDER BY e.enrolled_at DESC`,
      [studentId]
    );


    return rows;
  },


  // ====================================================
  // GET COURSE ENROLLMENTS
  // ====================================================

  async getByCourse(courseId) {

    const [rows] = await db.execute(
      `SELECT
          e.id,
          e.enrolled_at,
          u.id AS student_id,
          u.username,
          u.full_name

       FROM enrollments e

       JOIN users u
         ON e.student_id = u.id

       WHERE e.course_id = ?

       ORDER BY e.enrolled_at DESC`,
      [courseId]
    );


    return rows;
  },


  // ====================================================
  // GET ALL ENROLLMENTS
  // ====================================================

  async getAll() {

    const [rows] = await db.execute(
      `SELECT
          e.id,
          e.enrolled_at,

          u.id AS student_id,
          u.username,
          u.full_name,

          c.id AS course_id,
          c.title,
          c.category,
          c.level

       FROM enrollments e

       JOIN users u
         ON e.student_id = u.id

       JOIN courses c
         ON e.course_id = c.id

       ORDER BY e.enrolled_at DESC`
    );


    return rows;
  },


  // ====================================================
  // ADMIN DELETE
  // ====================================================

  async delete(id) {

    const [result] = await db.execute(
      `DELETE FROM enrollments
       WHERE id = ?`,
      [id]
    );


    return result;
  },


  // ====================================================
  // STUDENT DELETE
  // ====================================================
  //
  // SECURITY:
  // Checks BOTH enrollment ID and student ID.
  //
  // This prevents:
  //
  // Student A
  //     ↓
  // trying to delete
  //     ↓
  // Student B's enrollment
  //
  // ====================================================

  async deleteByStudent(
    enrollmentId,
    studentId
  ) {

    const [result] = await db.execute(
      `DELETE FROM enrollments
       WHERE id = ?
       AND student_id = ?`,
      [
        enrollmentId,
        studentId
      ]
    );


    return result;
  },

};


module.exports = Enrollment;