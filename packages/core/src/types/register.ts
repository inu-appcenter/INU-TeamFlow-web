export type RegisterStep = "terms" | "info";

export type PolicyType = "terms" | "privacy" | "community" | "youth";

export interface PolicySection {
  title: string;
  content: string[];
}

export interface PolicyDocument {
  type: PolicyType;
  title: string;
  effectiveDate: string;
  sections: PolicySection[];
}

export interface RegisterFormValues {
  userName: string;
  password: string;
  checkPassword: string;
  email: string;
  name: string;
  college: string;
  department: string;
}

export interface PolicyAgreement {
  terms: boolean;
  age: boolean;
}
