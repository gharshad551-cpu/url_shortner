import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { apiFetch, API_URL } from "../utils/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";

const AdminDashboard = () => {
  const { user, login, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentUrls, setRecentUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [view, setView] = useState("urls");
  const [urlPage, setUrlPage] = useState(1);
  const [urlTotalPages, setUrlTotalPages] = useState(1);
  const [auditPage, setAuditPage] = useState(1);
  const [auditTotalPages, setAuditTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;

    const fetchStats = async () => {
      setLoading(true);
      try {
        const res = await apiFetch(`${API_URL}/api/admin/stats?urlPage=${urlPage}&urlLimit=20&auditPage=${auditPage}&auditLimit=10&search=${encodeURIComponent(debouncedSearch)}`, {}, user, login, logout);
        if (res.ok) {
          const data = await res.json();
          setStats({
            ...data.stats,
            auditLogs: data.auditLogs || []
          });
          setRecentUrls(data.recentUrls || []);
          setUrlTotalPages(data.urlPagination?.totalPages || 1);
          setAuditTotalPages(data.auditPagination?.totalPages || 1);
        } else {
          setError("Not authorized to view this page.");
        }
      } catch (err) {
        console.error("Admin stats fetch error:", err);
        setError("Error fetching admin stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user, navigate, login, logout, urlPage, auditPage, debouncedSearch]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
    e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <span className="material-symbols-outlined animate-spin text-4xl text-primary">sync</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-64px)]">
        <div className="bg-error-container text-on-error-container border border-error/20 px-6 py-4 rounded-xl flex items-center gap-3">
          <span className="material-symbols-outlined text-2xl">error</span>
          <p className="font-body-lg text-body-lg font-bold">{error}</p>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const filteredUrls = recentUrls;

  return (
    <>
      <main className="pt-24 pb-section-gap px-gutter max-w-container-max mx-auto relative overflow-hidden min-h-[calc(100vh-64px)]">
        {/* Atmospheric Glows */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-tertiary/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
        
        {/* Header */}
        <header className="mb-stack-md relative z-10">
          <h1 className="bg-clip-text text-transparent bg-accent-gradient font-display-lg text-display-lg md:text-display-lg mb-2">Admin Dashboard</h1>
          <p className="text-text-muted font-body-lg text-body-lg">Platform-wide link orchestration and user audit controls.</p>
        </header>
        
        {/* Metrics Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-stack-md mb-section-gap relative z-10">
          {/* Total Users */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-tertiary/30 transition-all duration-500" onMouseMove={handleMouseMove}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-text-muted font-label-sm text-label-sm uppercase tracking-widest">Total Users</span>
              <span className="material-symbols-outlined text-tertiary">group</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-4xl text-on-surface">{stats.totalUsers.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Total Links */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-tertiary/30 transition-all duration-500" onMouseMove={handleMouseMove}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-text-muted font-label-sm text-label-sm uppercase tracking-widest">Total Links</span>
              <span className="material-symbols-outlined text-tertiary">link</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-4xl text-on-surface">{stats.totalUrls.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Total Clicks */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-tertiary/30 transition-all duration-500" onMouseMove={handleMouseMove}>
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-red-500 to-orange-500"></div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <span className="text-text-muted font-label-sm text-label-sm uppercase tracking-widest">Total Clicks</span>
              <span className="material-symbols-outlined text-tertiary">ads_click</span>
            </div>
            <div className="flex items-baseline gap-2 relative z-10">
              <span className="font-display-lg text-4xl text-on-surface">{stats.totalClicks.toLocaleString()}</span>
            </div>
          </div>
        </section>
        
        {/* Main Content Area */}
        <section className="glass-card rounded-xl overflow-hidden border border-border-glass relative z-10">
          {/* Tabs */}
          <div className="flex border-b border-border-glass">
            <button 
              onClick={() => setView('urls')}
              className={`px-8 py-4 transition-colors ${view === 'urls' ? 'font-bold text-on-surface border-b-2 border-tertiary bg-surface-glass' : 'font-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-glass'}`}
            >
              Recent URLs
            </button>
            <button 
              onClick={() => setView('audit')}
              className={`px-8 py-4 transition-colors ${view === 'audit' ? 'font-bold text-on-surface border-b-2 border-tertiary bg-surface-glass' : 'font-body-md text-on-surface-variant hover:text-on-surface hover:bg-surface-glass'}`}
            >
              Audit Logs
            </button>
          </div>
          
          {/* Table Controls */}
          <div className="p-gutter flex flex-col md:flex-row justify-between items-center gap-4 border-b border-border-glass">
            <Input 
              icon="search"
              placeholder="Search by email or code..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              wrapperClassName="w-full md:w-96"
            />
            <div className="flex gap-2 w-full md:w-auto">
              <Button variant="outline" icon="filter_list" className="w-full md:w-auto">
                Filter
              </Button>
              <Button variant="outline" icon="download" className="w-full md:w-auto">
                Export
              </Button>
            </div>
          </div>
          
          {/* Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-highest/50">
                {view === 'urls' ? (
                  <tr>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Original URL</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Short Code</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Clicks</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider text-right">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Action</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">User Email</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 font-label-sm text-label-sm text-text-muted uppercase tracking-wider">Details</th>
                  </tr>
                )}
              </thead>
              <tbody className="divide-y divide-border-glass">
                {view === 'urls' ? (
                  filteredUrls.length > 0 ? (
                    filteredUrls.map(url => (
                      <tr key={url._id} className="hover:bg-surface-glass transition-colors group">
                        <td className="px-6 py-4 font-body-md text-on-surface">{url.user?.email || "Unknown"}</td>
                        <td className="px-6 py-4 font-body-md text-text-muted truncate max-w-xs" title={url.longUrl}>{url.longUrl}</td>
                        <td className="px-6 py-4 font-mono text-tertiary">{url.shortCode}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface">{url.clicks.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <button className="material-symbols-outlined text-text-muted hover:text-error transition-colors p-2 rounded-lg hover:bg-error-container/20">delete</button>
                          <button className="material-symbols-outlined text-text-muted hover:text-primary transition-colors p-2 rounded-lg hover:bg-primary-container/20">visibility</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">No URLs match your search.</td></tr>
                  )
                ) : (
                  stats.auditLogs && stats.auditLogs.length > 0 ? (
                    stats.auditLogs.map(log => (
                      <tr key={log._id} className="hover:bg-surface-glass transition-colors group">
                        <td className="px-6 py-4 text-sm text-text-muted whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                        <td className="px-6 py-4 font-body-md text-on-surface font-semibold">{log.action}</td>
                        <td className="px-6 py-4 font-body-md text-text-muted">{log.userEmail}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {log.status.toUpperCase()}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-body-md text-text-muted truncate max-w-[200px]" title={log.details}>{log.details || '-'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5" className="px-6 py-8 text-center text-text-muted">No audit logs found.</td></tr>
                  )
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {(view === 'audit' ? auditTotalPages : urlTotalPages) > 1 && (
            <div className="px-gutter py-6 flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-container-low/30 border-t border-border-glass">
              <span className="text-text-muted text-sm font-body-md">
                Page {view === 'audit' ? auditPage : urlPage} of {view === 'audit' ? auditTotalPages : urlTotalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost"
                  icon="chevron_left"
                  className="!p-2 h-10 w-10 flex items-center justify-center"
                  onClick={() => view === 'audit' ? setAuditPage(p => Math.max(1, p - 1)) : setUrlPage(p => Math.max(1, p - 1))}
                  disabled={(view === 'audit' ? auditPage : urlPage) === 1}
                />
                
                {/* Generate page numbers up to total pages, max 5 shown for simplicity */}
                {Array.from({ length: Math.min(5, view === 'audit' ? auditTotalPages : urlTotalPages) }).map((_, idx) => {
                  const pageNum = idx + 1;
                  const currentPage = view === 'audit' ? auditPage : urlPage;
                  return (
                    <button 
                      key={pageNum}
                      onClick={() => view === 'audit' ? setAuditPage(pageNum) : setUrlPage(pageNum)}
                      className={`w-10 h-10 rounded transition-all flex items-center justify-center font-body-md ${currentPage === pageNum ? 'bg-tertiary text-on-tertiary font-bold shadow-lg active:scale-90' : 'glass-card hover:bg-surface-glass'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                {(view === 'audit' ? auditTotalPages : urlTotalPages) > 5 && <span className="px-2 text-text-muted">...</span>}
                {(view === 'audit' ? auditTotalPages : urlTotalPages) > 5 && (
                  <button 
                    onClick={() => view === 'audit' ? setAuditPage(auditTotalPages) : setUrlPage(urlTotalPages)}
                    className={`w-10 h-10 rounded transition-all flex items-center justify-center font-body-md ${(view === 'audit' ? auditPage : urlPage) === (view === 'audit' ? auditTotalPages : urlTotalPages) ? 'bg-tertiary text-on-tertiary font-bold shadow-lg active:scale-90' : 'glass-card hover:bg-surface-glass'}`}
                  >
                    {view === 'audit' ? auditTotalPages : urlTotalPages}
                  </button>
                )}

                <Button 
                  variant="ghost"
                  icon="chevron_right"
                  className="!p-2 h-10 w-10 flex items-center justify-center"
                  onClick={() => view === 'audit' ? setAuditPage(p => Math.min(auditTotalPages, p + 1)) : setUrlPage(p => Math.min(urlTotalPages, p + 1))}
                  disabled={(view === 'audit' ? auditPage : urlPage) === (view === 'audit' ? auditTotalPages : urlTotalPages)}
                />
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Shared Footer */}
      <footer className="w-full py-8 border-t border-border-glass bg-surface-dim mt-section-gap relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-stack-md px-gutter max-w-container-max mx-auto">
          <div className="flex items-center gap-2">
            <span className="font-display-lg text-headline-md text-primary">ShortyURL</span>
          </div>
          <div className="flex gap-8">
            <a className="text-text-muted hover:text-on-surface transition-colors font-label-sm text-label-sm hover:underline" href="#">Terms</a>
            <a className="text-text-muted hover:text-on-surface transition-colors font-label-sm text-label-sm hover:underline" href="#">Privacy</a>
            <a className="text-text-muted hover:text-on-surface transition-colors font-label-sm text-label-sm hover:underline" href="#">Status</a>
            <a className="text-text-muted hover:text-on-surface transition-colors font-label-sm text-label-sm hover:underline" href="#">Support</a>
          </div>
          <div className="text-text-muted font-label-sm text-label-sm">
            © {new Date().getFullYear()} ShortyURL. All rights reserved.
          </div>
        </div>
      </footer>
    </>
  );
};

export default AdminDashboard;
