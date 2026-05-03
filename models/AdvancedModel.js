const db = require('../config/db');

class AdvancedModel {
    /**
     * Calls GetStudentTranscript stored procedure.
     * Uses JOINs (student → enrollment → course) + correlated SubQueries for attendance counts.
     */
    static async getStudentTranscript(studentId) {
        const [rows] = await db.query('CALL GetStudentTranscript(?)', [studentId]);
        // mysql2 returns [[resultSet], okPacket] for CALL
        return rows[0];
    }

    /**
     * Calls CalculateStudentGPA stored procedure (cursor-based, letter-grade conversion).
     * Uses an OUT parameter retrieved via a session variable.
     */
    static async calculateGPA(studentId) {
        await db.query('CALL CalculateStudentGPA(?, @gpa)', [studentId]);
        const [rows] = await db.query('SELECT @gpa AS gpa');
        return rows[0].gpa;
    }

    /**
     * Calls GetCourseStatistics stored procedure.
     * Uses LEFT JOINs + scalar SubQuery for average attendance.
     */
    static async getCourseStatistics(courseId) {
        const [rows] = await db.query('CALL GetCourseStatistics(?)', [courseId]);
        return rows[0];
    }

    /**
     * Calls EnrollStudent stored procedure.
     * Wraps INSERT in a START TRANSACTION / ROLLBACK / COMMIT block server-side.
     */
    static async enrollStudent(studentId, courseId) {
        await db.query('CALL EnrollStudent(?, ?, @status)', [studentId, courseId]);
        const [rows] = await db.query('SELECT @status AS status');
        return rows[0].status;
    }

    /**
     * Calls TransferStudent stored procedure.
     * Atomically updates one enrollment to 'dropped' and inserts a new one.
     */
    static async transferStudent(studentId, oldCourseId, newCourseId) {
        await db.query('CALL TransferStudent(?, ?, ?)', [studentId, oldCourseId, newCourseId]);
        return 'Transfer successful';
    }

    /**
     * Reads the low_attendance_students VIEW (JOIN + HAVING < 75%).
     */
    static async getLowAttendance() {
        const [rows] = await db.query('SELECT * FROM low_attendance_students ORDER BY attendance_percentage ASC');
        return rows;
    }

    /**
     * Reads the top_performers VIEW (JOIN + HAVING > 80%).
     */
    static async getTopPerformers() {
        const [rows] = await db.query('SELECT * FROM top_performers ORDER BY percentage DESC');
        return rows;
    }

    /**
     * Reads the faculty_workload VIEW (JOIN + correlated SubQuery).
     */
    static async getFacultyWorkload() {
        const [rows] = await db.query('SELECT * FROM faculty_workload ORDER BY courses_assigned DESC');
        return rows;
    }

    /**
     * Reads the unenrolled_students VIEW (SubQuery with NOT IN).
     */
    static async getUnenrolledStudents() {
        const [rows] = await db.query('SELECT * FROM unenrolled_students ORDER BY student_name ASC');
        return rows;
    }

    /**
     * Course popularity ranking — complex JOIN + scalar SubQueries.
     */
    static async getCoursePopularity() {
        const sql = `
            SELECT
                c.course_id,
                c.course_code,
                c.course_name,
                CONCAT(f.first_name, ' ', f.last_name)                                        AS faculty_name,
                COUNT(DISTINCT e.enrollment_id)                                                 AS enrolled_count,
                ROUND(
                    (SELECT AVG(attendance_percentage)
                     FROM attendance_summary
                     WHERE course_id = c.course_id), 2)                                         AS avg_attendance_pct,
                ROUND(
                    (SELECT AVG((obtained_marks / max_marks) * 100)
                     FROM marks
                     WHERE course_id = c.course_id), 2)                                         AS avg_score_pct
            FROM course c
            LEFT JOIN faculty    f ON c.faculty_id  = f.faculty_id
            LEFT JOIN enrollment e ON c.course_id   = e.course_id AND e.status = 'active'
            GROUP BY c.course_id, c.course_code, c.course_name, f.first_name, f.last_name
            ORDER BY enrolled_count DESC
        `;
        const [rows] = await db.query(sql);
        return rows;
    }
}

module.exports = AdvancedModel;
