import { http } from '../core/http.js';

export const facultyService = {
    getMyCourses() {
        return http.get('/faculty/courses');
    },

    getCourseStudents(courseId) {
        return http.get(`/faculty/courses/${courseId}/students`);
    },

    getCourseAttendance(courseId, date = '') {
        const query = date ? { date } : undefined;
        return http.get(`/faculty/courses/${courseId}/attendance`, query);
    },

    getCourseMarks(courseId) {
        return http.get(`/faculty/courses/${courseId}/marks`);
    },

    getStudentPerformance(studentId) {
        return http.get(`/faculty/students/${studentId}/performance`);
    },

    addAttendance(payload) {
        return http.post('/attendance', payload);
    },

    updateAttendance(attendanceId, payload) {
        return http.put(`/attendance/${attendanceId}`, payload);
    },

    deleteAttendance(attendanceId) {
        return http.delete(`/attendance/${attendanceId}`);
    },

    addMarks(payload) {
        return http.post('/marks', payload);
    },

    updateMarks(marksId, payload) {
        return http.put(`/marks/${marksId}`, payload);
    },

    deleteMarks(marksId) {
        return http.delete(`/marks/${marksId}`);
    }
};
