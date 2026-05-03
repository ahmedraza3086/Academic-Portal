import { authState }      from '../core/auth.js';
import { store }          from '../core/store.js';
import { advancedService } from '../services/advancedService.js';
import { formatters }     from '../utils/formatters.js';
import { notify }         from '../ui/notifications.js';
import { formUi }         from '../ui/forms.js';

// ── DOM references ─────────────────────────────────────────────────────────
const dom = {
    userName:   document.getElementById('advancedUserName'),
    userAvatar: document.getElementById('advancedUserAvatar'),
    logoutLink: document.getElementById('advancedLogoutLink'),

    // Transcript
    transcriptStudentId: document.getElementById('transcript-student-id'),
    transcriptResult:    document.getElementById('transcript-result'),
    transcriptBtn:       document.getElementById('transcriptBtn'),

    // GPA
    gpaStudentId: document.getElementById('gpa-student-id'),
    gpaResult:    document.getElementById('gpa-result'),
    gpaBtn:       document.getElementById('gpaBtn'),

    // Reports
    reportResult:        document.getElementById('report-result'),
    reportBtnLowAtt:     document.getElementById('reportBtnLowAtt'),
    reportBtnTopPerf:    document.getElementById('reportBtnTopPerf'),
    reportBtnFacWork:    document.getElementById('reportBtnFacWork'),
    reportBtnUnenrolled: document.getElementById('reportBtnUnenrolled'),
    reportBtnPopularity: document.getElementById('reportBtnPopularity'),

    // Enroll
    enrollStudentId: document.getElementById('enroll-student-id'),
    enrollCourseId:  document.getElementById('enroll-course-id'),
    enrollResult:    document.getElementById('enroll-result'),
    enrollBtn:       document.getElementById('enrollBtn'),

    // Transfer
    transferStudentId: document.getElementById('transfer-student-id'),
    oldCourseId:       document.getElementById('old-course-id'),
    newCourseId:       document.getElementById('new-course-id'),
    transferResult:    document.getElementById('transfer-result'),
    transferBtn:       document.getElementById('transferBtn'),

    // Course stats
    statsCourseId:  document.getElementById('stats-course-id'),
    statsResult:    document.getElementById('stats-result'),
    statsBtn:       document.getElementById('statsBtn'),
};

// ── Utility helpers ────────────────────────────────────────────────────────
const showResult = (container, html) => {
    if (container) container.innerHTML = html;
};

const showAlert = (container, message, type = 'info') => {
    if (!container) return;
    container.className = `alert alert-${type} mt-3`;
    container.style.display = 'block';
    container.innerHTML = message;
};

const hideAlert = (container) => {
    if (container) container.style.display = 'none';
};

const emptyTable = (msg) =>
    `<div class="alert alert-secondary mt-2"><i class="fas fa-info-circle me-2"></i>${msg}</div>`;

// ── Transcript ─────────────────────────────────────────────────────────────
const loadTranscript = async () => {
    const studentId = dom.transcriptStudentId?.value?.trim();
    if (!studentId) { notify.warning('Please enter a Student ID.'); return; }

    formUi.setSubmitting(dom.transcriptBtn, true, 'Loading...');
    showResult(dom.transcriptResult, `<div class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Fetching transcript...</div>`);

    try {
        const { transcript } = await advancedService.getTranscript(studentId);
        if (!transcript || transcript.length === 0) {
            showResult(dom.transcriptResult, emptyTable('No transcript data found for this student.'));
            return;
        }

        const { first_name, last_name, email } = transcript[0];
        const rows = transcript.map(r => `
            <tr>
                <td><span class="badge bg-primary">${r.course_code}</span></td>
                <td>${r.course_name}</td>
                <td class="text-center">${r.credits}</td>
                <td class="text-center"><span class="badge bg-${r.status === 'active' ? 'success' : r.status === 'completed' ? 'info' : 'secondary'}">${r.status}</span></td>
                <td class="text-center"><strong>${r.grade || '—'}</strong></td>
                <td class="text-center">${r.classes_attended ?? 0} / ${r.total_classes ?? 0}</td>
                <td class="text-center">
                    ${r.total_classes > 0
                        ? `<span class="badge bg-${Math.round((r.classes_attended / r.total_classes) * 100) >= 75 ? 'success' : 'danger'}">${Math.round((r.classes_attended / r.total_classes) * 100)}%</span>`
                        : '<span class="text-muted">—</span>'}
                </td>
            </tr>`).join('');

        showResult(dom.transcriptResult, `
            <div class="alert alert-primary mb-3">
                <i class="fas fa-user-graduate me-2"></i>
                <strong>${first_name} ${last_name}</strong> &nbsp;|&nbsp; ${email}
            </div>
            <table class="table table-bordered table-hover table-sm align-middle">
                <thead class="table-dark">
                    <tr>
                        <th>Course Code</th><th>Course Name</th><th class="text-center">Credits</th>
                        <th class="text-center">Status</th><th class="text-center">Grade</th>
                        <th class="text-center">Attended / Total</th><th class="text-center">Attendance %</th>
                    </tr>
                </thead>
                <tbody>${rows}</tbody>
            </table>`);
    } catch (err) {
        showResult(dom.transcriptResult, `<div class="alert alert-danger"><i class="fas fa-exclamation-circle me-2"></i>${err.message}</div>`);
    } finally {
        formUi.setSubmitting(dom.transcriptBtn, false);
    }
};

// ── GPA Calculator ─────────────────────────────────────────────────────────
const calculateGPA = async () => {
    const studentId = dom.gpaStudentId?.value?.trim();
    if (!studentId) { notify.warning('Please enter a Student ID.'); return; }

    formUi.setSubmitting(dom.gpaBtn, true, 'Calculating...');
    hideAlert(dom.gpaResult);

    try {
        const { gpa } = await advancedService.getGPA(studentId);
        const gpaNum  = parseFloat(gpa) || 0;
        const color   = gpaNum >= 3.5 ? 'success' : gpaNum >= 2.5 ? 'primary' : gpaNum >= 1.5 ? 'warning' : 'danger';
        const label   = gpaNum >= 3.5 ? 'Distinction' : gpaNum >= 2.5 ? 'Good Standing' : gpaNum >= 1.5 ? 'Satisfactory' : 'At Risk';

        showAlert(dom.gpaResult, `
            <div class="d-flex align-items-center gap-4">
                <div class="text-center">
                    <div class="display-4 fw-bold text-${color}">${gpaNum.toFixed(2)}</div>
                    <div class="text-muted small">out of 4.00</div>
                </div>
                <div>
                    <div class="fw-semibold fs-5">GPA Result</div>
                    <span class="badge bg-${color} fs-6">${label}</span>
                    <div class="text-muted small mt-1">Student ID: ${studentId}</div>
                </div>
            </div>`, color === 'warning' ? 'warning' : color === 'danger' ? 'danger' : 'success');
    } catch (err) {
        showAlert(dom.gpaResult, `<i class="fas fa-exclamation-circle me-2"></i>${err.message}`, 'danger');
    } finally {
        formUi.setSubmitting(dom.gpaBtn, false);
    }
};

// ── Reports (Views) ────────────────────────────────────────────────────────
const reportConfigs = {
    'low-attendance': {
        title:   'Students with Attendance Below 75%',
        icon:    'fas fa-user-slash',
        columns: ['Student Name', 'Course Code', 'Course', 'Present', 'Total', 'Attendance %'],
        row:     r => `<td>${r.student_name}</td><td><span class="badge bg-secondary">${r.course_code}</span></td>
                       <td>${r.course_name}</td><td>${r.present_count}</td><td>${r.total_classes}</td>
                       <td><span class="badge bg-danger">${r.attendance_percentage}%</span></td>`
    },
    'top-performers': {
        title:   'Top Performers (Score > 80%)',
        icon:    'fas fa-trophy',
        columns: ['Student Name', 'Course Code', 'Course', 'Obtained', 'Max', 'Percentage'],
        row:     r => `<td>${r.student_name}</td><td><span class="badge bg-secondary">${r.course_code}</span></td>
                       <td>${r.course_name}</td><td>${r.total_obtained}</td><td>${r.total_max}</td>
                       <td><span class="badge bg-success">${r.percentage}%</span></td>`
    },
    'faculty-workload': {
        title:   'Faculty Workload Report',
        icon:    'fas fa-briefcase',
        columns: ['Faculty Name', 'Department', 'Courses Assigned', 'Active Students'],
        row:     r => `<td>${r.faculty_name}</td><td>${r.department || '—'}</td>
                       <td class="text-center"><span class="badge bg-primary">${r.courses_assigned}</span></td>
                       <td class="text-center"><span class="badge bg-info">${r.total_active_students}</span></td>`
    },
    'unenrolled': {
        title:   'Students Not Enrolled in Any Active Course',
        icon:    'fas fa-user-times',
        columns: ['Student Name', 'Email', 'Major', 'Year'],
        row:     r => `<td>${r.student_name}</td><td>${r.email || '—'}</td>
                       <td>${r.major || '—'}</td><td>${r.enrollment_year || '—'}</td>`
    },
    'popularity': {
        title:   'Course Popularity Ranking',
        icon:    'fas fa-star',
        columns: ['Course Code', 'Course Name', 'Faculty', 'Enrolled', 'Avg Attendance', 'Avg Score'],
        row:     r => `<td><span class="badge bg-secondary">${r.course_code}</span></td>
                       <td>${r.course_name}</td><td>${r.faculty_name || '—'}</td>
                       <td class="text-center"><span class="badge bg-primary">${r.enrolled_count}</span></td>
                       <td class="text-center">${r.avg_attendance_pct != null ? `<span class="badge bg-${r.avg_attendance_pct >= 75 ? 'success' : 'warning'}">${r.avg_attendance_pct}%</span>` : '—'}</td>
                       <td class="text-center">${r.avg_score_pct != null ? `<span class="badge bg-${r.avg_score_pct >= 75 ? 'success' : 'warning'}">${r.avg_score_pct}%</span>` : '—'}</td>`
    }
};

const loadReport = async (type, btn) => {
    const cfg = reportConfigs[type];
    if (!cfg) return;

    formUi.setSubmitting(btn, true, 'Loading...');
    showResult(dom.reportResult, `<div class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Fetching ${cfg.title}...</div>`);

    try {
        const { data, count } = await advancedService.getReport(type);
        if (!data || data.length === 0) {
            showResult(dom.reportResult, emptyTable(`No records found for: ${cfg.title}`));
            return;
        }

        const cols = cfg.columns.map(c => `<th>${c}</th>`).join('');
        const rows = data.map(r => `<tr>${cfg.row(r)}</tr>`).join('');
        showResult(dom.reportResult, `
            <div class="d-flex align-items-center mb-2 gap-2">
                <i class="${cfg.icon} text-muted"></i>
                <strong>${cfg.title}</strong>
                <span class="badge bg-secondary ms-auto">${count} records</span>
            </div>
            <table class="table table-bordered table-hover table-sm align-middle">
                <thead class="table-dark"><tr>${cols}</tr></thead>
                <tbody>${rows}</tbody>
            </table>`);
    } catch (err) {
        showResult(dom.reportResult, `<div class="alert alert-danger"><i class="fas fa-exclamation-circle me-2"></i>${err.message}</div>`);
    } finally {
        formUi.setSubmitting(btn, false);
    }
};

// ── Enroll Student (Transaction) ───────────────────────────────────────────
const enrollStudent = async () => {
    const studentId = dom.enrollStudentId?.value?.trim();
    const courseId  = dom.enrollCourseId?.value?.trim();

    if (!studentId || !courseId) {
        notify.warning('Please enter both Student ID and Course ID.');
        return;
    }

    formUi.setSubmitting(dom.enrollBtn, true, 'Enrolling...');
    hideAlert(dom.enrollResult);

    try {
        const { status } = await advancedService.enrollStudent(studentId, courseId);
        const isSuccess = status?.toLowerCase().includes('successful');
        showAlert(dom.enrollResult,
            `<i class="fas fa-${isSuccess ? 'check-circle' : 'exclamation-circle'} me-2"></i>${status}`,
            isSuccess ? 'success' : 'warning');
        if (isSuccess) notify.success(status);
        else notify.warning(status);
    } catch (err) {
        showAlert(dom.enrollResult, `<i class="fas fa-times-circle me-2"></i>${err.message}`, 'danger');
        notify.error(err.message);
    } finally {
        formUi.setSubmitting(dom.enrollBtn, false);
    }
};

// ── Transfer Student (Transaction) ────────────────────────────────────────
const transferStudent = async () => {
    const studentId    = dom.transferStudentId?.value?.trim();
    const oldCourseId  = dom.oldCourseId?.value?.trim();
    const newCourseId  = dom.newCourseId?.value?.trim();

    if (!studentId || !oldCourseId || !newCourseId) {
        notify.warning('Please fill all three transfer fields.');
        return;
    }
    if (oldCourseId === newCourseId) {
        notify.warning('Source and destination courses cannot be the same.');
        return;
    }

    formUi.setSubmitting(dom.transferBtn, true, 'Transferring...');
    hideAlert(dom.transferResult);

    try {
        const { message } = await advancedService.transferStudent(studentId, oldCourseId, newCourseId);
        showAlert(dom.transferResult, `<i class="fas fa-check-circle me-2"></i>${message}`, 'success');
        notify.success(message);
    } catch (err) {
        showAlert(dom.transferResult, `<i class="fas fa-times-circle me-2"></i>${err.message}`, 'danger');
        notify.error(err.message);
    } finally {
        formUi.setSubmitting(dom.transferBtn, false);
    }
};

// ── Course Statistics ─────────────────────────────────────────────────────
const loadCourseStatistics = async () => {
    const courseId = dom.statsCourseId?.value?.trim();
    if (!courseId) { notify.warning('Please enter a Course ID.'); return; }

    formUi.setSubmitting(dom.statsBtn, true, 'Loading...');
    showResult(dom.statsResult, `<div class="text-center py-3"><span class="spinner-border spinner-border-sm me-2"></span>Loading statistics...</div>`);

    try {
        const { stats } = await advancedService.getCourseStats(courseId);
        if (!stats) { showResult(dom.statsResult, emptyTable('Course not found.')); return; }

        const pct = (val) => val != null ? `${val}%` : '—';
        showResult(dom.statsResult, `
            <div class="row g-3">
                <div class="col-sm-6">
                    <div class="p-3 bg-light rounded border">
                        <div class="text-muted small">Course</div>
                        <div class="fw-bold">${stats.course_code} — ${stats.course_name}</div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-2">
                    <div class="p-3 bg-primary bg-opacity-10 rounded border text-center">
                        <div class="text-muted small">Enrolled</div>
                        <div class="fw-bold fs-4">${stats.total_enrolled ?? 0}</div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-2">
                    <div class="p-3 bg-success bg-opacity-10 rounded border text-center">
                        <div class="text-muted small">Avg Midterm</div>
                        <div class="fw-bold fs-4">${pct(stats.avg_midterm)}</div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-2">
                    <div class="p-3 bg-info bg-opacity-10 rounded border text-center">
                        <div class="text-muted small">Avg Final</div>
                        <div class="fw-bold fs-4">${pct(stats.avg_final)}</div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-2">
                    <div class="p-3 bg-warning bg-opacity-10 rounded border text-center">
                        <div class="text-muted small">Avg Quiz</div>
                        <div class="fw-bold fs-4">${pct(stats.avg_quiz)}</div>
                    </div>
                </div>
                <div class="col-sm-6 col-md-2">
                    <div class="p-3 bg-secondary bg-opacity-10 rounded border text-center">
                        <div class="text-muted small">Avg Attendance</div>
                        <div class="fw-bold fs-4">${pct(stats.avg_attendance_pct)}</div>
                    </div>
                </div>
            </div>`);
    } catch (err) {
        showResult(dom.statsResult, `<div class="alert alert-danger"><i class="fas fa-exclamation-circle me-2"></i>${err.message}</div>`);
    } finally {
        formUi.setSubmitting(dom.statsBtn, false);
    }
};

// ── Render: populate user info from store ──────────────────────────────────
const render = (state) => {
    const { auth } = state;
    if (dom.userName   && auth.user) dom.userName.textContent = auth.user.name;
    if (dom.userAvatar && auth.user?.name) {
        dom.userAvatar.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=6610f2&color=fff`;
    }
};

// ── Attach all event listeners ─────────────────────────────────────────────
const attachEventListeners = () => {
    // Logout
    dom.logoutLink?.addEventListener('click', (e) => { e.preventDefault(); authState.logout(); });

    // Transcript
    dom.transcriptBtn?.addEventListener('click', loadTranscript);
    dom.transcriptStudentId?.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadTranscript(); });

    // GPA
    dom.gpaBtn?.addEventListener('click', calculateGPA);
    dom.gpaStudentId?.addEventListener('keydown', (e) => { if (e.key === 'Enter') calculateGPA(); });

    // Reports
    dom.reportBtnLowAtt    ?.addEventListener('click', () => loadReport('low-attendance',  dom.reportBtnLowAtt));
    dom.reportBtnTopPerf   ?.addEventListener('click', () => loadReport('top-performers',  dom.reportBtnTopPerf));
    dom.reportBtnFacWork   ?.addEventListener('click', () => loadReport('faculty-workload', dom.reportBtnFacWork));
    dom.reportBtnUnenrolled?.addEventListener('click', () => loadReport('unenrolled',       dom.reportBtnUnenrolled));
    dom.reportBtnPopularity?.addEventListener('click', () => loadReport('popularity',       dom.reportBtnPopularity));

    // Enroll
    dom.enrollBtn?.addEventListener('click', enrollStudent);

    // Transfer
    dom.transferBtn?.addEventListener('click', transferStudent);

    // Course stats
    dom.statsBtn?.addEventListener('click', loadCourseStatistics);
    dom.statsCourseId?.addEventListener('keydown', (e) => { if (e.key === 'Enter') loadCourseStatistics(); });
};

// ── Page init ──────────────────────────────────────────────────────────────
export const initAdvancedPage = () => {
    authState.hydrate();
    // Advanced reports are accessible by admin and faculty only
    if (!authState.requireAuth(['admin', 'faculty'])) return;

    store.subscribe(render);
    render(store.getState());

    attachEventListeners();
};
