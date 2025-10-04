import { API_CONFIG } from '../constants/config';
import type { Certificate, CertificatesResponse } from '../types/certificate';

/**
 * Get all certificates for the authenticated provider
 * @param token - JWT authentication token
 */
export const getCertificates = async (token: string): Promise<Certificate[]> => {
  try {
    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/certificates`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data: CertificatesResponse = await response.json();

    if (!response.ok || !data.success) {
      throw new Error('Failed to fetch certificates');
    }

    return data.data || [];
  } catch (error: any) {
    console.error('Get Certificates Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};

/**
 * Upload a new certificate
 * @param certificateData - Certificate form data
 * @param token - JWT authentication token
 */
export const uploadCertificate = async (
  certificateData: {
    certificate_name: string;
    certificate_number: string;
    expiry_date?: string;
    certificateFile: {
      uri: string;
      name: string;
      type: string;
    };
  },
  token: string
): Promise<any> => {
  try {
    const formData = new FormData();
    formData.append('certificate_name', certificateData.certificate_name);
    formData.append('certificate_number', certificateData.certificate_number);
    
    if (certificateData.expiry_date) {
      formData.append('expiry_date', certificateData.expiry_date);
    }

    // Append file
    formData.append('certificateFile', {
      uri: certificateData.certificateFile.uri,
      name: certificateData.certificateFile.name,
      type: certificateData.certificateFile.type,
    } as any);

    console.log('Uploading certificate:', certificateData.certificate_name);

    const response = await fetch(
      `${API_CONFIG.BASE_URL}/api/certificates/upload`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      }
    );

    const data = await response.json();
    console.log('Upload certificate response:', JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.message || 'Failed to upload certificate');
    }

    return data;
  } catch (error: any) {
    console.error('Upload Certificate Error:', error);
    throw new Error(error.message || 'Network error. Please try again.');
  }
};
