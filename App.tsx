
import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Database, 
  GitMerge, 
  Activity, 
  Users, 
  Brain, 
  Search, 
  Bell, 
  Settings, 
  Menu,
  CheckCircle,
  AlertTriangle,
  Clock,
  Fingerprint,
  Table as TableIcon,
  ChevronRight,
  Send,
  Sparkles,
  X,
  Home,
  FileText,
  Book,
  ClipboardCheck,
  BarChart2,
  Filter,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  History,
  Star,
  Globe,
  Calendar
} from 'lucide-react';
import { MOCK_ASSET, MOCK_ASSET_LIST } from './constants';
import { Asset, CertificationStatus, ChatMessage } from './types';
import { LineageGraph, QualityTrendChart, UsageBarChart, UploadsTrendChart, GovernancePieChart } from './components/Visualizations';
import { askGeminiAboutAsset } from './services/geminiService';

// --- Helper Functions ---
const getDependencyCounts = (asset: Asset) => {
  // Counts direct upstream (sources) and downstream (consumers)
  // In mock data, the current asset is represented as 'this_asset' in lineage links
  const directUpstream = asset.lineage.links.filter(l => l.target === 'this_asset').length;
  const directDownstream = asset.lineage.links.filter(l => l.source === 'this_asset').length;
  return { upstream: directUpstream, downstream: directDownstream };
};

// --- Shared UI Components ---

const Badge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'neutral' | 'error' }> = ({ children, variant = 'neutral' }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    neutral: 'bg-slate-100 text-slate-800 border-slate-200',
    error: 'bg-rose-100 text-rose-800 border-rose-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} inline-flex items-center gap-1`}>
      {children}
    </span>
  );
};

const SectionHeader: React.FC<{ title: string; description?: string; action?: React.ReactNode }> = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div>
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// --- New Section Views ---

const HomeView: React.FC<{ onNavigate: (section: string) => void }> = ({ onNavigate }) => {
    return (
    <div className="max-w-7xl mx-auto p-8 space-y-8">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-8 border border-slate-700 shadow-sm text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-bold mb-2">Enterprise Data Hub</h1>
                    <p className="text-slate-300">Search 1,248 data sources, reports, and glossary terms.</p>
                </div>
                 <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-3.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search assets, definitions, reports..." 
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                </div>
            </div>
            <div className="mt-8 flex gap-6 overflow-x-auto pb-2">
                 <div className="flex-1 min-w-[150px]">
                     <div className="text-3xl font-bold text-sky-400">1,248</div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Total Assets</div>
                 </div>
                 <div className="flex-1 min-w-[150px] border-l border-slate-700 pl-6">
                     <div className="text-3xl font-bold text-emerald-400">98%</div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Platform Health</div>
                 </div>
                 <div className="flex-1 min-w-[150px] border-l border-slate-700 pl-6 cursor-pointer hover:bg-white/5 rounded transition-colors" onClick={() => onNavigate('approvals')}>
                     <div className="text-3xl font-bold text-amber-400">5</div>
                     <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">Pending Approvals</div>
                 </div>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> My Watchlist
                    </h3>
                    <button className="text-xs text-sky-600 font-medium hover:underline" onClick={() => onNavigate('data-sources')}>View All</button>
                </div>
                <ul className="space-y-3">
                    <li className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                        <span className="text-slate-600 group-hover:text-sky-600 font-medium">cust_360_master</span>
                        <Badge variant="success">Certified</Badge>
                    </li>
                    <li className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                        <span className="text-slate-600 group-hover:text-sky-600 font-medium">stg_orders_v2</span>
                        <Badge variant="warning">Warning</Badge>
                    </li>
                    <li className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded cursor-pointer group">
                        <span className="text-slate-600 group-hover:text-sky-600 font-medium">marketing_spend</span>
                        <Badge variant="success">Certified</Badge>
                    </li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                         <Activity className="w-5 h-5 text-rose-500" /> Critical Alerts
                    </h3>
                </div>
                <ul className="space-y-3">
                    <li className="flex gap-3 text-sm">
                        <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-rose-500"></div>
                        <div>
                            <span className="text-slate-900 font-medium block">Schema Drift Detected</span>
                            <span className="text-xs text-slate-500">raw.finance_transactions • 2 hrs ago</span>
                        </div>
                    </li>
                     <li className="flex gap-3 text-sm">
                        <div className="mt-1 min-w-[6px] h-[6px] rounded-full bg-amber-500"></div>
                         <div>
                            <span className="text-slate-900 font-medium block">Freshness SLA Missed</span>
                            <span className="text-xs text-slate-500">api.weather_feed • 5 hrs ago</span>
                        </div>
                    </li>
                </ul>
            </div>

            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-white to-purple-50">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                        <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">LENS AI Insights</h3>
                </div>
                 <p className="text-sm text-slate-600 mb-4">"I've detected 3 potentially redundant datasets in the Marketing domain that overlap by 85%."</p>
                 <button className="text-sm text-purple-700 bg-purple-100 hover:bg-purple-200 px-4 py-2 rounded-md font-medium transition-colors w-full">Review Suggestions</button>
            </div>
        </div>
    </div>
    );
}

const ReportingView: React.FC = () => {
    const [filter, setFilter] = useState('All');
    const reports = [
        { name: 'Monthly Financials', dept: 'Finance', owner: 'Mike T.', status: 'Certified', lastRun: '2h ago' },
        { name: 'Executive Operations', dept: 'Exec', owner: 'Sarah J.', status: 'Certified', lastRun: '4h ago' },
        { name: 'Sales Performance', dept: 'Sales', owner: 'Alex B.', status: 'Pending', lastRun: '1d ago' },
        { name: 'Compliance Overview', dept: 'Legal', owner: 'Jane D.', status: 'Certified', lastRun: '6h ago' },
        { name: 'Platform Usage', dept: 'IT', owner: 'SysAdmin', status: 'Warning', lastRun: '30m ago' },
        { name: 'Marketing ROI', dept: 'Marketing', owner: 'Emily R.', status: 'Certified', lastRun: '12h ago' },
    ];

    const filteredReports = filter === 'All' ? reports : reports.filter(r => r.dept === filter);

    return (
    <div className="max-w-7xl mx-auto p-8">
        <SectionHeader 
            title="Reporting Catalog" 
            description="Certified enterprise dashboards and operational reports."
            action={
                <div className="flex gap-2">
                    {['All', 'Finance', 'Sales', 'Exec'].map(f => (
                        <button 
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                filter === f 
                                ? 'bg-slate-800 text-white border-slate-800' 
                                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                            }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            }
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReports.map((report, i) => (
                <div key={i} className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:border-sky-300 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-slate-200 group-hover:bg-sky-50 transition-colors"></div>
                    <div className="flex justify-between items-start mb-3 pl-3">
                         <div className="w-10 h-10 bg-slate-50 rounded-lg flex items-center justify-center text-slate-400 group-hover:text-sky-600 transition-colors">
                            <BarChart2 className="w-6 h-6" />
                        </div>
                        <Badge variant={report.status === 'Certified' ? 'success' : report.status === 'Warning' ? 'warning' : 'neutral'}>
                            {report.status}
                        </Badge>
                    </div>
                    <div className="pl-3">
                        <h3 className="font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">{report.name}</h3>
                        <div className="text-xs text-slate-500 mt-2 flex gap-3">
                            <span>{report.dept}</span>
                            <span>•</span>
                            <span>{report.owner}</span>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400">
                            <Clock className="w-3 h-3" />
                            Run: {report.lastRun}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    </div>
    );
};

const DataDictionaryView: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const terms = [
        { term: 'Churn Rate', def: 'Percentage of customers who stopped using the service.', domain: 'Sales', owner: 'Sarah J.', related: 3 },
        { term: 'Gross Margin', def: 'Revenue minus cost of goods sold.', domain: 'Finance', owner: 'Mike T.', related: 5 },
        { term: 'Active User', def: 'User with at least one session in last 30 days.', domain: 'Product', owner: 'Jane D.', related: 12 },
        { term: 'CAC', def: 'Customer Acquisition Cost.', domain: 'Marketing', owner: 'Alex B.', related: 2 },
        { term: 'MRR', def: 'Monthly Recurring Revenue.', domain: 'Finance', owner: 'Mike T.', related: 4 },
        { term: 'Bounce Rate', def: 'Percentage of visitors who navigate away after viewing one page.', domain: 'Marketing', owner: 'Alex B.', related: 1 },
    ];

    const filteredTerms = terms.filter(t => 
        t.term.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.def.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
    <div className="max-w-7xl mx-auto p-8">
        <SectionHeader title="Data Dictionary" description="Enterprise Business Glossary and Term Definitions." />
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-4 border-b border-slate-200 flex gap-4 bg-slate-50">
                <div className="relative flex-1 max-w-lg">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search for business terms..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                </div>
                <div className="flex-1 flex justify-end">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm">
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                </div>
            </div>
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                    <tr>
                        <th className="px-6 py-3">Term</th>
                        <th className="px-6 py-3">Definition</th>
                        <th className="px-6 py-3">Domain</th>
                        <th className="px-6 py-3">Related Assets</th>
                        <th className="px-6 py-3">Owner</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {filteredTerms.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-50 group cursor-pointer">
                            <td className="px-6 py-4 font-semibold text-slate-900 group-hover:text-sky-600">{row.term}</td>
                            <td className="px-6 py-4 text-slate-600">{row.def}</td>
                            <td className="px-6 py-4"><Badge variant="neutral">{row.domain}</Badge></td>
                            <td className="px-6 py-4 text-sky-600 font-medium hover:underline">{row.related} Assets</td>
                            <td className="px-6 py-4 text-slate-500">{row.owner}</td>
                        </tr>
                    ))}
                    {filteredTerms.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-8 text-center text-slate-500">No terms found matching "{searchTerm}"</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    </div>
    );
};

const ApprovalsView: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    
    // Mock State for interactivity
    const [pendingItems, setPendingItems] = useState([
        { id: 1, type: 'Access Request', subject: 'Sales Mart Access', user: 'Robert Fox', date: 'Oct 24, 2023', status: 'Pending' },
        { id: 2, type: 'Certification', subject: 'Customer 360 Gold', user: 'Sarah Jenkins', date: 'Oct 23, 2023', status: 'Reviewing' },
        { id: 3, type: 'Schema Change', subject: 'Add column: credit_score', user: 'Data Eng Team', date: 'Oct 22, 2023', status: 'Pending' },
    ]);
    const [historyItems, setHistoryItems] = useState([
        { id: 4, type: 'Access Request', subject: 'HR Analytics', user: 'Jane Doe', date: 'Oct 20, 2023', status: 'Approved' },
        { id: 5, type: 'Schema Change', subject: 'Drop column: temp_id', user: 'Data Eng Team', date: 'Oct 19, 2023', status: 'Rejected' },
    ]);

    const handleAction = (id: number, action: 'Approve' | 'Reject') => {
        const item = pendingItems.find(i => i.id === id);
        if (item) {
            setPendingItems(prev => prev.filter(i => i.id !== id));
            setHistoryItems(prev => [{...item, status: action === 'Approve' ? 'Approved' : 'Rejected'}, ...prev]);
        }
    };

    return (
    <div className="max-w-7xl mx-auto p-8">
        <SectionHeader title="Governance Approvals" description="Manage pending requests for data access, certification, and schema changes." />
        
        <div className="flex gap-4 mb-6 border-b border-slate-200">
            <button 
                onClick={() => setActiveTab('pending')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'pending' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                Pending Review ({pendingItems.length})
            </button>
            <button 
                onClick={() => setActiveTab('history')}
                className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${activeTab === 'history' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
            >
                History ({historyItems.length})
            </button>
        </div>

        <div className="space-y-4">
             {activeTab === 'pending' && pendingItems.length === 0 && (
                 <div className="text-center py-12 bg-slate-50 rounded border border-dashed border-slate-300 text-slate-500">
                     <CheckCircle className="w-8 h-8 mx-auto text-emerald-400 mb-2" />
                     All caught up! No pending approvals.
                 </div>
             )}
             
             {activeTab === 'pending' ? pendingItems.map((item) => (
                 <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between animate-fadeIn">
                     <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-sky-50 rounded-full flex items-center justify-center text-sky-600">
                             <ClipboardCheck className="w-5 h-5" />
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                             <p className="text-xs text-slate-500">{item.type} • Requested by {item.user} • {item.date}</p>
                         </div>
                     </div>
                     <div className="flex gap-2">
                         <button onClick={() => handleAction(item.id, 'Reject')} className="px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded border border-transparent hover:border-rose-200">Reject</button>
                         <button onClick={() => handleAction(item.id, 'Approve')} className="px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-700 rounded shadow-sm">Approve</button>
                     </div>
                 </div>
             )) : historyItems.map((item) => (
                <div key={item.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex items-center justify-between opacity-75">
                     <div className="flex items-center gap-4">
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.status === 'Approved' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                             {item.status === 'Approved' ? <CheckCircle className="w-5 h-5" /> : <X className="w-5 h-5" />}
                         </div>
                         <div>
                             <h4 className="text-sm font-bold text-slate-900">{item.subject}</h4>
                             <p className="text-xs text-slate-500">{item.type} • {item.date} • <span className={item.status === 'Approved' ? 'text-emerald-600' : 'text-rose-600'}>{item.status}</span></p>
                         </div>
                     </div>
                 </div>
             ))}
        </div>
    </div>
    );
};

const LensMetricsView: React.FC = () => {
    // Mock data for 30 Days
    const metrics30d = {
        topReports: [
            { name: 'Monthly Financials', views: 1250, dept: 'Finance' },
            { name: 'Marketing Campaign Tracker', views: 980, dept: 'Marketing' },
            { name: 'Weekly Operations Update', views: 850, dept: 'Ops' },
        ],
        uploadedReports: 24,
        etlRuns: '145.2k',
    };

    // Mock data for Total
    const metricsTotal = {
        topReports: [
            { name: 'Executive Overview', views: 45200, dept: 'Exec' },
            { name: 'Customer 360 Master', views: 32500, dept: 'Sales' },
            { name: 'Revenue Forecast Model', views: 28100, dept: 'Finance' },
        ],
        totalReports: 1248,
        activePipelines: 420,
    };

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-8">
            <SectionHeader 
                title="LENS Platform Metrics" 
                description="Operational analytics for Data Executives and Stewards." 
                action={<button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-300 text-slate-700 rounded text-xs font-medium"><Download className="w-3 h-3" /> Export Report</button>}
            />
            
            {/* Last 30 Days Section */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                     <Calendar className="w-5 h-5 text-sky-500" />
                     <h3 className="text-lg font-semibold text-slate-900">Last 30 Days Activity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Reports List */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-1 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                            <Star className="w-4 h-4 text-amber-500" /> Top Used Reports
                        </h4>
                         <ul className="space-y-3">
                            {metrics30d.topReports.map((r, i) => (
                                <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-slate-400 w-4">#{i+1}</div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                                            <div className="text-xs text-slate-500">{r.dept}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-semibold text-sky-600">{r.views.toLocaleString()}</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Report Uploads Card */}
                     <div className="bg-gradient-to-br from-emerald-50 to-white rounded-lg p-6 flex flex-col items-center justify-center text-center border border-emerald-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-emerald-500 mb-3 border border-emerald-100">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{metrics30d.uploadedReports}</div>
                        <div className="text-sm text-slate-600 font-medium">New Reports</div>
                        <div className="mt-2 text-xs text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded-full">+12% vs prev month</div>
                     </div>

                     {/* ETL Flows Card */}
                     <div className="bg-gradient-to-br from-indigo-50 to-white rounded-lg p-6 flex flex-col items-center justify-center text-center border border-indigo-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-indigo-500 mb-3 border border-indigo-100">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{metrics30d.etlRuns}</div>
                        <div className="text-sm text-slate-600 font-medium">ETL Job Runs</div>
                        <div className="mt-2 text-xs text-indigo-700 bg-indigo-100/50 px-2 py-1 rounded-full">99.9% Success Rate</div>
                     </div>
                </div>
            </div>

            {/* Total Section */}
             <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                     <History className="w-5 h-5 text-purple-500" />
                     <h3 className="text-lg font-semibold text-slate-900">All Time / Platform Totals</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Top Reports List */}
                    <div className="col-span-1 md:col-span-3 lg:col-span-1 space-y-4">
                        <h4 className="text-sm font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                             <TrendingUp className="w-4 h-4 text-purple-500" /> Most Popular
                        </h4>
                         <ul className="space-y-3">
                            {metricsTotal.topReports.map((r, i) => (
                                <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded border border-slate-100">
                                    <div className="flex items-center gap-3">
                                        <div className="text-sm font-bold text-slate-400 w-4">#{i+1}</div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                                            <div className="text-xs text-slate-500">{r.dept}</div>
                                        </div>
                                    </div>
                                    <div className="text-xs font-mono font-semibold text-purple-600">{(r.views / 1000).toFixed(1)}k</div>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Total Reports Card */}
                     <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 mb-3">
                            <Database className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{metricsTotal.totalReports.toLocaleString()}</div>
                        <div className="text-sm text-slate-600 font-medium">Total Reports Cataloged</div>
                     </div>

                     {/* Active Pipelines Card */}
                     <div className="bg-slate-50 rounded-lg p-6 flex flex-col items-center justify-center text-center border border-slate-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-500 mb-3">
                            <GitMerge className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-bold text-slate-900">{metricsTotal.activePipelines}</div>
                        <div className="text-sm text-slate-600 font-medium">Active ETL Pipelines</div>
                     </div>
                </div>
            </div>
            
        </div>
    );
};

// --- Sub-components for Asset Detail ---

const SchemaView: React.FC<{ asset: Asset }> = ({ asset }) => (
  <div className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
          <tr>
            <th className="px-6 py-3">Column Name</th>
            <th className="px-6 py-3">Type</th>
            <th className="px-6 py-3">Key</th>
            <th className="px-6 py-3">Nullable</th>
            <th className="px-6 py-3">PII</th>
            <th className="px-6 py-3">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {asset.schema.map((col) => (
            <tr key={col.name} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-3 font-medium text-slate-900">{col.name}</td>
              <td className="px-6 py-3 font-mono text-slate-600 text-xs">{col.type}</td>
              <td className="px-6 py-3">
                {col.key === 'PK' && <Badge variant="success">PK</Badge>}
                {col.key === 'FK' && <Badge variant="neutral">FK</Badge>}
              </td>
              <td className="px-6 py-3 text-slate-600">{col.nullable ? 'Yes' : 'No'}</td>
              <td className="px-6 py-3">
                {col.pii ? <Badge variant="error">PII</Badge> : <span className="text-slate-400">-</span>}
              </td>
              <td className="px-6 py-3 text-slate-600 truncate max-w-xs" title={col.description}>
                {col.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const GovernanceView: React.FC<{ asset: Asset }> = ({ asset }) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <SectionHeader title="Applied Policies" description="Regulatory and internal compliance rules applied to this data source." />
        <div className="space-y-4">
          {asset.policies.map((policy) => (
            <div key={policy.id} className="flex items-start justify-between p-4 bg-slate-50 rounded-md border border-slate-100">
              <div className="flex gap-3">
                <Shield className={`w-5 h-5 mt-0.5 ${policy.status === 'Compliant' ? 'text-emerald-500' : 'text-amber-500'}`} />
                <div>
                  <h4 className="text-sm font-semibold text-slate-900">{policy.name}</h4>
                  <p className="text-sm text-slate-600 mt-1">{policy.description}</p>
                </div>
              </div>
              <Badge variant={policy.status === 'Compliant' ? 'success' : 'warning'}>{policy.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
        <SectionHeader title="Certification" />
        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">{asset.governance.status}</h3>
          <p className="text-sm text-slate-500 mt-2">Verified by {asset.people.steward}</p>
          <p className="text-xs text-slate-400 mt-1">on {new Date(asset.timestamps.lastUpdated).toLocaleDateString()}</p>
        </div>
        <div className="border-t border-slate-100 pt-4 mt-4 space-y-2">
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">System of Record</span>
                <span className="font-medium text-slate-900">{asset.governance.sor ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between text-sm">
                <span className="text-slate-500">PII Level</span>
                <span className="font-medium text-slate-900">{asset.governance.piiLevel}</span>
            </div>
        </div>
      </div>
    </div>
  </div>
);

const QualityView: React.FC<{ asset: Asset }> = ({ asset }) => (
  <div className="grid grid-cols-1 gap-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm text-slate-500 font-medium">Data Quality Score</span>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">98</span>
                <span className="text-sm text-emerald-600 font-medium">Excellent</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm text-slate-500 font-medium">Freshness SLA</span>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">4h</span>
                <span className="text-sm text-emerald-600 font-medium">Met (Target: &lt;6h)</span>
            </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex flex-col">
            <span className="text-sm text-slate-500 font-medium">Null Rate Trend</span>
            <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-slate-900">0.4%</span>
                <span className="text-sm text-slate-600 font-medium">Stable</span>
            </div>
        </div>
    </div>
    <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
      <SectionHeader title="Quality Score History" description="7-day trend of aggregate data quality score based on validity, completeness, and consistency checks." />
      <QualityTrendChart data={asset.qualityHistory} />
    </div>
  </div>
);

const AiContextView: React.FC<{ asset: Asset }> = ({ asset }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-slate-900 text-slate-100 p-6 rounded-lg shadow-lg">
      <div className="flex items-center gap-2 mb-4 text-sky-400">
        <Brain className="w-6 h-6" />
        <h3 className="font-bold text-lg">Semantics & Usage</h3>
      </div>
      <p className="text-slate-300 mb-6 leading-relaxed">
        {asset.aiContext.description}
      </p>
      
      <h4 className="font-semibold text-slate-100 mb-2">Recommended Prompts</h4>
      <ul className="space-y-3 mb-6">
        {asset.aiContext.recommendedPrompts.map((prompt, i) => (
           <li key={i} className="flex gap-3 bg-slate-800 p-3 rounded border border-slate-700">
             <span className="text-sky-500 font-mono select-none">$</span>
             <span className="text-sm text-slate-200 italic">"{prompt}"</span>
           </li>
        ))}
      </ul>
    </div>

    <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <h4 className="font-semibold text-amber-600 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Risk Warnings for LLMs
            </h4>
            <ul className="list-disc list-inside space-y-2 text-slate-700 text-sm">
                {asset.aiContext.risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                ))}
            </ul>
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
             <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <GitMerge className="w-5 h-5 text-slate-500" />
                Join Logic
            </h4>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-sm text-slate-700">
                {asset.aiContext.joinLogic}
            </div>
        </div>
    </div>
  </div>
);

const LineageView: React.FC<{ asset: Asset }> = ({ asset }) => {
    // Helper to calculate lineage lists dynamically
    const { upstreamNodes, downstreamNodes } = React.useMemo(() => {
        const currentId = 'this_asset';
        const upstreamIds = new Set<string>();
        const downstreamIds = new Set<string>();
        const directUpstreamIds = new Set<string>();
        const directDownstreamIds = new Set<string>();

        // Identify direct connections
        asset.lineage.links.forEach(link => {
            if (link.target === currentId) directUpstreamIds.add(link.source);
            if (link.source === currentId) directDownstreamIds.add(link.target);
        });
        
        // Find Upstream (Recursive)
        const findUpstream = (id: string) => {
            asset.lineage.links.forEach(link => {
                if (link.target === id && !upstreamIds.has(link.source)) {
                    upstreamIds.add(link.source);
                    findUpstream(link.source);
                }
            });
        }
        
        // Find Downstream (Recursive)
        const findDownstream = (id: string) => {
            asset.lineage.links.forEach(link => {
                if (link.source === id && !downstreamIds.has(link.target)) {
                    downstreamIds.add(link.target);
                    findDownstream(link.target);
                }
            });
        }

        findUpstream(currentId);
        findDownstream(currentId);
        
        const upstreamNodes = asset.lineage.nodes
            .filter(n => upstreamIds.has(n.id))
            .map(n => ({ ...n, isDirect: directUpstreamIds.has(n.id) }));

        const downstreamNodes = asset.lineage.nodes
            .filter(n => downstreamIds.has(n.id))
            .map(n => ({ ...n, isDirect: directDownstreamIds.has(n.id) }));
        
        return { upstreamNodes, downstreamNodes };
    }, [asset]);

    const getNodeIcon = (type: string) => {
        if (type.includes('Dashboard')) return <BarChart2 className="w-4 h-4" />;
        if (type.includes('Pipeline') || type.includes('API')) return <GitMerge className="w-4 h-4" />;
        if (type.includes('View')) return <TableIcon className="w-4 h-4" />;
        return <Database className="w-4 h-4" />;
    };

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <SectionHeader title="Dependency Graph" description="Interactive visualization of upstream sources and downstream consumers." />
                <LineageGraph data={asset.lineage} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                         <ArrowDownLeft className="w-5 h-5 text-sky-500" />
                         Upstream Dependencies (Sources)
                    </h4>
                    {upstreamNodes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
                             <Database className="w-8 h-8 mx-auto mb-2 opacity-50" />
                             <p className="text-sm">No upstream dependencies found.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {upstreamNodes.map(node => (
                                <li key={node.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-sky-200 hover:bg-sky-50 transition-colors cursor-default group">
                                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-sky-600">
                                        {getNodeIcon(node.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                                            {node.name}
                                            {node.isDirect && <span className="px-1.5 py-0.5 rounded text-[10px] bg-sky-100 text-sky-700 font-semibold border border-sky-200">Direct</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">{node.type}</div>
                                    </div>
                                     {node.status && (
                                         <Badge variant={node.status === 'Certified' ? 'success' : 'neutral'}>
                                             {node.status}
                                         </Badge>
                                     )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                    <h4 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <ArrowUpRight className="w-5 h-5 text-purple-500" />
                        Downstream Consumers (Impact)
                    </h4>
                     {downstreamNodes.length === 0 ? (
                         <div className="text-center py-8 text-slate-400 bg-slate-50 rounded border border-dashed border-slate-200">
                             <BarChart2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                             <p className="text-sm">No downstream consumers found.</p>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {downstreamNodes.map(node => (
                                <li key={node.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-purple-200 hover:bg-purple-50 transition-colors cursor-default group">
                                    <div className="w-8 h-8 rounded bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-hover:text-purple-600">
                                        {getNodeIcon(node.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-2">
                                            {node.name}
                                             {node.isDirect && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-semibold border border-purple-200">Direct</span>}
                                        </div>
                                        <div className="text-xs text-slate-500">{node.type}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

const UsageView: React.FC<{ asset: Asset }> = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <SectionHeader title="Consumption by Department" description="Query volume broken down by organizational unit (Last 30 Days)." />
            <UsageBarChart />
        </div>
        <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-sm">
            <SectionHeader title="Top Users" />
            <ul className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                    <li key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                U{i}
                             </div>
                             <div>
                                 <div className="text-sm font-medium text-slate-900">User_{i}</div>
                                 <div className="text-xs text-slate-500">Finance Analyst</div>
                             </div>
                        </div>
                        <span className="text-sm text-slate-600 font-mono">{150 - (i * 10)} qrys</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

// --- Detail View Wrapper ---

const DataSourceDetailView: React.FC<{ asset: Asset, onBack: () => void }> = ({ asset, onBack }) => {
    const [activeTab, setActiveTab] = useState('schema');
    const [isAiOpen, setIsAiOpen] = useState(false);
    const [chatInput, setChatInput] = useState('');
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [isAiLoading, setIsAiLoading] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const { upstream, downstream } = getDependencyCounts(asset);

    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;

        const userMsg: ChatMessage = { role: 'user', text: chatInput };
        setChatHistory(prev => [...prev, userMsg]);
        setChatInput('');
        setIsAiLoading(true);

        try {
        const responseText = await askGeminiAboutAsset(asset, userMsg.text, chatHistory);
        const aiMsg: ChatMessage = { role: 'model', text: responseText };
        setChatHistory(prev => [...prev, aiMsg]);
        } catch (e) {
        setChatHistory(prev => [...prev, { role: 'model', text: "Sorry, something went wrong." }]);
        } finally {
        setIsAiLoading(false);
        }
    };

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatHistory, isAiOpen]);

    const tabs = [
        { id: 'schema', label: 'Schema', icon: TableIcon },
        { id: 'lineage', label: 'Lineage', icon: GitMerge },
        { id: 'governance', label: 'Governance', icon: Shield },
        { id: 'quality', label: 'Quality', icon: CheckCircle },
        { id: 'usage', label: 'Usage', icon: Users },
        { id: 'ai-context', label: 'AI Context', icon: Brain },
    ];

    return (
        <div className="flex flex-col h-full relative">
            <header className="bg-white border-b border-slate-200 shadow-sm z-10 flex-shrink-0">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                {/* Breadcrumb & Tools */}
                <div className="flex items-center justify-between mb-4">
                    <nav className="flex items-center text-sm text-slate-500 space-x-2">
                        <button onClick={onBack} className="hover:text-slate-900">Data Sources</button>
                        <ChevronRight className="w-4 h-4" />
                        <span>{asset.platform}</span>
                        <ChevronRight className="w-4 h-4" />
                        <span className="font-medium text-slate-900">{asset.friendlyName}</span>
                    </nav>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => setIsAiOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-full border border-sky-100 transition-colors"
                        >
                            <Sparkles className="w-4 h-4" />
                            Ask AI
                        </button>
                        <button className="p-2 text-slate-400 hover:text-slate-600"><Bell className="w-5 h-5" /></button>
                        <button className="p-2 text-slate-400 hover:text-slate-600"><Settings className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Asset Identity */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                    {asset.friendlyName}
                    {asset.governance.status === CertificationStatus.CERTIFIED && (
                        <Badge variant="success"><CheckCircle className="w-3 h-3" /> Certified</Badge>
                    )}
                    </h1>
                    <p className="text-slate-500 font-mono text-sm mt-1">{asset.technicalName}</p>
                    <div className="flex items-center gap-6 mt-3 text-sm text-slate-600">
                        <span className="flex items-center gap-1.5"><Database className="w-4 h-4 text-slate-400" /> {asset.platform} ({asset.environment})</span>
                        <span className="flex items-center gap-1.5"><Fingerprint className="w-4 h-4 text-slate-400" /> {asset.id}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-slate-400" /> Updated: {new Date(asset.timestamps.lastUpdated).toLocaleDateString()}</span>
                    </div>
                </div>
                
                {/* Stats Cards */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-slate-50 rounded border border-slate-100 text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Rows</div>
                        <div className="font-semibold text-slate-900">{asset.stats.rows.toLocaleString()}</div>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded border border-slate-100 text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Size</div>
                        <div className="font-semibold text-slate-900">{asset.stats.size}</div>
                    </div>
                    {/* NEW Lineage Stats Block */}
                    <div className="px-4 py-2 bg-slate-50 rounded border border-slate-100 text-center min-w-[120px]">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Lineage</div>
                        <div className="font-semibold text-slate-900 text-sm flex items-center justify-center gap-2">
                            <span className="flex items-center text-slate-700" title="Upstream Sources"><ArrowDownLeft className="w-3.5 h-3.5 text-slate-400 mr-1" />{upstream}</span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center text-slate-700" title="Downstream Consumers"><ArrowUpRight className="w-3.5 h-3.5 text-slate-400 mr-1" />{downstream}</span>
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-slate-50 rounded border border-slate-100 text-center hidden sm:block">
                        <div className="text-xs text-slate-500 uppercase tracking-wide">Owner</div>
                        <div className="font-semibold text-slate-900 text-sm max-w-[100px] truncate">{asset.people.owner}</div>
                    </div>
                </div>
                </div>
                
                {/* Tab Navigation */}
                <div className="flex space-x-1 mt-6 border-b border-slate-200 overflow-x-auto no-scrollbar">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                                isActive 
                                ? 'border-sky-500 text-sky-600' 
                                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                            }`}
                        >
                            <Icon className={`w-4 h-4 ${isActive ? 'text-sky-500' : 'text-slate-400'}`} />
                            {tab.label}
                        </button>
                    );
                })}
                </div>
            </div>
            </header>

            {/* Tab Content Area */}
            <div className="flex-1 overflow-y-auto bg-slate-50/50 p-4 sm:p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                    {activeTab === 'schema' && <SchemaView asset={asset} />}
                    {activeTab === 'governance' && <GovernanceView asset={asset} />}
                    {activeTab === 'quality' && <QualityView asset={asset} />}
                    {activeTab === 'lineage' && <LineageView asset={asset} />}
                    {activeTab === 'usage' && <UsageView asset={asset} />}
                    {activeTab === 'ai-context' && <AiContextView asset={asset} />}
                </div>
            </div>

            {/* LENS AI Slide-over */}
            {isAiOpen && (
                <div className="absolute inset-0 z-50 flex justify-end">
                    <div 
                        className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"
                        onClick={() => setIsAiOpen(false)}
                    ></div>
                    <div className="relative w-full max-w-md bg-white shadow-2xl flex flex-col h-full border-l border-slate-200">
                        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-500 to-blue-600 text-white">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5" />
                                <h2 className="font-semibold">Ask LENS AI</h2>
                            </div>
                            <button onClick={() => setIsAiOpen(false)} className="p-1 hover:bg-white/20 rounded">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {chatHistory.length === 0 && (
                                <div className="text-center mt-10 p-6">
                                    <div className="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <Brain className="w-6 h-6 text-sky-600" />
                                    </div>
                                    <h3 className="text-slate-900 font-medium">How can I help?</h3>
                                    <p className="text-sm text-slate-500 mt-2">I have full context on this data source's schema, policies, and lineage.</p>
                                    <div className="mt-6 space-y-2">
                                        <button onClick={() => setChatInput("Who owns this dataset?")} className="block w-full text-left p-3 text-sm bg-white border border-slate-200 rounded hover:border-sky-300 transition-colors text-slate-700">
                                            "Who owns this dataset?"
                                        </button>
                                        <button onClick={() => setChatInput("Explain the PII risks.")} className="block w-full text-left p-3 text-sm bg-white border border-slate-200 rounded hover:border-sky-300 transition-colors text-slate-700">
                                            "Explain the PII risks."
                                        </button>
                                        <button onClick={() => setChatInput("What dashboards break if I drop 'segment_tier'?")} className="block w-full text-left p-3 text-sm bg-white border border-slate-200 rounded hover:border-sky-300 transition-colors text-slate-700">
                                            "What dashboards use this?"
                                        </button>
                                    </div>
                                </div>
                            )}
                            {chatHistory.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-sky-600 text-white rounded-br-none' 
                                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
                                    }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            {isAiLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 rounded-bl-none shadow-sm">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                                            <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={chatEndRef} />
                        </div>

                        <div className="p-4 bg-white border-t border-slate-200">
                            <div className="flex items-center gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 border border-slate-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                                    placeholder="Ask a question..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    disabled={isAiLoading}
                                />
                                <button 
                                    onClick={handleSendMessage}
                                    disabled={isAiLoading || !chatInput.trim()}
                                    className="p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="text-center mt-2">
                                <span className="text-[10px] text-slate-400">Powered by Google Gemini 2.5 Flash</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// --- Data Source Catalog / List View ---
const DataSourceCatalog: React.FC<{ onSelect: (id: string) => void }> = ({ onSelect }) => {
    const [search, setSearch] = useState('');
    const [domainFilter, setDomainFilter] = useState('All');
    
    // Simple filter logic for mock data
    const filteredAssets = MOCK_ASSET_LIST.filter(a => {
        const matchesSearch = a.friendlyName.toLowerCase().includes(search.toLowerCase()) || 
                              a.technicalName.toLowerCase().includes(search.toLowerCase());
        const matchesDomain = domainFilter === 'All' || a.domain === domainFilter;
        return matchesSearch && matchesDomain;
    });

    return (
        <div className="max-w-7xl mx-auto p-8 space-y-6">
            <SectionHeader title="Data Source Catalog" description="Explore, validate, and access enterprise data assets." />
            
            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search by name, table, or description..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500" 
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto">
                    <Filter className="w-5 h-5 text-slate-400" />
                    {['All', 'Sales & Marketing', 'Finance', 'HR', 'Product'].map(d => (
                         <button 
                            key={d}
                            onClick={() => setDomainFilter(d)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-full border whitespace-nowrap transition-colors ${
                                domainFilter === d
                                ? 'bg-sky-50 border-sky-200 text-sky-700' 
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                        >
                            {d}
                        </button>
                    ))}
                </div>
            </div>

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAssets.map(asset => {
                    const { upstream, downstream } = getDependencyCounts(asset);
                    return (
                        <div key={asset.id} onClick={() => onSelect(asset.id)} className="bg-white rounded-lg border border-slate-200 shadow-sm hover:border-sky-300 hover:shadow-md transition-all cursor-pointer group flex flex-col h-full">
                            <div className="p-5 flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <Badge variant={asset.environment === 'PROD' ? 'success' : 'warning'}>{asset.environment}</Badge>
                                        <span className="text-xs text-slate-500 uppercase font-semibold">{asset.type}</span>
                                    </div>
                                    {asset.governance.status === CertificationStatus.CERTIFIED && (
                                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                                    )}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-sky-700 transition-colors mb-1">{asset.friendlyName}</h3>
                                <p className="text-xs font-mono text-slate-400 mb-4">{asset.technicalName}</p>
                                <p className="text-sm text-slate-600 line-clamp-2 mb-4">{asset.description}</p>
                                
                                <div className="flex flex-wrap gap-2 mt-auto">
                                    <Badge variant="neutral">{asset.domain}</Badge>
                                    <Badge variant="neutral">{asset.platform}</Badge>
                                </div>
                            </div>
                            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 rounded-b-lg flex justify-between items-center text-xs text-slate-500">
                                <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {asset.people.owner}</span>
                                <div className="flex items-center gap-3">
                                     <span className="flex items-center gap-1" title="Upstream Sources"><ArrowDownLeft className="w-3.5 h-3.5 text-slate-400" /> {upstream}</span>
                                     <span className="flex items-center gap-1" title="Downstream Consumers"><ArrowUpRight className="w-3.5 h-3.5 text-slate-400" /> {downstream}</span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

// --- Main App Shell ---

const App: React.FC = () => {
    const [currentSection, setCurrentSection] = useState('home');
    const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

    const navItems = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'data-sources', label: 'Data Sources', icon: Database },
        { id: 'reporting', label: 'Reporting', icon: BarChart2 },
        { id: 'dictionary', label: 'Data Dictionary', icon: Book },
        { id: 'approvals', label: 'Approvals', icon: ClipboardCheck },
        { id: 'metrics', label: 'LENS Metrics', icon: TrendingUp },
    ];

    const handleSelectAsset = (id: string) => {
        setSelectedAssetId(id);
        // Ensure we stay on a view that supports asset detail, but technically the detail view replaces the main content
    };

    const handleNavigate = (id: string) => {
        setCurrentSection(id);
        setSelectedAssetId(null);
    };

    // Logic to render the main content area
    const renderContent = () => {
        if (selectedAssetId) {
            const asset = MOCK_ASSET_LIST.find(a => a.id === selectedAssetId) || MOCK_ASSET;
            return <DataSourceDetailView asset={asset} onBack={() => setSelectedAssetId(null)} />;
        }

        switch (currentSection) {
            case 'home': return <HomeView onNavigate={handleNavigate} />;
            case 'data-sources': return <DataSourceCatalog onSelect={handleSelectAsset} />;
            case 'reporting': return <ReportingView />;
            case 'dictionary': return <DataDictionaryView />;
            case 'approvals': return <ApprovalsView />;
            case 'metrics': return <LensMetricsView />;
            default: return <HomeView onNavigate={handleNavigate} />;
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
            {/* Sidebar Navigation */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col flex-shrink-0 border-r border-slate-800">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-sky-900/50">
                        L
                    </div>
                    <div>
                        <h1 className="text-white font-bold tracking-tight">LENS Hub</h1>
                        <p className="text-xs text-slate-500">Enterprise Data Catalog</p>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = currentSection === item.id && !selectedAssetId;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                                    isActive 
                                    ? 'bg-sky-600 text-white shadow-md' 
                                    : 'hover:bg-slate-800 hover:text-white'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                                <span className="font-medium">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                     <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-lg">
                        <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-xs">
                            JD
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-sm font-medium text-white truncate">Jane Doe</div>
                            <div className="text-xs text-slate-400 truncate">Data Steward</div>
                        </div>
                        <Settings className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
                     </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <div className="flex-1 overflow-y-auto scroll-smooth">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default App;
