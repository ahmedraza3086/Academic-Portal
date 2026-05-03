USE academic_portal_db;

-- =====================================================
-- HELPER TABLES (required by triggers)
-- =====================================================

CREATE TABLE IF NOT EXISTS student_audit_log (
    audit_id      INT AUTO_INCREMENT PRIMARY KEY,
    student_id    INT,
    action        VARCHAR(50),
    old_email     VARCHAR(100),
    deleted_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance_summary (
    summary_id            INT AUTO_INCREMENT PRIMARY KEY,
    student_id            INT NOT NULL,
    course_id             INT NOT NULL,
    total_classes         INT           DEFAULT 0,
    present_count         INT           DEFAULT 0,
    attendance_percentage DECIMAL(5,2)  DEFAULT 0.00,
    UNIQUE KEY uq_student_course (student_id, course_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id)  REFERENCES course(course_id)   ON DELETE CASCADE
);


-- =====================================================
-- 1. TRIGGERS
-- =====================================================

-- Drop existing triggers safely before recreating
DROP TRIGGER IF EXISTS before_enrollment_insert;
DROP TRIGGER IF EXISTS after_student_delete;
DROP TRIGGER IF EXISTS before_enrollment_check_capacity;
DROP TRIGGER IF EXISTS after_attendance_insert;

-- Trigger 1: Auto-set enrollment_date and status on insert
DELIMITER $$
CREATE TRIGGER before_enrollment_insert
BEFORE INSERT ON enrollment
FOR EACH ROW
BEGIN
    IF NEW.enrollment_date IS NULL THEN
        SET NEW.enrollment_date = CURDATE();
    END IF;
    IF NEW.status IS NULL THEN
        SET NEW.status = 'active';
    END IF;
END$$
DELIMITER ;

-- Trigger 2: Audit trail — log deleted students
DELIMITER $$
CREATE TRIGGER after_student_delete
AFTER DELETE ON student
FOR EACH ROW
BEGIN
    INSERT INTO student_audit_log (student_id, action, old_email)
    VALUES (OLD.student_id, 'DELETED', OLD.email);
END$$
DELIMITER ;

-- Trigger 3: Prevent enrollment when course capacity ≥ 50
DELIMITER $$
CREATE TRIGGER before_enrollment_check_capacity
BEFORE INSERT ON enrollment
FOR EACH ROW
BEGIN
    DECLARE enrolled_count INT DEFAULT 0;
    SELECT COUNT(*) INTO enrolled_count
    FROM enrollment
    WHERE course_id = NEW.course_id AND status IN ('active', 'completed');

    IF enrolled_count >= 50 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Course has reached maximum capacity of 50 students';
    END IF;
END$$
DELIMITER ;

-- Trigger 4: Maintain attendance_summary on every new attendance record
DELIMITER $$
CREATE TRIGGER after_attendance_insert
AFTER INSERT ON attendance
FOR EACH ROW
BEGIN
    DECLARE v_total   INT DEFAULT 0;
    DECLARE v_present INT DEFAULT 0;

    SELECT COUNT(*)
    INTO v_total
    FROM attendance
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id;

    SELECT COUNT(*)
    INTO v_present
    FROM attendance
    WHERE student_id = NEW.student_id AND course_id = NEW.course_id AND status = 'present';

    INSERT INTO attendance_summary
        (student_id, course_id, total_classes, present_count, attendance_percentage)
    VALUES
        (NEW.student_id, NEW.course_id, v_total, v_present,
         IF(v_total > 0, ROUND((v_present / v_total) * 100, 2), 0))
    ON DUPLICATE KEY UPDATE
        total_classes         = v_total,
        present_count         = v_present,
        attendance_percentage = IF(v_total > 0, ROUND((v_present / v_total) * 100, 2), 0);
END$$
DELIMITER ;


-- =====================================================
-- 2. STORED PROCEDURES
-- =====================================================

DROP PROCEDURE IF EXISTS GetStudentTranscript;
DROP PROCEDURE IF EXISTS CalculateStudentGPA;
DROP PROCEDURE IF EXISTS GetCourseStatistics;
DROP PROCEDURE IF EXISTS EnrollStudent;
DROP PROCEDURE IF EXISTS TransferStudent;

-- Procedure 1: Full transcript using JOINs + correlated SubQueries
DELIMITER $$
CREATE PROCEDURE GetStudentTranscript(IN p_student_id INT)
BEGIN
    SELECT
        s.first_name,
        s.last_name,
        s.email,
        c.course_code,
        c.course_name,
        c.credits,
        e.status,
        e.grade,
        (SELECT COUNT(*)
         FROM attendance a
         WHERE a.student_id = p_student_id
           AND a.course_id  = c.course_id
           AND a.status     = 'present')  AS classes_attended,
        (SELECT COUNT(*)
         FROM attendance a
         WHERE a.student_id = p_student_id
           AND a.course_id  = c.course_id) AS total_classes
    FROM student s
    JOIN enrollment e ON s.student_id = e.student_id
    JOIN course     c ON e.course_id  = c.course_id
    WHERE s.student_id = p_student_id;
END$$
DELIMITER ;

-- Procedure 2: GPA calculator using cursor + letter-grade conversion
DELIMITER $$
CREATE PROCEDURE CalculateStudentGPA(IN p_student_id INT, OUT p_gpa DECIMAL(4,2))
BEGIN
    DECLARE v_total_points  DECIMAL(8,2) DEFAULT 0;
    DECLARE v_total_credits INT          DEFAULT 0;
    DECLARE v_grade         VARCHAR(5);
    DECLARE v_credits       INT;
    DECLARE v_points        DECIMAL(3,1) DEFAULT 0;
    DECLARE done            INT          DEFAULT FALSE;

    DECLARE cur CURSOR FOR
        SELECT e.grade, c.credits
        FROM enrollment e
        JOIN course c ON e.course_id = c.course_id
        WHERE e.student_id = p_student_id AND e.grade IS NOT NULL;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN cur;
    read_loop: LOOP
        FETCH cur INTO v_grade, v_credits;
        IF done THEN LEAVE read_loop; END IF;

        CASE v_grade
            WHEN 'A'  THEN SET v_points = 4.0;
            WHEN 'A-' THEN SET v_points = 3.7;
            WHEN 'B+' THEN SET v_points = 3.3;
            WHEN 'B'  THEN SET v_points = 3.0;
            WHEN 'B-' THEN SET v_points = 2.7;
            WHEN 'C+' THEN SET v_points = 2.3;
            WHEN 'C'  THEN SET v_points = 2.0;
            WHEN 'D'  THEN SET v_points = 1.0;
            WHEN 'F'  THEN SET v_points = 0.0;
            ELSE           SET v_points = 0.0;
        END CASE;

        SET v_total_points  = v_total_points  + (v_points * v_credits);
        SET v_total_credits = v_total_credits + v_credits;
    END LOOP;
    CLOSE cur;

    SET p_gpa = IF(v_total_credits > 0,
                   ROUND(v_total_points / v_total_credits, 2),
                   0.00);
END$$
DELIMITER ;

-- Procedure 3: Course statistics with JOINs + ScalarSubQuery
DELIMITER $$
CREATE PROCEDURE GetCourseStatistics(IN p_course_id INT)
BEGIN
    SELECT
        c.course_code,
        c.course_name,
        COUNT(DISTINCT e.student_id)  AS total_enrolled,
        ROUND(AVG(CASE WHEN m.assessment_type = 'midterm'
                       THEN (m.obtained_marks / m.max_marks) * 100 END), 2) AS avg_midterm,
        ROUND(AVG(CASE WHEN m.assessment_type = 'final'
                       THEN (m.obtained_marks / m.max_marks) * 100 END), 2) AS avg_final,
        ROUND(AVG(CASE WHEN m.assessment_type = 'quiz'
                       THEN (m.obtained_marks / m.max_marks) * 100 END), 2) AS avg_quiz,
        (SELECT ROUND(AVG(attendance_percentage), 2)
         FROM attendance_summary
         WHERE course_id = p_course_id)                                      AS avg_attendance_pct
    FROM course c
    LEFT JOIN enrollment e ON c.course_id = e.course_id
    LEFT JOIN marks m      ON c.course_id = m.course_id AND e.student_id = m.student_id
    WHERE c.course_id = p_course_id
    GROUP BY c.course_id, c.course_code, c.course_name;
END$$
DELIMITER ;

-- Procedure 4: Enroll student — wrapped in transaction with rollback handler
DELIMITER $$
CREATE PROCEDURE EnrollStudent(
    IN  p_student_id INT,
    IN  p_course_id  INT,
    OUT p_status     VARCHAR(200)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_status = CONCAT('Enrollment failed: ', @msg);
    END;

    START TRANSACTION;

    IF EXISTS (
        SELECT 1 FROM enrollment
        WHERE student_id = p_student_id AND course_id = p_course_id
    ) THEN
        SET p_status = 'Student is already enrolled in this course';
        ROLLBACK;
    ELSE
        INSERT INTO enrollment (student_id, course_id, enrollment_date, status)
        VALUES (p_student_id, p_course_id, CURDATE(), 'active');
        COMMIT;
        SET p_status = 'Enrollment successful';
    END IF;
END$$
DELIMITER ;

-- Procedure 5: Transfer student between courses — atomic transaction
DELIMITER $$
CREATE PROCEDURE TransferStudent(
    IN p_student_id    INT,
    IN p_old_course_id INT,
    IN p_new_course_id INT
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 @msg = MESSAGE_TEXT;
        ROLLBACK;
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = @msg;
    END;

    START TRANSACTION;

    -- Verify old enrollment exists and is active
    IF NOT EXISTS (
        SELECT 1 FROM enrollment
        WHERE student_id = p_student_id AND course_id = p_old_course_id AND status = 'active'
    ) THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Active enrollment not found for the source course';
    END IF;

    UPDATE enrollment
    SET status = 'dropped'
    WHERE student_id = p_student_id AND course_id = p_old_course_id;

    INSERT INTO enrollment (student_id, course_id, enrollment_date, status)
    VALUES (p_student_id, p_new_course_id, CURDATE(), 'active');

    COMMIT;
END$$
DELIMITER ;


-- =====================================================
-- 3. VIEWS (JOINs + SubQueries)
-- =====================================================

DROP VIEW IF EXISTS low_attendance_students;
DROP VIEW IF EXISTS top_performers;
DROP VIEW IF EXISTS faculty_workload;
DROP VIEW IF EXISTS unenrolled_students;

-- View 1: Students with attendance below 75% (JOIN + HAVING)
CREATE VIEW low_attendance_students AS
SELECT
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name)           AS student_name,
    c.course_code,
    c.course_name,
    COUNT(CASE WHEN a.status = 'present' THEN 1 END)  AS present_count,
    COUNT(a.attendance_id)                            AS total_classes,
    ROUND(
        COUNT(CASE WHEN a.status = 'present' THEN 1 END)
        / NULLIF(COUNT(a.attendance_id), 0) * 100, 2) AS attendance_percentage
FROM student s
JOIN attendance a ON s.student_id = a.student_id
JOIN course    c ON a.course_id  = c.course_id
GROUP BY s.student_id, s.first_name, s.last_name, c.course_id, c.course_code, c.course_name
HAVING attendance_percentage < 75;

-- View 2: Top performers (>80%) using JOINs + HAVING SubQuery logic
CREATE VIEW top_performers AS
SELECT
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name)           AS student_name,
    c.course_code,
    c.course_name,
    SUM(m.obtained_marks)                             AS total_obtained,
    SUM(m.max_marks)                                  AS total_max,
    ROUND(SUM(m.obtained_marks)
          / NULLIF(SUM(m.max_marks), 0) * 100, 2)    AS percentage
FROM student s
JOIN marks  m ON s.student_id = m.student_id
JOIN course c ON m.course_id  = c.course_id
GROUP BY s.student_id, s.first_name, s.last_name, c.course_id, c.course_code, c.course_name
HAVING percentage > 80
ORDER BY percentage DESC;

-- View 3: Faculty workload (JOIN + correlated SubQuery)
CREATE VIEW faculty_workload AS
SELECT
    f.faculty_id,
    CONCAT(f.first_name, ' ', f.last_name) AS faculty_name,
    f.department,
    COUNT(c.course_id)                     AS courses_assigned,
    (SELECT COUNT(*)
     FROM enrollment e
     WHERE e.course_id IN (
         SELECT course_id FROM course WHERE faculty_id = f.faculty_id
     )
     AND e.status = 'active')              AS total_active_students
FROM faculty f
LEFT JOIN course c ON f.faculty_id = c.faculty_id
GROUP BY f.faculty_id, f.first_name, f.last_name, f.department;

-- View 4: Students not enrolled in any active course (SubQuery with NOT IN)
CREATE VIEW unenrolled_students AS
SELECT
    s.student_id,
    CONCAT(s.first_name, ' ', s.last_name) AS student_name,
    s.email,
    s.major,
    s.enrollment_year
FROM student s
WHERE s.student_id NOT IN (
    SELECT DISTINCT student_id
    FROM enrollment
    WHERE status = 'active'
);
