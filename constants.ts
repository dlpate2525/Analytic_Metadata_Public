
import { Asset, AssetType, CertificationStatus } from './types';

export const MOCK_ASSET: Asset = {
  id: 'asset-123',
  technicalName: 'gold.cust_360_master',
  friendlyName: 'Customer 360 Gold Master',
  domain: 'Sales & Marketing',
  platform: 'Snowflake',
  environment: 'PROD',
  type: AssetType.TABLE,
  description: 'The definitive single view of the customer, aggregating CRM, Billing, and Support data. Used for segmentation, churn prediction, and financial reporting.',
  stats: {
    rows: 45200192,
    columns: 42,
    size: '12.4 GB',
    queriesLast30d: 18450,
  },
  timestamps: {
    lastUpdated: '2023-10-27T08:30:00Z',
    created: '2022-01-15T10:00:00Z',
  },
  people: {
    owner: 'Data Engineering (Team Alpha)',
    steward: 'Sarah Jenkins',
  },
  governance: {
    status: CertificationStatus.CERTIFIED,
    sor: true,
    piiLevel: 'Restricted',
  },
  schema: [
    { name: 'customer_id', type: 'VARCHAR(50)', nullable: false, description: 'Unique identifier for the customer (UUID).', pii: false, key: 'PK' },
    { name: 'email_address', type: 'VARCHAR(255)', nullable: false, description: 'Primary contact email.', pii: true, businessTerm: 'Contact Email' },
    { name: 'total_lifetime_value', type: 'DECIMAL(18,2)', nullable: true, description: 'Aggregated revenue from all streams.', pii: false, businessTerm: 'CLV' },
    { name: 'segment_tier', type: 'VARCHAR(20)', nullable: true, description: 'Calculated segment based on RFM model.', pii: false },
    { name: 'last_login_dt', type: 'TIMESTAMP', nullable: true, description: 'Last active session timestamp.', pii: false },
    { name: 'billing_country', type: 'VARCHAR(2)', nullable: true, description: 'ISO 2-letter country code.', pii: false },
    { name: 'account_status', type: 'VARCHAR(20)', nullable: false, description: 'Current status (Active, Churned, Paused).', pii: false },
    { name: 'support_tickets_open', type: 'INTEGER', nullable: false, description: 'Count of currently open Jira tickets.', pii: false },
  ],
  policies: [
    { id: 'pol-01', name: 'GDPR Retention', status: 'Compliant', description: 'Data older than 5 years is automatically purged.' },
    { id: 'pol-02', name: 'PII Hashing', status: 'Compliant', description: 'Email and Phone must be masked for non-admin roles.' },
    { id: 'pol-03', name: 'Schema Drift Check', status: 'Warning', description: 'Unexpected column "temp_score" detected.' },
  ],
  qualityHistory: [
    { date: '2023-10-20', score: 98, nullCount: 120, rowDrift: 0.1 },
    { date: '2023-10-21', score: 98, nullCount: 125, rowDrift: 0.2 },
    { date: '2023-10-22', score: 99, nullCount: 110, rowDrift: 0.0 },
    { date: '2023-10-23', score: 99, nullCount: 115, rowDrift: 0.1 },
    { date: '2023-10-24', score: 95, nullCount: 400, rowDrift: 2.5 }, // Anomaly
    { date: '2023-10-25', score: 97, nullCount: 150, rowDrift: 0.5 },
    { date: '2023-10-26', score: 98, nullCount: 130, rowDrift: 0.1 },
  ],
  lineage: {
    nodes: [
      { id: 'src_crm', name: 'Salesforce CRM', type: AssetType.API },
      { id: 'src_billing', name: 'Stripe Events', type: AssetType.PIPELINE },
      { id: 'stg_cust', name: 'raw.stg_customers', type: AssetType.TABLE },
      { id: 'stg_orders', name: 'raw.stg_orders', type: AssetType.TABLE },
      { id: 'this_asset', name: 'gold.cust_360_master', type: AssetType.TABLE, status: CertificationStatus.CERTIFIED },
      { id: 'dash_exec', name: 'Executive Overview', type: AssetType.DASHBOARD },
      { id: 'model_churn', name: 'Churn Predictor v2', type: AssetType.VIEW },
      { id: 'mart_finance', name: 'finance.monthly_rollups', type: AssetType.TABLE },
    ],
    links: [
      { source: 'src_crm', target: 'stg_cust' },
      { source: 'src_billing', target: 'stg_orders' },
      { source: 'stg_cust', target: 'this_asset' },
      { source: 'stg_orders', target: 'this_asset' },
      { source: 'this_asset', target: 'dash_exec' },
      { source: 'this_asset', target: 'model_churn' },
      { source: 'this_asset', target: 'mart_finance' },
    ]
  },
  aiContext: {
    description: "This table contains high-fidelity customer data. Use this for any queries regarding customer count, revenue per user, or geographic distribution.",
    recommendedPrompts: [
      "Summarize the churn rate by region for the last quarter.",
      "Identify high-value customers with open support tickets.",
      "Trend analysis of total lifetime value by acquisition cohort."
    ],
    risks: [
      "Do not use 'total_lifetime_value' for GAAP financial reporting; use 'mart_finance' instead.",
      "Email addresses are PII and should not be exposed in raw output."
    ],
    joinLogic: "Join with 'fact_orders' on customer_id. Relationship is 1:Many."
  }
};

export const MOCK_ASSET_LIST: Asset[] = [
  MOCK_ASSET,
  {
    ...MOCK_ASSET,
    id: 'asset-124',
    technicalName: 'raw.web_clickstream',
    friendlyName: 'Web Clickstream Raw',
    domain: 'Product',
    description: 'Raw event logs from the main website. High volume, uncleaned.',
    environment: 'PROD',
    type: AssetType.TABLE,
    governance: { ...MOCK_ASSET.governance, status: CertificationStatus.WARNING, sor: false },
    stats: { ...MOCK_ASSET.stats, rows: 1500000000, queriesLast30d: 500 },
  },
  {
    ...MOCK_ASSET,
    id: 'asset-125',
    technicalName: 'finance.revenue_forecast_2024',
    friendlyName: 'Revenue Forecast 2024',
    domain: 'Finance',
    description: 'Projected revenue models for fiscal year 2024.',
    environment: 'PROD',
    type: AssetType.VIEW,
    governance: { ...MOCK_ASSET.governance, status: CertificationStatus.CERTIFIED, sor: true },
    stats: { ...MOCK_ASSET.stats, rows: 5000, queriesLast30d: 3200 },
  },
  {
    ...MOCK_ASSET,
    id: 'asset-126',
    technicalName: 'hr.employee_roster',
    friendlyName: 'Global Employee Roster',
    domain: 'HR',
    description: 'Active employee list with hierarchy and department codes.',
    environment: 'PROD',
    type: AssetType.TABLE,
    governance: { ...MOCK_ASSET.governance, status: CertificationStatus.PENDING, piiLevel: 'Restricted' },
    stats: { ...MOCK_ASSET.stats, rows: 12000, queriesLast30d: 850 },
  },
  {
    ...MOCK_ASSET,
    id: 'asset-127',
    technicalName: 'marketing.campaign_performance',
    friendlyName: 'Campaign Performance Aggregates',
    domain: 'Marketing',
    description: 'Ad spend vs conversion metrics across Google, Meta, and LinkedIn.',
    environment: 'PROD',
    type: AssetType.TABLE,
    governance: { ...MOCK_ASSET.governance, status: CertificationStatus.CERTIFIED, sor: false },
    stats: { ...MOCK_ASSET.stats, rows: 850000, queriesLast30d: 4100 },
  }
];
