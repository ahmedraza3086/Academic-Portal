-- Drop database if exists (use with caution)
-- DROP DATABASE IF EXISTS academic_portal_db;
CREATE DATABASE IF NOT EXISTS academic_portal_db;

USE academic_portal_db;

-- -----------------------------------------------------
-- Table `faculty`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS faculty (
        faculty_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        department VARCHAR(100),
        hire_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Add password and role to faculty table
ALTER TABLE faculty
ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email,
ADD COLUMN role ENUM ('faculty') DEFAULT 'faculty' AFTER password_hash;

-- -----------------------------------------------------
-- Table `student`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS student (
        student_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        date_of_birth DATE,
        enrollment_year YEAR,
        major VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Add password and role to student table
ALTER TABLE student
ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '' AFTER email,
ADD COLUMN role ENUM ('student') DEFAULT 'student' AFTER password_hash;

-- -----------------------------------------------------
-- Table `admin`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS admin (
        admin_id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM ('admin') DEFAULT 'admin',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- -----------------------------------------------------
-- Table `course`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS course (
        course_id INT AUTO_INCREMENT PRIMARY KEY,
        course_code VARCHAR(20) UNIQUE NOT NULL,
        course_name VARCHAR(100) NOT NULL,
        credits INT NOT NULL CHECK (credits > 0),
        faculty_id INT NOT NULL,
        semester VARCHAR(20),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (faculty_id) REFERENCES faculty (faculty_id) ON DELETE RESTRICT ON UPDATE CASCADE
    );

-- -----------------------------------------------------
-- Table `enrollment`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS enrollment (
        enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        enrollment_date DATE NOT NULL,
        status ENUM ('active', 'completed', 'dropped', 'pending') DEFAULT 'active',
        grade VARCHAR(2) DEFAULT NULL,
        UNIQUE KEY unique_enrollment (student_id, course_id),
        FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES course (course_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- -----------------------------------------------------
-- Table `attendance`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS attendance (
        attendance_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        attendance_date DATE NOT NULL,
        status ENUM ('present', 'absent', 'excused') NOT NULL,
        remarks VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_attendance (student_id, course_id, attendance_date),
        FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES course (course_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- -----------------------------------------------------
-- Table `marks`
-- -----------------------------------------------------
CREATE TABLE
    IF NOT EXISTS marks (
        marks_id INT AUTO_INCREMENT PRIMARY KEY,
        student_id INT NOT NULL,
        course_id INT NOT NULL,
        assessment_type ENUM (
            'quiz',
            'midterm',
            'final',
            'assignment',
            'project'
        ) NOT NULL,
        obtained_marks DECIMAL(5, 2) NOT NULL,
        max_marks DECIMAL(5, 2) NOT NULL,
        assessment_date DATE,
        remarks VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (student_id) REFERENCES student (student_id) ON DELETE CASCADE ON UPDATE CASCADE,
        FOREIGN KEY (course_id) REFERENCES course (course_id) ON DELETE CASCADE ON UPDATE CASCADE
    );

-- -----------------------------------------------------
-- Sample Data Insertion
-- -----------------------------------------------------
-- Insert Faculty
INSERT INTO
    faculty (
        first_name,
        last_name,
        email,
        phone,
        department,
        hire_date,
        password_hash
    )
VALUES
    (
        'John',
        'Doe',
        'john.doe@university.edu',
        '123-456-7890',
        'Computer Science',
        '2015-08-15',
        '$2b$10$dW8cMqKqhf8cc./YNZSCeeudocWl7m0tzQ4cKOWREDAVRaQfZaghy'
    ),
    (
        'Jane',
        'Smith',
        'jane.smith@university.edu',
        '123-456-7891',
        'Mathematics',
        '2018-01-10',
        '$2b$10$dW8cMqKqhf8cc./YNZSCeeudocWl7m0tzQ4cKOWREDAVRaQfZaghy'
    ),
    (
        'Robert',
        'Johnson',
        'robert.j@university.edu',
        '123-456-7892',
        'Physics',
        '2012-09-01',
        '$2b$10$dW8cMqKqhf8cc./YNZSCeeudocWl7m0tzQ4cKOWREDAVRaQfZaghy'
    );

-- Insert Students
INSERT INTO
    student (
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        enrollment_year,
        major,
        password_hash
    )
VALUES
    (
        'Alice',
        'Brown',
        'alice.brown@student.edu',
        '321-654-0987',
        '2002-05-12',
        2020,
        'Computer Science',
        '$2b$10$N6QkpH9wIL3wqFfFEzn89eVjJ8eb5l1CkjVqtrexf.2GowBYCYAVi'
    ),
    (
        'Bob',
        'Wilson',
        'bob.wilson@student.edu',
        '321-654-0988',
        '2001-11-23',
        2020,
        'Mathematics',
        '$2b$10$N6QkpH9wIL3wqFfFEzn89eVjJ8eb5l1CkjVqtrexf.2GowBYCYAVi'
    ),
    (
        'Charlie',
        'Davis',
        'charlie.davis@student.edu',
        '321-654-0989',
        '2003-02-07',
        2021,
        'Physics',
        '$2b$10$N6QkpH9wIL3wqFfFEzn89eVjJ8eb5l1CkjVqtrexf.2GowBYCYAVi'
    ),
    (
        'Diana',
        'Miller',
        'diana.miller@student.edu',
        '321-654-0990',
        '2002-09-18',
        2020,
        'Computer Science',
        '$2b$10$N6QkpH9wIL3wqFfFEzn89eVjJ8eb5l1CkjVqtrexf.2GowBYCYAVi'
    );

-- Insert Admin (password: admin123)
INSERT INTO
    admin (first_name, last_name, email, password_hash)
VALUES
    (
        'System',
        'Admin',
        'admin@portal.com',
        '$2b$10$8daaFspcsJIycs1zNDG/suu7oC3QaA.UHroNpbNI9Y3y/dVrjEUQW'
    );

-- Insert Courses
INSERT INTO
    course (
        course_code,
        course_name,
        credits,
        faculty_id,
        semester,
        description
    )
VALUES
    (
        'CS101',
        'Introduction to Programming',
        3,
        1,
        'Fall 2024',
        'Learn programming fundamentals using Python.'
    ),
    (
        'CS201',
        'Data Structures',
        4,
        1,
        'Fall 2024',
        'Advanced data structures and algorithms.'
    ),
    (
        'MATH201',
        'Calculus I',
        4,
        2,
        'Fall 2024',
        'Limits, derivatives, and integrals.'
    ),
    (
        'PHY101',
        'General Physics',
        4,
        3,
        'Fall 2024',
        'Mechanics and thermodynamics.'
    );

-- Insert Enrollments
INSERT INTO
    enrollment (student_id, course_id, enrollment_date, status)
VALUES
    (1, 1, '2024-08-20', 'active'),
    (1, 2, '2024-08-20', 'active'),
    (2, 3, '2024-08-21', 'active'),
    (3, 4, '2024-08-19', 'active'),
    (4, 1, '2024-08-20', 'active'),
    (4, 2, '2024-08-20', 'active');

-- Insert Attendance Records
INSERT INTO
    attendance (student_id, course_id, attendance_date, status)
VALUES
    (1, 1, '2024-09-05', 'present'),
    (1, 1, '2024-09-07', 'present'),
    (1, 1, '2024-09-12', 'absent'),
    (4, 1, '2024-09-05', 'present'),
    (2, 3, '2024-09-06', 'present'),
    (3, 4, '2024-09-08', 'excused');

-- Insert Marks Records
INSERT INTO
    marks (
        student_id,
        course_id,
        assessment_type,
        obtained_marks,
        max_marks,
        assessment_date
    )
VALUES
    (1, 1, 'quiz', 8.5, 10, '2024-09-15'),
    (1, 1, 'midterm', 42.0, 50, '2024-10-10'),
    (4, 1, 'quiz', 9.0, 10, '2024-09-15'),
    (4, 1, 'midterm', 45.5, 50, '2024-10-10'),
    (2, 3, 'midterm', 38.0, 40, '2024-10-12'),
    (3, 4, 'assignment', 18.5, 20, '2024-09-20');