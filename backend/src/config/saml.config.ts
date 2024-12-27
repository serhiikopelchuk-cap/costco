import { readFileSync, existsSync, writeFileSync, mkdirSync, unlinkSync } from 'fs';
import { join } from 'path';
import { FRONTEND_URL, BACKEND_URL } from './constants';
import { devSamlConfig, prodSamlConfig } from './saml.dev.config';
import { SamlMetadataService, SamlMetadataConfig } from './saml-metadata.service';
import { generateKeyPairSync } from 'crypto';

const metadataService = new SamlMetadataService();

// Function to generate self-signed certificates
const generateCertificates = () => {
  console.log('Generating self-signed certificates...');
  
  try {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    // Try different paths for Docker and local development
    const possibleCertDirs = [
      join(process.cwd(), 'src', 'certs'),  // Local development
      join('/', 'app', 'src', 'certs'),     // Docker container
      join(process.cwd(), 'dist', 'src', 'certs') // Built app
    ];

    let certsDir = null;
    for (const dir of possibleCertDirs) {
      try {
        if (!existsSync(dir)) {
          mkdirSync(dir, { recursive: true });
        }
        // Test if we can write to the directory
        const testFile = join(dir, '.test');
        writeFileSync(testFile, 'test');
        // If we can write, this is our directory
        certsDir = dir;
        // Clean up test file
        try { 
          readFileSync(testFile);
          // Only delete if read was successful
          try { 
            unlinkSync(testFile);
          } catch (e) {
            console.warn(`Could not delete test file ${testFile}:`, e);
          }
        } catch (e) {
          console.warn(`Could not read test file ${testFile}:`, e);
        }
        break;
      } catch (e) {
        console.log(`Directory ${dir} is not writable:`, e.message);
        continue;
      }
    }

    if (!certsDir) {
      throw new Error('No writable certificate directory found');
    }

    console.log('Using certificates directory:', certsDir);

    // Save the keys
    const privateKeyPath = join(certsDir, 'private.key');
    const publicKeyPath = join(certsDir, 'public.crt');

    writeFileSync(privateKeyPath, privateKey);
    writeFileSync(publicKeyPath, publicKey);

    console.log('Self-signed certificates generated successfully');
    return { cert: publicKey, privateKey };
  } catch (error) {
    console.error('Failed to generate certificates:', error);
    // Return empty strings instead of null to prevent further errors
    return { cert: '', privateKey: '' };
  }
};

interface SamlConfigOptions {
  metadataFile?: string;
  entryPoint?: string;
  issuer?: string;
  cert?: string;
  privateKey?: string;
  decryptionPvk?: string;
  identifierFormat?: string;
  wantAuthnRequestsSigned?: boolean;
  acceptedClockSkewMs?: number;
  validateInResponseTo?: boolean;
  disableRequestedAuthnContext?: boolean;
  forceAuthn?: boolean;
  passive?: boolean;
  signatureAlgorithm?: string;
  callbackUrl?: string;
  additionalParams?: {
    RelayState: string;
  };
  audience?: string;
  wantAssertionsSigned?: boolean;
  digestAlgorithm?: string;
}

// Cache for loaded configuration
let cachedConfig: SamlConfigOptions | null = null;

const loadSamlConfig = (): SamlConfigOptions => {
  console.log('[DEBUG] Starting loadSamlConfig...');
  
  // Return cached config if available
  if (cachedConfig) {
    console.log('[DEBUG] Returning cached config');
    return cachedConfig;
  }

  const config: SamlConfigOptions = {};

  // Try to load from metadata file if specified
  const metadataPath = process.env.SAML_METADATA_FILE;
  console.log('[DEBUG] Metadata path:', metadataPath);
  
  if (metadataPath) {
    try {
      const metadata = metadataService.loadMetadataFromFile(metadataPath);
      console.log('[DEBUG] Raw metadata loaded:', {
        ...metadata,
        cert: metadata.cert ? 'CERT_EXISTS' : 'NO_CERT'
      });
      
      Object.assign(config, metadata);
      console.log('[DEBUG] Config after metadata merge:', {
        ...config,
        cert: config.cert ? 'CERT_EXISTS' : 'NO_CERT'
      });
    } catch (error) {
      console.warn('[DEBUG] Failed to load SAML metadata file:', error);
    }
  }

  // Override with environment variables if provided
  console.log('[DEBUG] Environment variables:',
    {
      SAML_ENTRY_POINT: process.env.SAML_ENTRY_POINT ? 'EXISTS' : 'NOT_SET',
      SAML_ISSUER: process.env.SAML_ISSUER ? 'EXISTS' : 'NOT_SET',
      SAML_CERTIFICATE: process.env.SAML_CERTIFICATE ? 'EXISTS' : 'NOT_SET',
      SAML_PRIVATE_KEY: process.env.SAML_PRIVATE_KEY ? 'EXISTS' : 'NOT_SET',
    }
  );

  if (process.env.SAML_ENTRY_POINT) {
    config.entryPoint = process.env.SAML_ENTRY_POINT;
  }
  if (process.env.SAML_ISSUER) {
    config.issuer = process.env.SAML_ISSUER;
  }
  if (process.env.SAML_CERTIFICATE) {
    config.cert = process.env.SAML_CERTIFICATE;
  }
  if (process.env.SAML_PRIVATE_KEY) {
    config.privateKey = process.env.SAML_PRIVATE_KEY;
  }
  if (process.env.SAML_IDENTIFIER_FORMAT) {
    config.identifierFormat = process.env.SAML_IDENTIFIER_FORMAT;
  }

  console.log('[DEBUG] Final config in loadSamlConfig:', {
    ...config,
    cert: config.cert ? 'CERT_EXISTS' : 'NO_CERT',
    privateKey: config.privateKey ? 'KEY_EXISTS' : 'NO_KEY'
  });

  // Cache the loaded config
  cachedConfig = config;
  return config;
};

const createSamlConfig = () => {
  console.log('[DEBUG] Starting createSamlConfig...');
  const config = loadSamlConfig();
  const baseConfig = process.env.NODE_ENV === 'production' ? prodSamlConfig : devSamlConfig;

  console.log('[DEBUG] Base config type:', process.env.NODE_ENV);
  console.log('[DEBUG] Loaded config:', {
    ...config,
    cert: config.cert ? 'CERT_EXISTS' : 'NO_CERT',
    privateKey: config.privateKey ? 'KEY_EXISTS' : 'NO_KEY'
  });

  // Create final config starting with metadata/env configuration
  const finalConfig: SamlConfigOptions = {
    entryPoint: config.entryPoint || 'https://loginnp.costco.com/idp/SSO.saml2',
    cert: config.cert,
    identifierFormat: 'urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified',
    wantAuthnRequestsSigned: false,
    issuer: FRONTEND_URL,
    acceptedClockSkewMs: -1,
    validateInResponseTo: false,
    disableRequestedAuthnContext: true,
    forceAuthn: false,
    passive: false,
    signatureAlgorithm: 'sha256',
    digestAlgorithm: 'sha256',
    wantAssertionsSigned: false,
    callbackUrl: `${BACKEND_URL}/auth/callback`,
    additionalParams: {
      RelayState: FRONTEND_URL
    }
  };

  // Use certificate from metadata if available
  if (config.cert) {
    console.log('[INFO] Using certificate from metadata');
    finalConfig.cert = config.cert;
  } else {
    console.warn('[WARN] No certificate found in metadata');
  }

  console.log('[DEBUG] Final certificates:', {
    cert: finalConfig.cert ? 'CERT_EXISTS' : 'NO_CERT',
    certFormat: finalConfig.cert?.includes('-----BEGIN CERTIFICATE-----') ? 'PEM' : 'RAW',
    certLength: finalConfig.cert?.length
  });

  return finalConfig;
};

// Create the final configuration once
export const samlConfig = createSamlConfig();

// Add a helper to check if SAML is configured
export const isSamlConfigured = () => {
  const isConfigured = Boolean(samlConfig.cert && samlConfig.privateKey);
  console.log('[DEBUG] SAML configuration check:', {
    hasCert: Boolean(samlConfig.cert),
    hasPrivateKey: Boolean(samlConfig.privateKey),
    isConfigured
  });
  return isConfigured;
};

// Log the configuration
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("SAML Config (without sensitive data):", {
  ...samlConfig,
  cert: samlConfig.cert ? '***' : 'NOT_PROVIDED',
  privateKey: samlConfig.privateKey ? '***' : 'NOT_PROVIDED',
  decryptionPvk: samlConfig.decryptionPvk ? '***' : 'NOT_PROVIDED'
}); 