export interface Certificate {
  certificate_id: number;
  certificate_name: string;
  certificate_number: string;
  certificate_file_path: string;
  certificate_status: 'Approved' | 'Pending' | 'Rejected';
  expiry_date: string | null;
  created_at: string;
}

export interface CertificatesResponse {
  success: boolean;
  data: Certificate[];
  count: number;
}
