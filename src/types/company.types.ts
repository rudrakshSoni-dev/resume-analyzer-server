export interface Company {
  name: string;
  linkedinUrl: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
}

export interface Recruiter {
  name: string;
  title?: string;
  linkedinUrl: string;
  company?: string;
}

export interface JobListing {
  title: string;
  company: string;
  location?: string;
  jobUrl: string;
  description?: string;
}

export interface CompanySearchResult {
  name: string;
  linkedinUrl: string;
  industry?: string;
  employeeCount?: number;
  website?: string;
}