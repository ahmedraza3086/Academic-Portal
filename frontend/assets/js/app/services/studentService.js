import { http } from '../core/http.js';

export const studentService = {
    getProfile() {
        return http.get('/student/profile');
    },

    getAttendance(courseId = '') {
        const query = courseId ? { courseId } : undefined;
        return http.get('/student/attendance', query);
    },

    getMarks(courseId = '') {
        const query = courseId ? { courseId } : undefined;
        return http.get('/student/marks', query);
    }
};
