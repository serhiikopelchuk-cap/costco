import { readFileSync } from 'fs';
import { join } from 'path';
import { FRONTEND_URL, BACKEND_URL } from './constants';

const certsPath = join(process.cwd(), 'src/certs');

export const devSamlConfig = {
  entryPoint: 'https://loginnp.costco.com/idp/SSO.saml2',
  issuer: BACKEND_URL,
  cert: readFileSync(join(certsPath, 'idp-certificate.crt'), 'utf-8'),
  privateKey: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
  acceptedClockSkewMs: -1,
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
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
  entryPoint: 'https://loginnp.costco.com/idp/SSO.saml2',
  issuer: BACKEND_URL,
  cert: readFileSync(join(certsPath, 'idp-certificate.crt'), 'utf-8'),
  privateKey: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
  callbackUrl: `${BACKEND_URL}/auth/callback`,
  decryptionPvk: readFileSync(join(certsPath, 'private.key'), 'utf-8'),
  acceptedClockSkewMs: -1,
  identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
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