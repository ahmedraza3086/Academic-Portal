import { authState } from '../core/auth.js';
import { store } from '../core/store.js';
import { facultyService } from '../services/facultyService.js';
import { Validators } from '../utils/validators.js';
import { formatters } from '../utils/formatters.js';
import { notify } from '../ui/notifications.js';
import { formUi } from '../ui/forms.js';

const dom = {
    userName: document.getElementById('facultyUserName'),
    userAvatar: document.getElementById('facultyUserAvatar'),
    pageError: document.getElementById('facultyPageError'),
    logoutLink: document.getElementById('facultyLogoutLink'),
    courseSelect: document.getElementById('facultyCourseSelect'),
    reloadButton: document.getElementById('reloadFacultyData'),
    attendanceFilterDate: document.getElementById('attendanceFilterDate'),
    applyAttendanceFilter: document.getElementById('applyAttendanceFilter'),

    statCourses: document.getElementById('facultyStatCourses'),
    statStudents: document.getElementById('facultyStatStudents'),
    statAttendanceRecords: document.getElementById('facultyStatAttendanceRecords'),
    statMarksRecords: document.getElementById('facultyStatMarksRecords'),

    studentsTableBody: document.getElementById('facultyStudentsTableBody'),
    attendanceEntryForm: document.getElementById('attendanceEntryForm'),
    attendanceEntryDate: document.getElementById('attendanceEntryDate'),
    attendanceEntryTableBody: document.getElementById('attendanceEntryTableBody'),

    attendanceRecordsTableBody: document.getElementById('attendanceRecordsTableBody'),
    attendanceUpdateForm: document.getElementById('attendanceUpdateForm'),
    attendanceUpdateId: document.getElementById('attendanceUpdateId'),
    attendanceUpdateStatus: document.getElementById('attendanceUpdateStatus'),
    attendanceUpdateRemarks: document.getElementById('attendanceUpdateRemarks'),

    marksForm: document.getElementById('marksForm'),
    marksStudentId: document.getElementById('marksStudentId'),
    marksType: document.getElementById('marksAssessmentType'),
    marksObtained: document.getElementById('marksObtained'),
    marksMax: document.getElementById('marksMax'),
    marksDate: document.getElementById('marksDate'),
    marksRemarks: document.getElementById('marksRemarks'),

    marksTableBody: document.getElementById('marksRecordsTableBody'),
    marksUpdateForm: document.getElementById('marksUpdateForm'),
    marksUpdateId: document.getElementById('marksUpdateId'),
    marksUpdateType: document.getElementById('marksUpdateType'),
    marksUpdateObtained: document.getElementById('marksUpdateObtained'),
    marksUpdateMax: document.getElementById('marksUpdateMax'),
    marksUpdateDate: document.getElementById('marksUpdateDate'),
    marksUpdateRemarks: document.getElementById('marksUpdateRemarks'),

    performancePanel: document.getElementById('studentPerformancePanel')
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

const getSelectedCourseId = () => store.getState().faculty.selectedCourseId;

const renderCourseOptions = (courses, selectedCourseId) => {
    if (!dom.courseSelect) {
        return;
    }

    if (courses.length === 0) {
        dom.courseSelect.innerHTML = '<option value="">No courses assigned</option>';
        return;
    }

    dom.courseSelect.innerHTML = courses
        .map((course) => `<option value="${course.course_id}" ${String(course.course_id) === String(selectedCourseId) ? 'selected' : ''}>${course.course_code} - ${course.course_name}</option>`)
        .join('');
};

const renderStudentOptions = (students) => {
    if (!dom.marksStudentId) {
        return;
    }

    if (students.length === 0) {
        dom.marksStudentId.innerHTML = '<option value="">No students available</option>';
        return;
    }

    dom.marksStudentId.innerHTML = ['<option value="">Select student</option>']
        .concat(students.map((student) => `<option value="${student.student_id}">${formatters.fullName(student.first_name, student.last_name)} (${student.student_id})</option>`))
        .join('');
};

const renderStudents = (students) => {
    if (!dom.studentsTableBody) {
        return;
    }

    if (students.length === 0) {
        renderEmptyRow(dom.studentsTableBody, 5, 'No students enrolled in this course.');
        return;
    }

    dom.studentsTableBody.innerHTML = students
        .map((student) => `
            <tr>
                <td>${student.student_id}</td>
                <td>${formatters.fullName(student.first_name, student.last_name)}</td>
                <td>${student.email || '-'}</td>
                <td>${formatters.date(student.enrollment_date)}</td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" data-action="view-performance" data-student-id="${student.student_id}">View Performance</button>
                </td>
            </tr>
        `)
        .join('');
};

const renderAttendanceEntryRows = (students) => {
    if (!dom.attendanceEntryTableBody) {
        return;
    }

    if (students.length === 0) {
        renderEmptyRow(dom.attendanceEntryTableBody, 3, 'Select a course with enrolled students.');
        return;
    }

    dom.attendanceEntryTableBody.innerHTML = students
        .map((student) => `
            <tr data-student-id="${student.student_id}">
                <td>${formatters.fullName(student.first_name, student.last_name)}</td>
                <td>
                    <select class="form-select form-select-sm" name="status">
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="excused">Excused</option>
                    </select>
                </td>
                <td>
                    <input class="form-control form-control-sm" name="remarks" placeholder="Optional remarks">
                </td>
            </tr>
        `)
        .join('');
};

const renderAttendanceRecords = (records) => {
    if (!dom.attendanceRecordsTableBody) {
        return;
    }

    if (records.length === 0) {
        renderEmptyRow(dom.attendanceRecordsTableBody, 7, 'No attendance records found.');
        return;
    }

    dom.attendanceRecordsTableBody.innerHTML = records
        .map((record) => `
            <tr>
                <td>${record.attendance_id}</td>
                <td>${formatters.fullName(record.first_name, record.last_name)}</td>
                <td>${formatters.date(record.attendance_date)}</td>
                <td><span class="badge bg-${record.status === 'present' ? 'success' : record.status === 'absent' ? 'danger' : 'warning'}">${record.status}</span></td>
                <td>${record.remarks || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-outline-secondary" data-action="edit-attendance" data-attendance-id="${record.attendance_id}">Edit</button>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline-danger" data-action="delete-attendance" data-attendance-id="${record.attendance_id}">Delete</button>
                </td>
            </tr>
        `)
        .join('');
};

const renderMarks = (records) => {
    if (!dom.marksTableBody) {
        return;
    }

    if (records.length === 0) {
        renderEmptyRow(dom.marksTableBody, 8, 'No marks records found.');
        return;
    }

    dom.marksTableBody.innerHTML = records
        .map((record) => `
            <tr>
                <td>${record.marks_id}</td>
                <td>${formatters.fullName(record.first_name, record.last_name)}</td>
                <td>${record.assessment_type}</td>
                <td>${record.obtained_marks}/${record.max_marks}</td>
                <td>${formatters.date(record.assessment_date)}</td>
                <td>${record.remarks || '-'}</td>
                <td><button class="btn btn-sm btn-outline-secondary" data-action="edit-marks" data-marks-id="${record.marks_id}">Edit</button></td>
                <td><button class="btn btn-sm btn-outline-danger" data-action="delete-marks" data-marks-id="${record.marks_id}">Delete</button></td>
            </tr>
        `)
        .join('');
};

const renderStats = (courses, students, attendance, marks) => {
    if (dom.statCourses) dom.statCourses.textContent = String(courses.length);
    if (dom.statStudents) dom.statStudents.textContent = String(students.length);
    if (dom.statAttendanceRecords) dom.statAttendanceRecords.textContent = String(attendance.length);
    if (dom.statMarksRecords) dom.statMarksRecords.textContent = String(marks.length);
};

const render = (state) => {
    const { auth, faculty } = state;

    if (dom.userName && auth.user) {
        dom.userName.textContent = auth.user.name;
    }

    if (dom.userAvatar && auth.user?.name) {
        dom.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=198754&color=fff`;
    }

    setPageError(faculty.error || '');

    renderCourseOptions(faculty.courses, faculty.selectedCourseId);
    renderStudentOptions(faculty.students);
    renderStudents(faculty.students);
    renderAttendanceEntryRows(faculty.students);
    renderAttendanceRecords(faculty.attendance);
    renderMarks(faculty.marks);
    renderStats(faculty.courses, faculty.students, faculty.attendance, faculty.marks);
};

const loadCourses = async () => {
    store.setSlice('faculty', { loading: true, error: null });

    try {
        const response = await facultyService.getMyCourses();
        const courses = response.courses || [];
        const selectedCourseId = getSelectedCourseId() || (courses[0] ? courses[0].course_id : null);

        store.setSlice('faculty', {
            loading: false,
            error: null,
            courses,
            selectedCourseId
        });

        if (selectedCourseId) {
            await loadCourseData(selectedCourseId);
        }
    } catch (error) {
        const message = error?.message || 'Failed to load courses.';
        store.setSlice('faculty', { loading: false, error: message });
        notify.error(message);
    }
};

const loadCourseData = async (courseId) => {
    if (!courseId) {
        return;
    }

    store.setSlice('faculty', { loading: true, error: null, selectedCourseId: Number(courseId) });

    try {
        const dateFilter = dom.attendanceFilterDate?.value || '';
        const [studentsResponse, attendanceResponse, marksResponse] = await Promise.all([
            facultyService.getCourseStudents(courseId),
            facultyService.getCourseAttendance(courseId, dateFilter),
            facultyService.getCourseMarks(courseId)
        ]);

        store.setSlice('faculty', {
            loading: false,
            error: null,
            students: studentsResponse.students || [],
            attendance: attendanceResponse.attendance || [],
            marks: marksResponse.marks || []
        });
    } catch (error) {
        const message = error?.message || 'Failed to load course data.';
        store.setSlice('faculty', { loading: false, error: message });
        notify.error(message);
    }
};

const submitAttendanceEntries = async (event) => {
    event.preventDefault();

    const courseId = getSelectedCourseId();
    const attendanceDate = dom.attendanceEntryDate?.value;

    if (!courseId) {
        notify.warning('Please select a course first.');
        return;
    }

    if (!attendanceDate) {
        notify.warning('Please choose an attendance date.');
        return;
    }

    const rows = Array.from(dom.attendanceEntryTableBody?.querySelectorAll('tr[data-student-id]') || []);
    if (rows.length === 0) {
        notify.warning('No students available for attendance submission.');
        return;
    }

    const submitButton = event.submitter || dom.attendanceEntryForm?.querySelector('button[type="submit"]');
    formUi.setSubmitting(submitButton, true, 'Submitting...');

    try {
        await Promise.all(
            rows.map((row) => {
                const studentId = row.dataset.studentId;
                const status = row.querySelector('select[name="status"]')?.value;
                const remarks = row.querySelector('input[name="remarks"]')?.value?.trim() || '';

                return facultyService.addAttendance({
                    student_id: Number(studentId),
                    course_id: Number(courseId),
                    attendance_date: attendanceDate,
                    status,
                    remarks
                });
            })
        );

        notify.success('Attendance submitted successfully.');
        await loadCourseData(courseId);
    } catch (error) {
        notify.error(error?.message || 'Failed to submit attendance.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const submitMarks = async (event) => {
    event.preventDefault();

    const courseId = getSelectedCourseId();
    const studentId = dom.marksStudentId?.value;
    const assessmentType = dom.marksType?.value;
    const obtainedMarks = dom.marksObtained?.value;
    const maxMarks = dom.marksMax?.value;
    const assessmentDate = dom.marksDate?.value;
    const remarks = dom.marksRemarks?.value?.trim() || '';

    if (!courseId || !studentId || !assessmentType || !Validators.nonNegativeNumber(obtainedMarks) || !Validators.positiveNumber(maxMarks)) {
        notify.warning('Please provide valid marks input values.');
        return;
    }

    if (Number(obtainedMarks) > Number(maxMarks)) {
        notify.warning('Obtained marks cannot exceed max marks.');
        return;
    }

    const submitButton = event.submitter || dom.marksForm?.querySelector('button[type="submit"]');
    formUi.setSubmitting(submitButton, true, 'Saving...');

    try {
        await facultyService.addMarks({
            student_id: Number(studentId),
            course_id: Number(courseId),
            assessment_type: assessmentType,
            obtained_marks: Number(obtainedMarks),
            max_marks: Number(maxMarks),
            assessment_date: assessmentDate || null,
            remarks
        });

        notify.success('Marks recorded successfully.');
        dom.marksForm?.reset();
        await loadCourseData(courseId);
    } catch (error) {
        notify.error(error?.message || 'Failed to save marks.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const submitAttendanceUpdate = async (event) => {
    event.preventDefault();

    const attendanceId = dom.attendanceUpdateId?.value;
    if (!attendanceId) {
        notify.warning('Select an attendance record to update.');
        return;
    }

    const submitButton = event.submitter || dom.attendanceUpdateForm?.querySelector('button[type="submit"]');
    formUi.setSubmitting(submitButton, true, 'Updating...');

    try {
        await facultyService.updateAttendance(attendanceId, {
            status: dom.attendanceUpdateStatus?.value,
            remarks: dom.attendanceUpdateRemarks?.value?.trim() || ''
        });

        notify.success('Attendance updated successfully.');
        dom.attendanceUpdateForm?.reset();
        if (dom.attendanceUpdateId) dom.attendanceUpdateId.value = '';
        await loadCourseData(getSelectedCourseId());
    } catch (error) {
        notify.error(error?.message || 'Failed to update attendance.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const submitMarksUpdate = async (event) => {
    event.preventDefault();

    const marksId = dom.marksUpdateId?.value;
    if (!marksId) {
        notify.warning('Select a marks record to update.');
        return;
    }

    if (
        !Validators.nonNegativeNumber(dom.marksUpdateObtained?.value) ||
        !Validators.positiveNumber(dom.marksUpdateMax?.value)
    ) {
        notify.warning('Please provide valid marks values.');
        return;
    }

    if (Number(dom.marksUpdateObtained.value) > Number(dom.marksUpdateMax.value)) {
        notify.warning('Obtained marks cannot exceed max marks.');
        return;
    }

    const submitButton = event.submitter || dom.marksUpdateForm?.querySelector('button[type="submit"]');
    formUi.setSubmitting(submitButton, true, 'Updating...');

    try {
        await facultyService.updateMarks(marksId, {
            assessment_type: dom.marksUpdateType?.value,
            obtained_marks: Number(dom.marksUpdateObtained?.value),
            max_marks: Number(dom.marksUpdateMax?.value),
            assessment_date: dom.marksUpdateDate?.value || null,
            remarks: dom.marksUpdateRemarks?.value?.trim() || ''
        });

        notify.success('Marks updated successfully.');
        dom.marksUpdateForm?.reset();
        if (dom.marksUpdateId) dom.marksUpdateId.value = '';
        await loadCourseData(getSelectedCourseId());
    } catch (error) {
        notify.error(error?.message || 'Failed to update marks.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const renderPerformance = (studentId, payload) => {
    if (!dom.performancePanel) {
        return;
    }

    const enrollmentList = (payload.enrollments || []).map((item) => `${item.course_code} - ${item.course_name}`).join(', ') || 'None';
    const attendanceList = (payload.attendanceSummary || [])
        .map((item) => `${item.course_code}: P=${item.present}, A=${item.absent}, E=${item.excused}`)
        .join(' | ') || 'No attendance summary';

    dom.performancePanel.innerHTML = `
        <div class="small text-muted mb-2">Student ID: ${studentId}</div>
        <div class="mb-2"><strong>Courses:</strong> ${enrollmentList}</div>
        <div class="mb-2"><strong>Attendance:</strong> ${attendanceList}</div>
        <div><strong>Marks Entries:</strong> ${(payload.marks || []).length}</div>
    `;
};

const handleStudentActions = async (event) => {
    const button = event.target.closest('button[data-action="view-performance"]');
    if (!button) {
        return;
    }

    const studentId = button.dataset.studentId;

    try {
        const performance = await facultyService.getStudentPerformance(studentId);
        renderPerformance(studentId, performance);
    } catch (error) {
        notify.error(error?.message || 'Failed to load student performance.');
    }
};

const handleAttendanceRecordActions = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const attendanceId = button.dataset.attendanceId;
    const records = store.getState().faculty.attendance;
    const selected = records.find((item) => String(item.attendance_id) === String(attendanceId));

    if (!selected) {
        return;
    }

    if (action === 'edit-attendance') {
        dom.attendanceUpdateId.value = selected.attendance_id;
        dom.attendanceUpdateStatus.value = selected.status;
        dom.attendanceUpdateRemarks.value = selected.remarks || '';
        return;
    }

    if (action === 'delete-attendance') {
        if (!window.confirm('Delete this attendance record?')) {
            return;
        }

        try {
            await facultyService.deleteAttendance(attendanceId);
            notify.success('Attendance record deleted.');
            await loadCourseData(getSelectedCourseId());
        } catch (error) {
            notify.error(error?.message || 'Failed to delete attendance record.');
        }
    }
};

const handleMarksActions = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const marksId = button.dataset.marksId;
    const records = store.getState().faculty.marks;
    const selected = records.find((item) => String(item.marks_id) === String(marksId));

    if (!selected) {
        return;
    }

    if (action === 'edit-marks') {
        dom.marksUpdateId.value = selected.marks_id;
        dom.marksUpdateType.value = selected.assessment_type;
        dom.marksUpdateObtained.value = selected.obtained_marks;
        dom.marksUpdateMax.value = selected.max_marks;
        dom.marksUpdateDate.value = selected.assessment_date ? String(selected.assessment_date).slice(0, 10) : '';
        dom.marksUpdateRemarks.value = selected.remarks || '';
        return;
    }

    if (action === 'delete-marks') {
        if (!window.confirm('Delete this marks record?')) {
            return;
        }

        try {
            await facultyService.deleteMarks(marksId);
            notify.success('Marks record deleted.');
            await loadCourseData(getSelectedCourseId());
        } catch (error) {
            notify.error(error?.message || 'Failed to delete marks record.');
        }
    }
};

const attachEventListeners = () => {
    dom.logoutLink?.addEventListener('click', (event) => {
        event.preventDefault();
        authState.logout();
    });

    dom.courseSelect?.addEventListener('change', (event) => {
        const courseId = event.target.value;
        store.setSlice('faculty', { selectedCourseId: Number(courseId) || null });
        if (courseId) {
            loadCourseData(courseId);
        }
    });

    dom.reloadButton?.addEventListener('click', () => {
        const courseId = getSelectedCourseId();
        if (!courseId) {
            loadCourses();
            return;
        }
        loadCourseData(courseId);
    });

    dom.applyAttendanceFilter?.addEventListener('click', () => {
        const courseId = getSelectedCourseId();
        if (courseId) {
            loadCourseData(courseId);
        }
    });

    dom.attendanceEntryForm?.addEventListener('submit', submitAttendanceEntries);
    dom.marksForm?.addEventListener('submit', submitMarks);
    dom.attendanceUpdateForm?.addEventListener('submit', submitAttendanceUpdate);
    dom.marksUpdateForm?.addEventListener('submit', submitMarksUpdate);

    dom.studentsTableBody?.addEventListener('click', handleStudentActions);
    dom.attendanceRecordsTableBody?.addEventListener('click', handleAttendanceRecordActions);
    dom.marksTableBody?.addEventListener('click', handleMarksActions);
};

export const initFacultyPage = () => {
    authState.hydrate();
    if (!authState.requireAuth(['faculty'])) {
        return;
    }

    store.subscribe(render);
    render(store.getState());

    attachEventListeners();
    loadCourses();
};
