
export enum AssetType {
  TABLE = 'Table',
  VIEW = 'View',
  DASHBOARD = 'Dashboard',
  PIPELINE = 'Pipeline',
  API = 'API Endpoint'
}

export enum CertificationStatus {
  CERTIFIED = 'Certified',
  PENDING = 'Pending Review',
  DEPRECATED = 'Deprecated',
  WARNING = 'Warning'
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  description: string;
  pii: boolean;
  key?: 'PK' | 'FK' | null;
  businessTerm?: string;
}

export interface Policy {
  id: string;
  name: string;
  status: 'Compliant' | 'Violation' | 'Waived' | 'Warning';
  description: string;
}

export interface QualityMetric {
  date: string;
  score: number;
  nullCount: number;
  rowDrift: number;
}

export interface LineageNode {
  id: string;
  name: string;
  type: AssetType;
  status?: CertificationStatus;
}

export interface LineageLink {
  source: string;
  target: string;
}

export interface Asset {
  id: string;
  technicalName: string;
  friendlyName: string;
  domain: string;
  platform: string;
  environment: 'PROD' | 'STAGE' | 'DEV';
  type: AssetType;
  stats: {
    rows: number;
    columns: number;
    size: string;
    queriesLast30d: number;
  };
  timestamps: {
    lastUpdated: string;
    created: string;
  };
  people: {
    owner: string;
    steward: string;
  };
  governance: {
    status: CertificationStatus;
    sor: boolean; // System of Record
    piiLevel: 'None' | 'Sensitive' | 'Restricted';
  };
  schema: Column[];
  policies: Policy[];
  qualityHistory: QualityMetric[];
  lineage: {
    nodes: LineageNode[];
    links: LineageLink[];
  };
  aiContext: {
    description: string;
    recommendedPrompts: string[];
    risks: string[];
    joinLogic: string;
  };
  description: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
