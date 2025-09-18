export const PARAMS = {
  DEFAULT_FONT: 'Roboto',

  SMALL_FONT_SIZE: '13px',
  MEDIUM_FONT_SIZE: '16px',
  HEADING_FONT_SIZE: '18px',
  LARGE_FONT_SIZE: '20px',

  QUERY_STORE_TIME: 3 * 60 * 1000,
  TOAST_SHOW_TIME: 2000,
  API_URL: import.meta.env.VITE_API_URL,
  WS_URL: import.meta.env.VITE_WS_URL,
};

export const QUERY_KEYS = {
  COURSES: 'courses',
  COURSES_ALL: 'courses/all',
  GROUPS: 'groups',
  KEYS: 'keys',
  LABS: 'labs',
  MODELS: 'models',
  REPORTS: 'reports',
  STUDENTS: 'students',
  PROMPTS: 'prompts',
  PROVIDERS: 'providers',
  COURSE_LABS: 'course/labs',
};
