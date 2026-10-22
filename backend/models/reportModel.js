
const db = require("../config/db");

const Report = {
  // Admin: overall system statistics
  async getOverview() {
    const [
      [courseStats],
      [studentStats],
      [enrollmentStats],
      [categoryBreakdown],
      [topCourses],
      [coursesWithoutEnrollments],
      [recentEnrollments],
    ] = await Promise.all([
      // Total courses
      db.execute(`
        SELECT COUNT(*) AS totalCourses
        FROM courses
      `),

      // Total students
      db.execute(`
        SELECT COUNT(*) AS totalStudents
        FROM users
        WHERE LOWER(role) = 'student'
      `),

      // Enrollment totals and distinct students
      db.execute(`
        SELECT
          COUNT(*) AS totalEnrollments,
          COUNT(DISTINCT e.student_id) AS studentsWithEnrollments,
          COALESCE(
            SUM(
              CASE
                WHEN e.enrolled_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                 AND e.enrolled_at <= NOW()
                THEN 1
                ELSE 0
              END
            ), 0
          ) AS enrollmentsLast30Days
        FROM enrollments e
      `),

      // Enrollment breakdown by category
      db.execute(`
        SELECT
          COALESCE(c.category, 'Uncategorized') AS category,
          COUNT(e.id) AS enrollmentCount
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, c.category
        ORDER BY enrollmentCount DESC, category ASC
      `),

      // Top five courses by enrollment count
      db.execute(`
        SELECT
          c.id AS courseId,
          c.title,
          COALESCE(c.category, 'Uncategorized') AS category,
          COUNT(e.id) AS enrollmentCount
        FROM courses c
        LEFT JOIN enrollments e ON e.course_id = c.id
        GROUP BY c.id, c.title, c.category
        ORDER BY enrollmentCount DESC, c.title ASC
        LIMIT 5
      `),

      // Courses with no enrollments
      db.execute(`
        SELECT COUNT(*) AS coursesWithoutEnrollments
        FROM courses c
        WHERE NOT EXISTS (
          SELECT 1
          FROM enrollments e
          WHERE e.course_id = c.id
        )
      `),

      // Keep the existing admin dashboard's recent-enrollment table
      db.execute(`
        SELECT
          e.id,
          e.student_id,
          e.course_id,
          e.enrolled_at,
          u.username,
          u.full_name,
          c.title,
          c.category,
          c.level
        FROM enrollments e
        INNER JOIN users u ON u.id = e.student_id
        INNER JOIN courses c ON c.id = e.course_id
        ORDER BY e.enrolled_at DESC, e.id DESC
        LIMIT 6
      `),
    ]);

    return {
      totalCourses: Number(courseStats[0].totalCourses),
      totalStudents: Number(studentStats[0].totalStudents),
      totalEnrollments: Number(enrollmentStats[0].totalEnrollments),
      studentsWithEnrollments: Number(
        enrollmentStats[0].studentsWithEnrollments
      ),
      enrollmentsLast30Days: Number(
        enrollmentStats[0].enrollmentsLast30Days
      ),
      categoryBreakdown,
      topCourses: topCourses.map((course) => ({
        ...course,
        courseId: Number(course.courseId),
        enrollmentCount: Number(course.enrollmentCount),
      })),
      coursesWithoutEnrollments: Number(
        coursesWithoutEnrollments[0].coursesWithoutEnrollments
      ),
      recentEnrollments,
    };
  },

  // Student: only the authenticated student's learning activity
  async getMyReport(studentId) {
    const [
      [summary],
      [recentEnrollments],
    ] = await Promise.all([
      db.execute(
        `
          SELECT
            COUNT(DISTINCT e.course_id) AS enrolledCourses,
            COUNT(DISTINCT c.category) AS distinctCategories,
            MIN(e.enrolled_at) AS earliestEnrollmentDate,
            MAX(e.enrolled_at) AS latestEnrollmentDate
          FROM enrollments e
          LEFT JOIN courses c ON c.id = e.course_id
          WHERE e.student_id = ?
        `,
        [studentId]
      ),

      db.execute(
        `
          SELECT
            e.id,
            e.course_id,
            e.enrolled_at,
            c.title,
            c.category,
            c.level
          FROM enrollments e
          INNER JOIN courses c ON c.id = e.course_id
          WHERE e.student_id = ?
          ORDER BY e.enrolled_at DESC, e.id DESC
          LIMIT 3
        `,
        [studentId]
      ),
    ]);

    return {
      enrolledCourses: Number(summary[0].enrolledCourses),
      distinctCategories: Number(summary[0].distinctCategories),
      earliestEnrollmentDate: summary[0].earliestEnrollmentDate,
      latestEnrollmentDate: summary[0].latestEnrollmentDate,
      recentEnrollments,
    };
  },
};

module.exports = Report;
