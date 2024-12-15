import { readFileSync } from 'fs';
import { join } from 'path';
import { FRONTEND_URL, BACKEND_URL } from './constants';

const certsPath = join(process.cwd(), 'src/certs');

const getCertificates = () => {
  if (process.env.NODE_ENV === 'development') {
    return {
      cert: readFileSync(join(certsPath, 'idp-certificate.crt'), 'utf-8'),
      privateKey: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
      decryptionPvk: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
    };
  }
  
  return {
    cert: process.env.SAML_CERTIFICATE,
    privateKey: process.env.SAML_PRIVATE_KEY,
    decryptionPvk: process.env.SAML_PRIVATE_KEY,
  };
};

const getEnvironmentConfig = () => {
  const baseConfig = {
    issuer: process.env.SAML_ISSUER || 'costco-crm-app',
    callbackUrl: `${BACKEND_URL}/auth/callback`,
    acceptedClockSkewMs: -1,
    identifierFormat: process.env.SAML_IDENTIFIER_FORMAT || 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    validateInResponseTo: true,
    disableRequestedAuthnContext: true,
    wantAuthnRequestsSigned: false,
    forceAuthn: false,
    passive: false,
    signatureAlgorithm: 'sha256',
    additionalParams: {
      RelayState: FRONTEND_URL
    }
  };

  if (process.env.NODE_ENV === 'development') {
    return {
      ...baseConfig,
      entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
    };
  }

  return {
    ...baseConfig,
    entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
  };
};

export const samlConfig = {
  ...getCertificates(),
  ...getEnvironmentConfig(),
};

console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SAML Config (without sensitive data):", {
  ...samlConfig,
  cert: '***',
  privateKey: '***',
  decryptionPvk: '***'
}); 