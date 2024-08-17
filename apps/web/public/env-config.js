window._env_ = Object.assign(
  {
    SKIP_PREFLIGHT_CHECK: 'true',
    VITE_ENVIRONMENT: 'dev',
    IS_IMPROVED_ONBOARDING_ENABLED: 'false',
    IS_V2_ENABLED: 'true',
    IS_V2_EXPERIENCE_ENABLED: 'true',
  },
  // Allow overrides of the above defaults
  window._env_
);
