import { http } from '../core/http.js';

export const adminService = {
    getStudents() {
        return http.get('/admin/students');
    },

    createStudent(payload) {
        return http.post('/admin/students', payload);
    },

    updateStudent(studentId, payload) {
        return http.put(`/admin/students/${studentId}`, payload);
    },

    deleteStudent(studentId) {
        return http.delete(`/admin/students/${studentId}`);
    },

    getFaculty() {
        return http.get('/admin/faculty');
    },

    createFaculty(payload) {
        return http.post('/admin/faculty', payload);
    },

    updateFaculty(facultyId, payload) {
        return http.put(`/admin/faculty/${facultyId}`, payload);
    },

    deleteFaculty(facultyId) {
        return http.delete(`/admin/faculty/${facultyId}`);
    },

    getCourses() {
        return http.get('/admin/courses');
    },

    createCourse(payload) {
        return http.post('/admin/courses', payload);
    },

    updateCourse(courseId, payload) {
        return http.put(`/admin/courses/${courseId}`, payload);
    },

    deleteCourse(courseId) {
        return http.delete(`/admin/courses/${courseId}`);
    },

    assignCourseToFaculty(courseId, facultyId) {
        return http.post('/admin/courses/assign', { courseId, facultyId });
    },

    getEnrollments() {
        return http.get('/admin/enrollments');
    },

    createEnrollment(payload) {
        return http.post('/admin/enrollments', payload);
    },

    updateEnrollment(enrollmentId, payload) {
        return http.put(`/admin/enrollments/${enrollmentId}`, payload);
    },

    deleteEnrollment(enrollmentId) {
        return http.delete(`/admin/enrollments/${enrollmentId}`);
    }
};
