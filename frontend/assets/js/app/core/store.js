const deepClone = (value) => {
    if (typeof structuredClone === 'function') {
        return structuredClone(value);
    }
    return JSON.parse(JSON.stringify(value));
};

const initialState = {
    auth: {
        token: null,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
    },
    admin: {
        loading: false,
        error: null,
        students: [],
        faculty: [],
        courses: [],
        enrollments: []
    },
    faculty: {
        loading: false,
        error: null,
        selectedCourseId: null,
        courses: [],
        students: [],
        attendance: [],
        marks: []
    },
    student: {
        loading: false,
        error: null,
        profile: null,
        attendance: [],
        marks: []
    },
    ui: {
        busy: false,
        pageError: null
    }
};

let state = deepClone(initialState);
const listeners = new Set();

const notify = () => {
    listeners.forEach((listener) => listener(state));
};

export const store = {
    getState() {
        return state;
    },

    setState(updater) {
        const nextState = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
        state = nextState;
        notify();
    },

    setSlice(sliceName, updater) {
        this.setState((prev) => {
            const currentSlice = prev[sliceName];
            const nextSlice = typeof updater === 'function' ? updater(currentSlice) : { ...currentSlice, ...updater };
            return {
                ...prev,
                [sliceName]: nextSlice
            };
        });
    },

    reset() {
        state = deepClone(initialState);
        notify();
    },

    subscribe(listener) {
        listeners.add(listener);
        return () => listeners.delete(listener);
    }
};

export const getInitialState = () => deepClone(initialState);
