import { authState } from '../core/auth.js';
import { store } from '../core/store.js';
import { studentService } from '../services/studentService.js';
import { formatters } from '../utils/formatters.js';
import { notify } from '../ui/notifications.js';

const dom = {
    userName: document.getElementById('studentUserName'),
    userAvatar: document.getElementById('studentUserAvatar'),
    profileCard: document.getElementById('studentProfileCard'),
    statCourses: document.getElementById('studentStatCourses'),
    statAttendance: document.getElementById('studentStatAttendance'),
    statAverage: document.getElementById('studentStatAverage'),
    statAssessments: document.getElementById('studentStatAssessments'),
    coursesTableBody: document.getElementById('studentCoursesTableBody'),
    attendanceTableBody: document.getElementById('studentAttendanceTableBody'),
    marksTableBody: document.getElementById('studentMarksTableBody'),
    pageError: document.getElementById('studentPageError'),
    logoutLink: document.getElementById('studentLogoutLink'),
    reloadButton: document.getElementById('reloadStudentData')
};

const setPageError = (message = '') => {
    if (!dom.pageError) {
        return;
    }

    dom.pageError.textContent = message;
    dom.pageError.classList.toggle('d-none', !message);
};

const renderEmptyRow = (tableBody, columns, message) => {
    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = `<tr><td colspan="${columns}" class="text-center text-muted py-3">${message}</td></tr>`;
};

const renderProfile = (profile) => {
    if (!dom.profileCard || !profile) {
        return;
    }

    dom.profileCard.innerHTML = `
        <div><strong>Name:</strong> ${formatters.fullName(profile.first_name, profile.last_name)}</div>
        <div><strong>Email:</strong> ${profile.email || '-'}</div>
        <div><strong>Phone:</strong> ${profile.phone || '-'}</div>
        <div><strong>Major:</strong> ${profile.major || '-'}</div>
        <div><strong>Enrollment Year:</strong> ${profile.enrollment_year || '-'}</div>
    `;
};

const buildCourseSummary = (attendance, marks) => {
    const summaryMap = new Map();

    marks.forEach((record) => {
        if (!summaryMap.has(record.course_id)) {
            summaryMap.set(record.course_id, {
                course_id: record.course_id,
                course_code: record.course_code,
                course_name: record.course_name,
                obtained: 0,
                max: 0,
                present: 0,
                totalAttendance: 0
            });
        }

        const entry = summaryMap.get(record.course_id);
        entry.obtained += Number(record.obtained_marks || 0);
        entry.max += Number(record.max_marks || 0);
    });

    attendance.forEach((record) => {
        if (!summaryMap.has(record.course_id)) {
            summaryMap.set(record.course_id, {
                course_id: record.course_id,
                course_code: record.course_code,
                course_name: record.course_name,
                obtained: 0,
                max: 0,
                present: 0,
                totalAttendance: 0
            });
        }

        const entry = summaryMap.get(record.course_id);
        entry.totalAttendance += 1;
        if (record.status === 'present') {
            entry.present += 1;
        }
    });

    return Array.from(summaryMap.values());
};

const renderStats = (courseSummary, attendance, marks) => {
    if (dom.statCourses) {
        dom.statCourses.textContent = String(courseSummary.length);
    }

    if (dom.statAttendance) {
        const present = attendance.filter((item) => item.status === 'present').length;
        dom.statAttendance.textContent = formatters.percent(present, attendance.length || 1);
    }

    if (dom.statAverage) {
        const totalObtained = marks.reduce((sum, item) => sum + Number(item.obtained_marks || 0), 0);
        const totalMax = marks.reduce((sum, item) => sum + Number(item.max_marks || 0), 0);
        dom.statAverage.textContent = formatters.percent(totalObtained, totalMax || 1);
    }

    if (dom.statAssessments) {
        dom.statAssessments.textContent = String(marks.length);
    }
};

const renderCourseSummary = (courseSummary) => {
    if (!dom.coursesTableBody) {
        return;
    }

    if (courseSummary.length === 0) {
        renderEmptyRow(dom.coursesTableBody, 5, 'No course data available.');
        return;
    }

    dom.coursesTableBody.innerHTML = courseSummary
        .map((course) => {
            const attendancePercent = formatters.percent(course.present, course.totalAttendance || 1);
            const marksPercent = formatters.percent(course.obtained, course.max || 1);

            return `
                <tr>
                    <td>${course.course_code || '-'}</td>
                    <td>${course.course_name || '-'}</td>
                    <td>${attendancePercent}</td>
                    <td>${marksPercent}</td>
                    <td>${course.totalAttendance}</td>
                </tr>
            `;
        })
        .join('');
};

const renderAttendance = (attendance) => {
    if (!dom.attendanceTableBody) {
        return;
    }

    if (attendance.length === 0) {
        renderEmptyRow(dom.attendanceTableBody, 5, 'No attendance records found.');
        return;
    }

    dom.attendanceTableBody.innerHTML = attendance
        .map((record) => `
            <tr>
                <td>${record.course_code || '-'}</td>
                <td>${record.course_name || '-'}</td>
                <td>${formatters.date(record.attendance_date)}</td>
                <td><span class="badge bg-${record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'}">${record.status}</span></td>
                <td>${record.remarks || '-'}</td>
            </tr>
        `)
        .join('');
};

const renderMarks = (marks) => {
    if (!dom.marksTableBody) {
        return;
    }

    if (marks.length === 0) {
        renderEmptyRow(dom.marksTableBody, 6, 'No marks records found.');
        return;
    }

    dom.marksTableBody.innerHTML = marks
        .map((record) => `
            <tr>
                <td>${record.course_code || '-'}</td>
                <td>${record.course_name || '-'}</td>
                <td>${record.assessment_type || '-'}</td>
                <td>${record.obtained_marks}/${record.max_marks}</td>
                <td>${formatters.date(record.assessment_date)}</td>
                <td>${record.remarks || '-'}</td>
            </tr>
        `)
        .join('');
};

const render = (state) => {
    const { auth, student } = state;

    if (dom.userName && auth.user) {
        dom.userName.textContent = auth.user.name;
    }

    if (dom.userAvatar && auth.user?.name) {
        dom.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=0d6efd&color=fff`;
    }

    setPageError(student.error || '');

    if (!student.profile) {
        return;
    }

    renderProfile(student.profile);

    const summary = buildCourseSummary(student.attendance, student.marks);
    renderStats(summary, student.attendance, student.marks);
    renderCourseSummary(summary);
    renderAttendance(student.attendance);
    renderMarks(student.marks);
};

const loadStudentData = async () => {
    store.setSlice('student', { loading: true, error: null });

    try {
        const [profileResponse, attendanceResponse, marksResponse] = await Promise.all([
            studentService.getProfile(),
            studentService.getAttendance(),
            studentService.getMarks()
        ]);

        store.setSlice('student', {
            loading: false,
            error: null,
            profile: profileResponse.student || null,
            attendance: attendanceResponse.attendance || [],
            marks: marksResponse.marks || []
        });
    } catch (error) {
        const message = error?.message || 'Failed to load student data.';
        store.setSlice('student', { loading: false, error: message });
        notify.error(message);
    }
};

export const initStudentPage = () => {
    authState.hydrate();
    if (!authState.requireAuth(['student'])) {
        return;
    }

    store.subscribe(render);
    render(store.getState());

    if (dom.reloadButton) {
        dom.reloadButton.addEventListener('click', loadStudentData);
    }

    dom.logoutLink?.addEventListener('click', (event) => {
        event.preventDefault();
        authState.logout();
    });

    loadStudentData();
};
