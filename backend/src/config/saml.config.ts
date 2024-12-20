import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { FRONTEND_URL, BACKEND_URL } from './constants';
import { devSamlConfig, prodSamlConfig } from './saml.dev.config';

// const certsPath = join(process.cwd(), 'src/certs');

const getCertificates = () => {
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.SAML_CERTIFICATE || !process.env.SAML_PRIVATE_KEY) {
      throw new Error('SAML certificates not provided in environment variables for production');
    }
    return {
      cert: process.env.SAML_CERTIFICATE,
      privateKey: process.env.SAML_PRIVATE_KEY,
      decryptionPvk: process.env.SAML_PRIVATE_KEY,
    };
  }

  // For development, use the devSamlConfig
  return {
    cert: devSamlConfig.cert,
    privateKey: devSamlConfig.privateKey,
    decryptionPvk: devSamlConfig.decryptionPvk,
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

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SAML Config (without sensitive data):", {
  ...samlConfig,
  cert: samlConfig.cert ? '***' : 'NOT_PROVIDED',
  privateKey: samlConfig.privateKey ? '***' : 'NOT_PROVIDED',
  decryptionPvk: samlConfig.decryptionPvk ? '***' : 'NOT_PROVIDED'
});