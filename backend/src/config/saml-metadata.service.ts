import { Injectable } from '@nestjs/common';
import { readFileSync, existsSync } from 'fs';
import { DOMParser } from '@xmldom/xmldom';
import { join, resolve } from 'path';

export interface SamlMetadataConfig {
  entryPoint?: string;
  cert?: string;
  identifierFormat?: string;
  wantAuthnRequestsSigned?: boolean;
}

@Injectable()
export class SamlMetadataService {
  parseSamlMetadata(xmlContent: string): SamlMetadataConfig {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xmlContent, 'text/xml');

    const config: SamlMetadataConfig = {};

    // Get SSO service endpoints
    const ssoElements = doc.getElementsByTagName('md:SingleSignOnService');
    for (let i = 0; i < ssoElements.length; i++) {
      const element = ssoElements[i];
      const binding = element.getAttribute('Binding');
      if (binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST' || 
          binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-Redirect') {
        config.entryPoint = element.getAttribute('Location') || undefined;
        break;
      }
    }

    // Get certificate
    const certElements = doc.getElementsByTagName('ds:X509Certificate');
    if (certElements.length > 0) {
      const certText = certElements[0].textContent;
      if (certText) {
        config.cert = `-----BEGIN CERTIFICATE-----\n${certText.trim()}\n-----END CERTIFICATE-----`;
      }
    }

    // Get NameID Format
    const nameIdElements = doc.getElementsByTagName('md:NameIDFormat');
    if (nameIdElements.length > 0) {
      config.identifierFormat = nameIdElements[0].textContent || undefined;
    }

    // Get AuthnRequests signing requirement
    const idpDescriptor = doc.getElementsByTagName('md:IDPSSODescriptor')[0];
    if (idpDescriptor) {
      const wantAuthnRequestsSigned = idpDescriptor.getAttribute('WantAuthnRequestsSigned');
      config.wantAuthnRequestsSigned = wantAuthnRequestsSigned === 'true';
    }

    return config;
  }

  loadMetadataFromFile(filePath: string): SamlMetadataConfig {
    try {
      // Try different possible paths
      const possiblePaths = [
        filePath, // Original path
        join(process.cwd(), filePath), // Relative to CWD
        join(process.cwd(), 'src', filePath), // Relative to src
        join(process.cwd(), 'dist', filePath), // Relative to dist
        join(__dirname, filePath), // Relative to current directory
        join(__dirname, '..', filePath), // Up one level
      ];

      let xmlContent: string | null = null;
      let usedPath: string | null = null;

      // Try each path until we find one that exists
      for (const path of possiblePaths) {
        if (existsSync(path)) {
          xmlContent = readFileSync(path, 'utf-8');
          usedPath = path;
          break;
        }
      }

      if (!xmlContent || !usedPath) {
        console.warn('Could not find metadata file in any of these locations:', possiblePaths);
        return {};
      }

      console.log('Successfully loaded SAML metadata from:', usedPath);
      return this.parseSamlMetadata(xmlContent);
    } catch (error) {
      console.warn(`Failed to load SAML metadata from file ${filePath}:`, error);
      return {};
    }
  }
} 