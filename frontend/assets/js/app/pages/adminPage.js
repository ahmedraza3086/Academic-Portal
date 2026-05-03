import { authState } from '../core/auth.js';
import { store } from '../core/store.js';
import { adminService } from '../services/adminService.js';
import { Validators } from '../utils/validators.js';
import { formatters } from '../utils/formatters.js';
import { notify } from '../ui/notifications.js';
import { formUi } from '../ui/forms.js';

const dom = {
    userName: document.getElementById('adminUserName'),
    userAvatar: document.getElementById('adminUserAvatar'),
    pageError: document.getElementById('adminPageError'),
    reloadButton: document.getElementById('reloadAdminData'),
    logoutLink: document.getElementById('adminLogoutLink'),

    statStudents: document.getElementById('adminStatStudents'),
    statFaculty: document.getElementById('adminStatFaculty'),
    statCourses: document.getElementById('adminStatCourses'),
    statEnrollments: document.getElementById('adminStatEnrollments'),

    studentForm: document.getElementById('studentForm'),
    studentRecordId: document.getElementById('student_record_id'),
    studentFormSubmit: document.getElementById('studentFormSubmit'),
    studentFormCancel: document.getElementById('studentFormCancel'),

    facultyForm: document.getElementById('facultyForm'),
    facultyRecordId: document.getElementById('faculty_record_id'),
    facultyFormSubmit: document.getElementById('facultyFormSubmit'),
    facultyFormCancel: document.getElementById('facultyFormCancel'),

    courseForm: document.getElementById('courseForm'),
    courseRecordId: document.getElementById('course_record_id'),
    courseFormSubmit: document.getElementById('courseFormSubmit'),
    courseFormCancel: document.getElementById('courseFormCancel'),

    enrollmentForm: document.getElementById('enrollmentForm'),
    enrollmentRecordId: document.getElementById('enrollment_record_id'),
    enrollmentFormSubmit: document.getElementById('enrollmentFormSubmit'),
    enrollmentFormCancel: document.getElementById('enrollmentFormCancel'),

    assignForm: document.getElementById('assignCourseForm'),
    assignSubmit: document.getElementById('assignCourseSubmit'),

    studentsTableBody: document.getElementById('adminStudentsTableBody'),
    facultyTableBody: document.getElementById('adminFacultyTableBody'),
    coursesTableBody: document.getElementById('adminCoursesTableBody'),
    enrollmentsTableBody: document.getElementById('adminEnrollmentsTableBody'),

    courseFacultySelect: document.getElementById('course_faculty_id'),
    enrollmentStudentSelect: document.getElementById('enrollment_student_id'),
    enrollmentCourseSelect: document.getElementById('enrollment_course_id'),
    assignCourseSelect: document.getElementById('assign_course_id'),
    assignFacultySelect: document.getElementById('assign_faculty_id')
};

const toNullable = (value) => {
    if (value === undefined || value === null) {
        return null;
    }
    const trimmed = String(value).trim();
    return trimmed === '' ? null : trimmed;
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

const updateFormMode = (entity, isEdit) => {
    const submitMap = {
        student: dom.studentFormSubmit,
        faculty: dom.facultyFormSubmit,
        course: dom.courseFormSubmit,
        enrollment: dom.enrollmentFormSubmit
    };

    const cancelMap = {
        student: dom.studentFormCancel,
        faculty: dom.facultyFormCancel,
        course: dom.courseFormCancel,
        enrollment: dom.enrollmentFormCancel
    };

    const submitButton = submitMap[entity];
    const cancelButton = cancelMap[entity];

    if (submitButton) {
        submitButton.textContent = isEdit ? `Update ${entity}` : `Create ${entity}`;
    }

    if (cancelButton) {
        cancelButton.classList.toggle('d-none', !isEdit);
    }
};

const renderSelectOptions = (selectElement, options, placeholder, valueKey, labelBuilder) => {
    if (!selectElement) {
        return;
    }

    const currentValue = selectElement.value;

    const builtOptions = [`<option value="">${placeholder}</option>`]
        .concat(options.map((item) => `<option value="${item[valueKey]}">${labelBuilder(item)}</option>`))
        .join('');

    selectElement.innerHTML = builtOptions;

    if (currentValue && selectElement.querySelector(`option[value="${currentValue}"]`)) {
        selectElement.value = currentValue;
    }
};

const renderStudentsTable = (students) => {
    if (!dom.studentsTableBody) {
        return;
    }

    if (students.length === 0) {
        renderEmptyRow(dom.studentsTableBody, 7, 'No students found.');
        return;
    }

    dom.studentsTableBody.innerHTML = students
        .map((student) => `
            <tr>
                <td>${student.student_id}</td>
                <td>${formatters.fullName(student.first_name, student.last_name)}</td>
                <td>${student.email || '-'}</td>
                <td>${student.major || '-'}</td>
                <td>${student.enrollment_year || '-'}</td>
                <td><button class="btn btn-sm btn-outline-secondary" data-action="edit-student" data-id="${student.student_id}">Edit</button></td>
                <td><button class="btn btn-sm btn-outline-danger" data-action="delete-student" data-id="${student.student_id}">Delete</button></td>
            </tr>
        `)
        .join('');
};

const renderFacultyTable = (faculty) => {
    if (!dom.facultyTableBody) {
        return;
    }

    if (faculty.length === 0) {
        renderEmptyRow(dom.facultyTableBody, 7, 'No faculty members found.');
        return;
    }

    dom.facultyTableBody.innerHTML = faculty
        .map((member) => `
            <tr>
                <td>${member.faculty_id}</td>
                <td>${formatters.fullName(member.first_name, member.last_name)}</td>
                <td>${member.email || '-'}</td>
                <td>${member.department || '-'}</td>
                <td>${formatters.date(member.hire_date)}</td>
                <td><button class="btn btn-sm btn-outline-secondary" data-action="edit-faculty" data-id="${member.faculty_id}">Edit</button></td>
                <td><button class="btn btn-sm btn-outline-danger" data-action="delete-faculty" data-id="${member.faculty_id}">Delete</button></td>
            </tr>
        `)
        .join('');
};

const renderCoursesTable = (courses) => {
    if (!dom.coursesTableBody) {
        return;
    }

    if (courses.length === 0) {
        renderEmptyRow(dom.coursesTableBody, 8, 'No courses found.');
        return;
    }

    dom.coursesTableBody.innerHTML = courses
        .map((course) => `
            <tr>
                <td>${course.course_id}</td>
                <td>${course.course_code}</td>
                <td>${course.course_name}</td>
                <td>${course.credits}</td>
                <td>${course.faculty_first_name ? `${course.faculty_first_name} ${course.faculty_last_name}` : '-'}</td>
                <td>${course.semester || '-'}</td>
                <td><button class="btn btn-sm btn-outline-secondary" data-action="edit-course" data-id="${course.course_id}">Edit</button></td>
                <td><button class="btn btn-sm btn-outline-danger" data-action="delete-course" data-id="${course.course_id}">Delete</button></td>
            </tr>
        `)
        .join('');
};

const renderEnrollmentsTable = (enrollments) => {
    if (!dom.enrollmentsTableBody) {
        return;
    }

    if (enrollments.length === 0) {
        renderEmptyRow(dom.enrollmentsTableBody, 8, 'No enrollments found.');
        return;
    }

    dom.enrollmentsTableBody.innerHTML = enrollments
        .map((enrollment) => `
            <tr>
                <td>${enrollment.enrollment_id}</td>
                <td>${enrollment.student_first} ${enrollment.student_last}</td>
                <td>${enrollment.course_code}</td>
                <td>${formatters.date(enrollment.enrollment_date)}</td>
                <td>${enrollment.status}</td>
                <td>${enrollment.grade || '-'}</td>
                <td><button class="btn btn-sm btn-outline-secondary" data-action="edit-enrollment" data-id="${enrollment.enrollment_id}">Edit</button></td>
                <td><button class="btn btn-sm btn-outline-danger" data-action="delete-enrollment" data-id="${enrollment.enrollment_id}">Delete</button></td>
            </tr>
        `)
        .join('');
};

const render = (state) => {
    const { auth, admin } = state;

    if (dom.userName && auth.user) {
        dom.userName.textContent = auth.user.name;
    }

    if (dom.userAvatar && auth.user?.name) {
        dom.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=0d6efd&color=fff`;
    }

    setPageError(admin.error || '');

    if (dom.statStudents) dom.statStudents.textContent = String(admin.students.length);
    if (dom.statFaculty) dom.statFaculty.textContent = String(admin.faculty.length);
    if (dom.statCourses) dom.statCourses.textContent = String(admin.courses.length);
    if (dom.statEnrollments) dom.statEnrollments.textContent = String(admin.enrollments.length);

    renderStudentsTable(admin.students);
    renderFacultyTable(admin.faculty);
    renderCoursesTable(admin.courses);
    renderEnrollmentsTable(admin.enrollments);

    renderSelectOptions(
        dom.courseFacultySelect,
        admin.faculty,
        'Select faculty',
        'faculty_id',
        (member) => `${member.first_name} ${member.last_name}`
    );

    renderSelectOptions(
        dom.enrollmentStudentSelect,
        admin.students,
        'Select student',
        'student_id',
        (student) => `${student.first_name} ${student.last_name} (${student.student_id})`
    );

    renderSelectOptions(
        dom.enrollmentCourseSelect,
        admin.courses,
        'Select course',
        'course_id',
        (course) => `${course.course_code} - ${course.course_name}`
    );

    renderSelectOptions(
        dom.assignCourseSelect,
        admin.courses,
        'Select course',
        'course_id',
        (course) => `${course.course_code} - ${course.course_name}`
    );

    renderSelectOptions(
        dom.assignFacultySelect,
        admin.faculty,
        'Select faculty',
        'faculty_id',
        (member) => `${member.first_name} ${member.last_name}`
    );
};

const loadAdminData = async () => {
    store.setSlice('admin', { loading: true, error: null });

    try {
        const [studentsResponse, facultyResponse, coursesResponse, enrollmentsResponse] = await Promise.all([
            adminService.getStudents(),
            adminService.getFaculty(),
            adminService.getCourses(),
            adminService.getEnrollments()
        ]);

        store.setSlice('admin', {
            loading: false,
            error: null,
            students: studentsResponse.students || [],
            faculty: facultyResponse.faculty || [],
            courses: coursesResponse.courses || [],
            enrollments: enrollmentsResponse.enrollments || []
        });
    } catch (error) {
        const message = error?.message || 'Failed to load admin data.';
        store.setSlice('admin', { loading: false, error: message });
        notify.error(message);
    }
};

const handleStudentSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());
    const recordId = formData.student_record_id;

    const errors = {};
    if (!Validators.required(formData.first_name)) errors.first_name = 'First name is required';
    if (!Validators.required(formData.last_name)) errors.last_name = 'Last name is required';
    if (!Validators.isEmail(formData.email)) errors.email = 'Valid email is required';
    if (!recordId && !Validators.hasMinLength(formData.password, 6)) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password && !Validators.hasMinLength(formData.password, 6)) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
        formUi.showErrors(form, errors);
        return;
    }

    const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: toNullable(formData.phone),
        date_of_birth: toNullable(formData.date_of_birth),
        enrollment_year: toNullable(formData.enrollment_year),
        major: toNullable(formData.major)
    };

    if (Validators.required(formData.password)) {
        payload.password = formData.password;
    }

    const submitButton = event.submitter || dom.studentFormSubmit;
    formUi.setSubmitting(submitButton, true);

    try {
        if (recordId) {
            await adminService.updateStudent(recordId, payload);
            notify.success('Student updated successfully.');
        } else {
            await adminService.createStudent(payload);
            notify.success('Student created successfully.');
        }

        form.reset();
        dom.studentRecordId.value = '';
        updateFormMode('student', false);
        formUi.clearErrors(form);
        await loadAdminData();
    } catch (error) {
        notify.error(error?.message || 'Failed to save student.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const handleFacultySubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());
    const recordId = formData.faculty_record_id;

    const errors = {};
    if (!Validators.required(formData.first_name)) errors.first_name = 'First name is required';
    if (!Validators.required(formData.last_name)) errors.last_name = 'Last name is required';
    if (!Validators.isEmail(formData.email)) errors.email = 'Valid email is required';
    if (!recordId && !Validators.hasMinLength(formData.password, 6)) {
        errors.password = 'Password must be at least 6 characters';
    }
    if (formData.password && !Validators.hasMinLength(formData.password, 6)) {
        errors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(errors).length > 0) {
        formUi.showErrors(form, errors);
        return;
    }

    const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        email: formData.email.trim(),
        phone: toNullable(formData.phone),
        department: toNullable(formData.department),
        hire_date: toNullable(formData.hire_date)
    };

    if (Validators.required(formData.password)) {
        payload.password = formData.password;
    }

    const submitButton = event.submitter || dom.facultyFormSubmit;
    formUi.setSubmitting(submitButton, true);

    try {
        if (recordId) {
            await adminService.updateFaculty(recordId, payload);
            notify.success('Faculty updated successfully.');
        } else {
            await adminService.createFaculty(payload);
            notify.success('Faculty created successfully.');
        }

        form.reset();
        dom.facultyRecordId.value = '';
        updateFormMode('faculty', false);
        formUi.clearErrors(form);
        await loadAdminData();
    } catch (error) {
        notify.error(error?.message || 'Failed to save faculty.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const handleCourseSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());
    const recordId = formData.course_record_id;

    const errors = {};
    if (!Validators.required(formData.course_code)) errors.course_code = 'Course code is required';
    if (!Validators.required(formData.course_name)) errors.course_name = 'Course name is required';
    if (!Validators.positiveNumber(formData.credits)) errors.credits = 'Credits must be greater than 0';
    if (!Validators.required(formData.faculty_id)) errors.faculty_id = 'Faculty is required';

    if (Object.keys(errors).length > 0) {
        formUi.showErrors(form, errors);
        return;
    }

    const payload = {
        course_code: formData.course_code.trim(),
        course_name: formData.course_name.trim(),
        credits: Number(formData.credits),
        faculty_id: Number(formData.faculty_id),
        semester: toNullable(formData.semester),
        description: toNullable(formData.description)
    };

    const submitButton = event.submitter || dom.courseFormSubmit;
    formUi.setSubmitting(submitButton, true);

    try {
        if (recordId) {
            await adminService.updateCourse(recordId, payload);
            notify.success('Course updated successfully.');
        } else {
            await adminService.createCourse(payload);
            notify.success('Course created successfully.');
        }

        form.reset();
        dom.courseRecordId.value = '';
        updateFormMode('course', false);
        formUi.clearErrors(form);
        await loadAdminData();
    } catch (error) {
        notify.error(error?.message || 'Failed to save course.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const handleEnrollmentSubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = Object.fromEntries(new FormData(form).entries());
    const recordId = formData.enrollment_record_id;

    const errors = {};
    if (!recordId) {
        if (!Validators.required(formData.student_id)) errors.student_id = 'Student is required';
        if (!Validators.required(formData.course_id)) errors.course_id = 'Course is required';
        if (!Validators.required(formData.enrollment_date)) errors.enrollment_date = 'Enrollment date is required';
    }

    if (Object.keys(errors).length > 0) {
        formUi.showErrors(form, errors);
        return;
    }

    const submitButton = event.submitter || dom.enrollmentFormSubmit;
    formUi.setSubmitting(submitButton, true);

    try {
        if (recordId) {
            await adminService.updateEnrollment(recordId, {
                status: toNullable(formData.status),
                grade: toNullable(formData.grade)
            });
            notify.success('Enrollment updated successfully.');
        } else {
            await adminService.createEnrollment({
                student_id: Number(formData.student_id),
                course_id: Number(formData.course_id),
                enrollment_date: formData.enrollment_date,
                status: toNullable(formData.status) || 'active'
            });
            notify.success('Enrollment created successfully.');
        }

        form.reset();
        dom.enrollmentRecordId.value = '';
        updateFormMode('enrollment', false);
        formUi.clearErrors(form);
        await loadAdminData();
    } catch (error) {
        notify.error(error?.message || 'Failed to save enrollment.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const handleAssignSubmit = async (event) => {
    event.preventDefault();
    const formData = Object.fromEntries(new FormData(event.currentTarget).entries());

    if (!Validators.required(formData.course_id) || !Validators.required(formData.faculty_id)) {
        notify.warning('Please select both course and faculty.');
        return;
    }

    const submitButton = event.submitter || dom.assignSubmit;
    formUi.setSubmitting(submitButton, true, 'Assigning...');

    try {
        await adminService.assignCourseToFaculty(Number(formData.course_id), Number(formData.faculty_id));
        notify.success('Course assigned successfully.');
        await loadAdminData();
    } catch (error) {
        notify.error(error?.message || 'Failed to assign course.');
    } finally {
        formUi.setSubmitting(submitButton, false);
    }
};

const populateStudentForm = (student) => {
    if (!dom.studentForm) {
        return;
    }

    dom.studentRecordId.value = student.student_id;
    dom.studentForm.elements.first_name.value = student.first_name || '';
    dom.studentForm.elements.last_name.value = student.last_name || '';
    dom.studentForm.elements.email.value = student.email || '';
    dom.studentForm.elements.phone.value = student.phone || '';
    dom.studentForm.elements.date_of_birth.value = student.date_of_birth ? String(student.date_of_birth).slice(0, 10) : '';
    dom.studentForm.elements.enrollment_year.value = student.enrollment_year || '';
    dom.studentForm.elements.major.value = student.major || '';
    dom.studentForm.elements.password.value = '';
    updateFormMode('student', true);
};

const populateFacultyForm = (member) => {
    if (!dom.facultyForm) {
        return;
    }

    dom.facultyRecordId.value = member.faculty_id;
    dom.facultyForm.elements.first_name.value = member.first_name || '';
    dom.facultyForm.elements.last_name.value = member.last_name || '';
    dom.facultyForm.elements.email.value = member.email || '';
    dom.facultyForm.elements.phone.value = member.phone || '';
    dom.facultyForm.elements.department.value = member.department || '';
    dom.facultyForm.elements.hire_date.value = member.hire_date ? String(member.hire_date).slice(0, 10) : '';
    dom.facultyForm.elements.password.value = '';
    updateFormMode('faculty', true);
};

const populateCourseForm = (course) => {
    if (!dom.courseForm) {
        return;
    }

    dom.courseRecordId.value = course.course_id;
    dom.courseForm.elements.course_code.value = course.course_code || '';
    dom.courseForm.elements.course_name.value = course.course_name || '';
    dom.courseForm.elements.credits.value = course.credits || '';
    dom.courseForm.elements.faculty_id.value = course.faculty_id || '';
    dom.courseForm.elements.semester.value = course.semester || '';
    dom.courseForm.elements.description.value = course.description || '';
    updateFormMode('course', true);
};

const populateEnrollmentForm = (enrollment) => {
    if (!dom.enrollmentForm) {
        return;
    }

    dom.enrollmentRecordId.value = enrollment.enrollment_id;
    dom.enrollmentForm.elements.student_id.value = enrollment.student_id || '';
    dom.enrollmentForm.elements.course_id.value = enrollment.course_id || '';
    dom.enrollmentForm.elements.enrollment_date.value = enrollment.enrollment_date ? String(enrollment.enrollment_date).slice(0, 10) : '';
    dom.enrollmentForm.elements.status.value = enrollment.status || 'active';
    dom.enrollmentForm.elements.grade.value = enrollment.grade || '';
    updateFormMode('enrollment', true);
};

const handleStudentsTableAction = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const recordId = button.dataset.id;
    const students = store.getState().admin.students;
    const selected = students.find((item) => String(item.student_id) === String(recordId));

    if (!selected) {
        return;
    }

    if (action === 'edit-student') {
        populateStudentForm(selected);
        return;
    }

    if (action === 'delete-student') {
        if (!window.confirm('Delete this student?')) {
            return;
        }

        try {
            await adminService.deleteStudent(recordId);
            notify.success('Student deleted successfully.');
            await loadAdminData();
        } catch (error) {
            notify.error(error?.message || 'Failed to delete student.');
        }
    }
};

const handleFacultyTableAction = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const recordId = button.dataset.id;
    const members = store.getState().admin.faculty;
    const selected = members.find((item) => String(item.faculty_id) === String(recordId));

    if (!selected) {
        return;
    }

    if (action === 'edit-faculty') {
        populateFacultyForm(selected);
        return;
    }

    if (action === 'delete-faculty') {
        if (!window.confirm('Delete this faculty member?')) {
            return;
        }

        try {
            await adminService.deleteFaculty(recordId);
            notify.success('Faculty deleted successfully.');
            await loadAdminData();
        } catch (error) {
            notify.error(error?.message || 'Failed to delete faculty member.');
        }
    }
};

const handleCoursesTableAction = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const recordId = button.dataset.id;
    const courses = store.getState().admin.courses;
    const selected = courses.find((item) => String(item.course_id) === String(recordId));

    if (!selected) {
        return;
    }

    if (action === 'edit-course') {
        populateCourseForm(selected);
        return;
    }

    if (action === 'delete-course') {
        if (!window.confirm('Delete this course?')) {
            return;
        }

        try {
            await adminService.deleteCourse(recordId);
            notify.success('Course deleted successfully.');
            await loadAdminData();
        } catch (error) {
            notify.error(error?.message || 'Failed to delete course.');
        }
    }
};

const handleEnrollmentsTableAction = async (event) => {
    const button = event.target.closest('button[data-action]');
    if (!button) {
        return;
    }

    const action = button.dataset.action;
    const recordId = button.dataset.id;
    const enrollments = store.getState().admin.enrollments;
    const selected = enrollments.find((item) => String(item.enrollment_id) === String(recordId));

    if (!selected) {
        return;
    }

    if (action === 'edit-enrollment') {
        populateEnrollmentForm(selected);
        return;
    }

    if (action === 'delete-enrollment') {
        if (!window.confirm('Delete this enrollment?')) {
            return;
        }

        try {
            await adminService.deleteEnrollment(recordId);
            notify.success('Enrollment deleted successfully.');
            await loadAdminData();
        } catch (error) {
            notify.error(error?.message || 'Failed to delete enrollment.');
        }
    }
};

const attachEventListeners = () => {
    dom.reloadButton?.addEventListener('click', loadAdminData);

    dom.logoutLink?.addEventListener('click', (event) => {
        event.preventDefault();
        authState.logout();
    });

    dom.studentForm?.addEventListener('submit', handleStudentSubmit);
    dom.facultyForm?.addEventListener('submit', handleFacultySubmit);
    dom.courseForm?.addEventListener('submit', handleCourseSubmit);
    dom.enrollmentForm?.addEventListener('submit', handleEnrollmentSubmit);
    dom.assignForm?.addEventListener('submit', handleAssignSubmit);

    dom.studentsTableBody?.addEventListener('click', handleStudentsTableAction);
    dom.facultyTableBody?.addEventListener('click', handleFacultyTableAction);
    dom.coursesTableBody?.addEventListener('click', handleCoursesTableAction);
    dom.enrollmentsTableBody?.addEventListener('click', handleEnrollmentsTableAction);

    dom.studentFormCancel?.addEventListener('click', () => {
        dom.studentForm?.reset();
        dom.studentRecordId.value = '';
        updateFormMode('student', false);
    });

    dom.facultyFormCancel?.addEventListener('click', () => {
        dom.facultyForm?.reset();
        dom.facultyRecordId.value = '';
        updateFormMode('faculty', false);
    });

    dom.courseFormCancel?.addEventListener('click', () => {
        dom.courseForm?.reset();
        dom.courseRecordId.value = '';
        updateFormMode('course', false);
    });

    dom.enrollmentFormCancel?.addEventListener('click', () => {
        dom.enrollmentForm?.reset();
        dom.enrollmentRecordId.value = '';
        updateFormMode('enrollment', false);
    });
};

export const initAdminPage = () => {
    authState.hydrate();
    if (!authState.requireAuth(['admin'])) {
        return;
    }

    store.subscribe(render);
    render(store.getState());

    updateFormMode('student', false);
    updateFormMode('faculty', false);
    updateFormMode('course', false);
    updateFormMode('enrollment', false);

    attachEventListeners();
    loadAdminData();
};
