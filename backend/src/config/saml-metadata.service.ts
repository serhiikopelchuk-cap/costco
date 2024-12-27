import { readFileSync } from 'fs';
import { DOMParser } from '@xmldom/xmldom';

export interface SamlMetadataConfig {
  entryPoint?: string;
  cert?: string;
  issuer?: string;
}

export class SamlMetadataService {
  private formatCertificate(rawCert: string): string {
    try {
      console.log('[DEBUG] Starting certificate formatting');
      console.log('[DEBUG] Raw certificate length:', rawCert.length);

      // Remove all whitespace and line breaks
      const cleanCert = rawCert.replace(/[\r\n\s]/g, '');
      console.log('[DEBUG] Cleaned certificate length:', cleanCert.length);
      
      // Return the raw certificate if it's already in PEM format
      if (cleanCert.includes('-----BEGIN CERTIFICATE-----')) {
        return cleanCert;
      }
      
      // Split into lines of exactly 64 characters
      const lines: string[] = [];
      for (let i = 0; i < cleanCert.length; i += 64) {
        lines.push(cleanCert.slice(i, i + 64));
      }
      
      console.log('[DEBUG] Certificate lines:', {
        totalLines: lines.length,
        firstLineLength: lines[0]?.length,
        lastLineLength: lines[lines.length - 1]?.length
      });
      
      // Format as PEM certificate
      const formattedCert = [
        '-----BEGIN CERTIFICATE-----',
        ...lines,
        '-----END CERTIFICATE-----'
      ].join('\n');
      
      console.log('[DEBUG] Final formatted certificate:', {
        totalLength: formattedCert.length,
        lineCount: lines.length + 2,
        containsHeader: formattedCert.includes('-----BEGIN CERTIFICATE-----'),
        containsFooter: formattedCert.includes('-----END CERTIFICATE-----')
      });
      
      return formattedCert;
    } catch (error) {
      console.error('[ERROR] Certificate formatting failed:', error);
      throw error;
    }
  }

  loadMetadataFromFile(filePath: string): SamlMetadataConfig {
    try {
      console.log('[DEBUG] Reading metadata file from:', filePath);
      const xmlContent = readFileSync(filePath, 'utf-8');
      console.log('[DEBUG] Metadata file length:', xmlContent.length);
      
      const doc = new DOMParser().parseFromString(xmlContent);
      console.log('[DEBUG] XML document parsed successfully');

      // Extract SSO URL (entryPoint)
      const ssoNodes = doc.getElementsByTagNameNS('urn:oasis:names:tc:SAML:2.0:metadata', 'SingleSignOnService') ||
                      doc.getElementsByTagName('md:SingleSignOnService');
      console.log('[DEBUG] Found SingleSignOnService nodes:', ssoNodes.length);
      
      let entryPoint: string | undefined;
      for (let i = 0; i < ssoNodes.length; i++) {
        const node = ssoNodes[i];
        const binding = node.getAttribute('Binding');
        console.log('[DEBUG] SSO node binding:', binding);
        
        if (binding === 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST') {
          entryPoint = node.getAttribute('Location') || undefined;
          console.log('[DEBUG] Found POST binding entryPoint:', entryPoint);
          break;
        }
      }

      // Extract certificate
      const certNodes = doc.getElementsByTagNameNS('http://www.w3.org/2000/09/xmldsig#', 'X509Certificate') ||
                       doc.getElementsByTagName('ds:X509Certificate');
      console.log('[DEBUG] Found X509Certificate nodes:', certNodes.length);
      
      let cert: string | undefined;
      if (certNodes.length > 0 && certNodes[0].textContent) {
        console.log('[DEBUG] Found certificate in first X509Certificate node');
        const rawCert = certNodes[0].textContent.trim();
        console.log('[DEBUG] Raw certificate extracted, length:', rawCert.length);
        
        cert = this.formatCertificate(rawCert);
        console.log('[DEBUG] Certificate formatted successfully');
      } else {
        console.warn('[WARN] No X509Certificate found in metadata or certificate is empty');
      }

      // Extract issuer
      const entityNodes = doc.getElementsByTagNameNS('urn:oasis:names:tc:SAML:2.0:metadata', 'EntityDescriptor') ||
                         doc.getElementsByTagName('md:EntityDescriptor');
      console.log('[DEBUG] Found EntityDescriptor nodes:', entityNodes.length);
      
      const issuer = entityNodes.length > 0 ? entityNodes[0].getAttribute('entityID') : undefined;
      console.log('[DEBUG] Extracted issuer:', issuer);

      const result = {
        entryPoint,
        cert,
        issuer
      };

      console.log('[DEBUG] Final metadata configuration:', {
        entryPoint: result.entryPoint || 'NOT_FOUND',
        certFound: !!result.cert,
        certLength: result.cert?.length,
        issuer: result.issuer || 'NOT_FOUND'
      });

      return result;
    } catch (error) {
      console.error('[ERROR] Failed to load SAML metadata:', error);
      throw error;
    }
  }
} 