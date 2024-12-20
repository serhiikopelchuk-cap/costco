import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { FRONTEND_URL, BACKEND_URL } from './constants';
import { devSamlConfig, prodSamlConfig } from './saml.dev.config';

const getCertificates = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SAML_CERTIFICATE || !process.env.SAML_PRIVATE_KEY) {
      console.warn('SAML certificates not provided in environment variables for production. SAML authentication will be disabled.');
      return {
        cert: '',
        privateKey: '',
        decryptionPvk: '',
      };
    }
    return {
      cert: process.env.SAML_CERTIFICATE,
      privateKey: process.env.SAML_PRIVATE_KEY,
      decryptionPvk: process.env.SAML_PRIVATE_KEY,
    };
  }

  // For development, use the devSamlConfig
  return {
    cert: devSamlConfig.cert || '',
    privateKey: devSamlConfig.privateKey || '',
    decryptionPvk: devSamlConfig.decryptionPvk || '',
  };
};

const getEnvironmentConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return prodSamlConfig;
  }
  return devSamlConfig;
};

export const samlConfig = {
  ...getCertificates(),
  ...getEnvironmentConfig(),
};

// Add a helper to check if SAML is configured
export const isSamlConfigured = () => {
  return Boolean(samlConfig.cert && samlConfig.privateKey);
};

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SAML Config (without sensitive data):", {
  ...samlConfig,
  cert: samlConfig.cert ? '***' : 'NOT_PROVIDED',
  privateKey: samlConfig.privateKey ? '***' : 'NOT_PROVIDED',
  decryptionPvk: samlConfig.decryptionPvk ? '***' : 'NOT_PROVIDED'
});