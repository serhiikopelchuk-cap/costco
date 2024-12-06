// Environment-specific configuration
const configs = {
  development: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  },
  production: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  },
  test: {
    API_BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3000',
  },
};
console.log(configs, process.env.REACT_APP_API_URL);
// Determine current environment
const environment = process.env.NODE_ENV || 'development';

// Export the configuration for the current environment
export const { API_BASE_URL } = configs[environment as keyof typeof configs]; 