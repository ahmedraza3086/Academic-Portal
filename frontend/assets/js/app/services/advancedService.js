import { http } from '../core/http.js';

export const advancedService = {
    /** GET /api/advanced/transcript/:studentId */
    getTranscript(studentId) {
        return http.get(`/advanced/transcript/${studentId}`);
    },

    /** GET /api/advanced/gpa/:studentId */
    getGPA(studentId) {
        return http.get(`/advanced/gpa/${studentId}`);
    },

    /** GET /api/advanced/course-stats/:courseId */
    getCourseStats(courseId) {
        return http.get(`/advanced/course-stats/${courseId}`);
    },

    /** GET /api/advanced/reports/:type */
    getReport(type) {
        return http.get(`/advanced/reports/${type}`);
    },

    /** POST /api/advanced/enroll  { studentId, courseId } */
    enrollStudent(studentId, courseId) {
        return http.post('/advanced/enroll', {
            studentId: Number(studentId),
            courseId:  Number(courseId)
        });
    },

    /** POST /api/advanced/transfer  { studentId, oldCourseId, newCourseId } */
    transferStudent(studentId, oldCourseId, newCourseId) {
        return http.post('/advanced/transfer', {
            studentId:    Number(studentId),
            oldCourseId:  Number(oldCourseId),
            newCourseId:  Number(newCourseId)
        });
    }
};
