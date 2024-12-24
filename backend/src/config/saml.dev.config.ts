import { FRONTEND_URL, BACKEND_URL } from './constants';

// Try to import development certificates, but don't fail if they don't exist
let DEV_CERTIFICATES = { cert: '', privateKey: '' };
try {
  DEV_CERTIFICATES = require('../certs/dev.certificates').DEV_CERTIFICATES;
} catch (error) {
  console.log('Development certificates not found. SAML authentication will be disabled in development mode.');
}

// Use localhost for development, production URL for production
const FRONTEND_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://frontend.totalcost.ecp-aks.adt-gen.c2.westus2.np.ct-costco.internal'
  : process.env.FRONTEND_URL || 'http://localhost:3000';

const samlBaseConfig = {
  acceptedClockSkewMs: -1,
  identifierFormat: process.env.SAML_IDENTIFIER_FORMAT || 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
  validateInResponseTo: false, // Disable for now to fix validation issues
  disableRequestedAuthnContext: true,
  wantAuthnRequestsSigned: false,
  forceAuthn: false,
  passive: false,
  signatureAlgorithm: 'sha256' as 'sha256' | 'sha512',
};

export const devSamlConfig = {
  ...samlBaseConfig,
  // Use frontend URL as Service Provider entity ID
  issuer: FRONTEND_BASE_URL,
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
  cert: process.env.DEV_SAML_CERTIFICATE || DEV_CERTIFICATES.cert || '',
  privateKey: process.env.DEV_SAML_PRIVATE_KEY || DEV_CERTIFICATES.privateKey || '',
  // Callback still goes to backend but includes frontend URL in RelayState
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: process.env.DEV_SAML_PRIVATE_KEY || DEV_CERTIFICATES.privateKey || '',
  additionalParams: {
    RelayState: FRONTEND_BASE_URL
  }
};

export const prodSamlConfig = {
  ...samlBaseConfig,
  issuer: FRONTEND_BASE_URL,
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
  cert: process.env.SAML_CERTIFICATE || '',
  privateKey: process.env.SAML_PRIVATE_KEY || '',
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: process.env.SAML_PRIVATE_KEY || '',
  additionalParams: {
    RelayState: FRONTEND_BASE_URL
  }
}; 