// Environment-specific configuration
const configs = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    AUTH_ENABLED: process.env.REACT_APP_AUTH_ENABLED === 'true',
    SSO_LOGIN_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/login`,
    SSO_LOGOUT_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/logout`,
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    AUTH_ENABLED: true,
    SSO_LOGIN_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/login`,
    SSO_LOGOUT_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/logout`,
  },
  test: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
    AUTH_ENABLED: false,
    SSO_LOGIN_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/login`,
    SSO_LOGOUT_URL: `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/auth/logout`,
  },
};
console.log(configs, process.env.REACT_APP_API_URL);
// Determine current environment
const environment = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export const { API_BASE_URL, AUTH_ENABLED, SSO_LOGIN_URL, SSO_LOGOUT_URL } = configs[environment as keyof typeof configs]; 