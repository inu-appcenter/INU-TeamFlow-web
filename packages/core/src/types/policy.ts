// packages/core/types/policy.ts

export type PolicyType = "terms" | "privacy" | "community" | "youth";

export interface PolicyListItem {
  title?: string;
  text: string;
  children?: PolicyListItem[];
}

export interface PolicyKeyValueItem {
  label: string;
  value: string;
  href?: string;
}

export type PolicyBlock =
  | {
      type: "paragraph";
      text: string;
      emphasis?: boolean;
    }
  | {
      type: "subheading";
      text: string;
    }
  | {
      type: "unordered-list";
      items: string[];
    }
  | {
      type: "ordered-list";
      items: PolicyListItem[];
      start?: number;
      variant?: "default" | "cards";
    }
  | {
      type: "card";
      title?: string;
      blocks: PolicyBlock[];
    }
  | {
      type: "note";
      text: string;
    }
  | {
      type: "key-value";
      items: PolicyKeyValueItem[];
    };

export interface PolicySection {
  id: string;
  title: string;
  blocks: PolicyBlock[];
}

export interface PolicyDocument {
  type: PolicyType;

  pageName: string;
  title: string;

  effectiveDate?: string;
  version?: string;

  intro?: string[];

  sections: PolicySection[];
}
