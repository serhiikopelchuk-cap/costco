import { FRONTEND_URL, BACKEND_URL } from './constants';
import { DEV_CERTIFICATES } from '../certs/dev.certificates';

export const devSamlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
  issuer: BACKEND_URL,
  cert: DEV_CERTIFICATES.cert,
  privateKey: DEV_CERTIFICATES.privateKey,
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: DEV_CERTIFICATES.privateKey,
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

export const prodSamlConfig = {
  entryPoint: process.env.SAML_ENTRY_POINT || 'https://loginnp.costco.com/idp/SSO.saml2',
  issuer: BACKEND_URL,
  cert: process.env.SAML_CERTIFICATE,
  privateKey: process.env.SAML_PRIVATE_KEY,
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: process.env.SAML_PRIVATE_KEY,
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