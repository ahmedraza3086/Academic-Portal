const AdvancedModel = require('../models/AdvancedModel');

// ── Student Transcript ──────────────────────────────────────────────────────
const getStudentTranscript = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);
        if (!studentId || isNaN(studentId)) {
            return res.status(400).json({ message: 'Valid student ID is required.' });
        }
        const transcript = await AdvancedModel.getStudentTranscript(studentId);
        res.json({ transcript });
    } catch (error) {
        console.error('getStudentTranscript error:', error);
        res.status(500).json({ message: error.message || 'Failed to load transcript.' });
    }
};

// ── GPA Calculation ─────────────────────────────────────────────────────────
const calculateGPA = async (req, res) => {
    try {
        const studentId = parseInt(req.params.studentId, 10);
        if (!studentId || isNaN(studentId)) {
            return res.status(400).json({ message: 'Valid student ID is required.' });
        }
        const gpa = await AdvancedModel.calculateGPA(studentId);
        res.json({ studentId, gpa: gpa !== null ? Number(gpa).toFixed(2) : '0.00' });
    } catch (error) {
        console.error('calculateGPA error:', error);
        res.status(500).json({ message: error.message || 'Failed to calculate GPA.' });
    }
};

// ── Course Statistics ───────────────────────────────────────────────────────
const getCourseStatistics = async (req, res) => {
    try {
        const courseId = parseInt(req.params.courseId, 10);
        if (!courseId || isNaN(courseId)) {
            return res.status(400).json({ message: 'Valid course ID is required.' });
        }
        const stats = await AdvancedModel.getCourseStatistics(courseId);
        if (!stats || stats.length === 0) {
            return res.status(404).json({ message: 'Course not found.' });
        }
        res.json({ stats: stats[0] });
    } catch (error) {
        console.error('getCourseStatistics error:', error);
        res.status(500).json({ message: error.message || 'Failed to load course statistics.' });
    }
};

// ── Enroll Student (Transaction) ────────────────────────────────────────────
const enrollStudent = async (req, res) => {
    try {
        const { studentId, courseId } = req.body;
        if (!studentId || !courseId) {
            return res.status(400).json({ message: 'studentId and courseId are required.' });
        }
        const status = await AdvancedModel.enrollStudent(
            parseInt(studentId, 10),
            parseInt(courseId,  10)
        );
        const isSuccess = status && status.toLowerCase().includes('successful');
        res.status(isSuccess ? 200 : 409).json({ status });
    } catch (error) {
        console.error('enrollStudent error:', error);
        res.status(500).json({ message: error.message || 'Enrollment failed.' });
    }
};

// ── Transfer Student (Transaction) ─────────────────────────────────────────
const transferStudent = async (req, res) => {
    try {
        const { studentId, oldCourseId, newCourseId } = req.body;
        if (!studentId || !oldCourseId || !newCourseId) {
            return res.status(400).json({ message: 'studentId, oldCourseId, and newCourseId are required.' });
        }
        const result = await AdvancedModel.transferStudent(
            parseInt(studentId,   10),
            parseInt(oldCourseId, 10),
            parseInt(newCourseId, 10)
        );
        res.json({ message: result });
    } catch (error) {
        console.error('transferStudent error:', error);
        res.status(500).json({ message: error.message || 'Transfer failed.' });
    }
};

// ── Reports (Views) ─────────────────────────────────────────────────────────
const getReports = async (req, res) => {
    const { type } = req.params;
    const handlers = {
        'low-attendance':  () => AdvancedModel.getLowAttendance(),
        'top-performers':  () => AdvancedModel.getTopPerformers(),
        'faculty-workload':() => AdvancedModel.getFacultyWorkload(),
        'unenrolled':      () => AdvancedModel.getUnenrolledStudents(),
        'popularity':      () => AdvancedModel.getCoursePopularity()
    };

    const handler = handlers[type];
    if (!handler) {
        return res.status(400).json({ message: `Invalid report type: "${type}". Valid types: ${Object.keys(handlers).join(', ')}.` });
    }

    try {
        const data = await handler();
        res.json({ report: type, count: data.length, data });
    } catch (error) {
        console.error(`getReports[${type}] error:`, error);
        res.status(500).json({ message: error.message || 'Failed to load report.' });
    }
};

module.exports = {
    getStudentTranscript,
    calculateGPA,
    getCourseStatistics,
    enrollStudent,
    transferStudent,
    getReports
};
