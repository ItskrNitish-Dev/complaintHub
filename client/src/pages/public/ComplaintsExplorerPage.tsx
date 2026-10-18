import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  MapPin,
  ThumbsUp,
  MessageSquare,
  Navigation,
  SlidersHorizontal,
  X,
  Landmark,
  PlusCircle,
  FileText,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { categoriesApi } from '../../api/categories.api';
import { Complaint, Category } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { BackButton } from '../../components/ui/BackButton';

export const ComplaintsExplorerPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  // Filters state initialized from URL query params
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedStatus, setSelectedStatus] = useState(searchParams.get('status') || '');
  const [selectedPriority, setSelectedPriority] = useState(searchParams.get('priority') || '');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || '-createdAt');
  const [currentPage, setCurrentPage] = useState(parseInt(searchParams.get('page') || '1', 10));

  // Geolocation nearby mode
  const [isNearbyMode, setIsNearbyMode] = useState(false);
  const [geoCoords, setGeoCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    categoriesApi.getCategories({ activeOnly: true }).then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  // Fetch complaints whenever filters or page change
  const fetchComplaints = async () => {
    try {
      setIsLoading(true);

      if (isNearbyMode && geoCoords) {
        const res = await complaintsApi.getNearbyComplaints({
          lat: geoCoords.lat,
          lng: geoCoords.lng,
          radius: 10000, // 10km
        });
        if (res.success && res.data) {
          setComplaints(res.data);
          setTotal(res.data.length);
          setPages(1);
        }
      } else {
        const params: any = {
          page: currentPage,
          limit: 12,
          sort: selectedSort,
        };
        if (searchTerm) params.search = searchTerm;
        if (selectedCategory) params.category = selectedCategory;
        if (selectedStatus) params.status = selectedStatus;
        if (selectedPriority) params.priority = selectedPriority;

        const res = await complaintsApi.getComplaints(params);
        if (res.success && res.data) {
          setComplaints(res.data);
          if (res.meta) {
            setTotal(res.meta.total);
            setPages(res.meta.pages);
          }
        }
      }
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [currentPage, selectedCategory, selectedStatus, selectedPriority, selectedSort, isNearbyMode, geoCoords]);

  // Handle Search submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchComplaints();
  };

  // Toggle Nearby search with GPS
  const handleToggleNearby = () => {
    if (!isNearbyMode) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setGeoCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setIsNearbyMode(true);
            setGeoError(null);
          },
          (err) => { setGeoError('Unable to retrieve location: ' + err.message); }
        );
      } else {
        setGeoError('Geolocation is not supported by your browser.');
      }
    } else {
      setIsNearbyMode(false);
      setGeoCoords(null);
    }
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSelectedPriority('');
    setSelectedSort('-createdAt');
    setIsNearbyMode(false);
    setGeoCoords(null);
    setCurrentPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 text-left">
      <div>
        <BackButton fallbackUrl="/" />
      </div>

      {/* Official Government Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#0F2537] text-[#C59B27] text-[10px] font-bold uppercase tracking-wider mb-2">
            <Landmark className="w-3 h-3" />
            Public Redressal Registry
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0F2537] dark:text-white">
            Civic Grievances & Redressal Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Search, inspect, and track resolution timelines of community complaints across all municipal wards.
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#1B365D] hover:bg-[#0F2537] text-white text-xs font-bold uppercase tracking-wider shadow-xs transition-colors border border-blue-900 self-start md:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-[#C59B27]" />
          Lodge Grievance
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-[#131E2D] p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, street address, or complaint ID (e.g. CMP-...)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/50 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1B365D]/20 focus:border-[#1B365D]"
            />
          </div>

          <Button type="submit" variant="primary" size="sm">
            Search
          </Button>

          {/* Nearby Toggle Button */}
          <Button
            type="button"
            variant={isNearbyMode ? 'primary' : 'outline'}
            size="sm"
            onClick={handleToggleNearby}
            leftIcon={<Navigation className="w-3.5 h-3.5" />}
          >
            {isNearbyMode ? 'Nearby (10km Active)' : 'Find Nearby (GPS)'}
          </Button>
        </form>

        {geoError && (
          <p className="text-xs text-[#DC2626] font-medium">{geoError}</p>
        )}

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
            <SlidersHorizontal className="w-3 h-3 text-[#C59B27]" />
            <span>Filter By:</span>
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Municipal Categories</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Selector */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Selector */}
          <select
            value={selectedPriority}
            onChange={(e) => {
              setSelectedPriority(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-[#1B365D]"
          >
            <option value="">All Priorities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Sort Selector */}
          <select
            value={selectedSort}
            onChange={(e) => {
              setSelectedSort(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#131E2D] text-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-[#1B365D] sm:ml-auto"
            aria-label="Sort complaints"
          >
            <option value="-createdAt">Date: Newest First</option>
            <option value="createdAt">Date: Oldest First</option>
            <option value="-upvoteCount">Citizen Support: Most Upvoted</option>
            <option value="-priority">Severity: Highest Priority</option>
          </select>

          {(selectedCategory || selectedStatus || selectedPriority || searchTerm || isNearbyMode) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-[#DC2626] hover:underline flex items-center gap-1 font-semibold cursor-pointer ml-1"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
        <p>
          Displaying <span className="font-bold text-[#0F2537] dark:text-slate-200">{complaints.length}</span> of{' '}
          <span className="font-bold text-[#0F2537] dark:text-slate-200">{total}</span> registered records
          {isNearbyMode && ' (within 10km GPS radius)'}
        </p>
      </div>

      {/* Complaints Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-[#131E2D] rounded-xl p-5 border border-slate-200 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-lg" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
          <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-[#1B365D]">
            <Landmark className="w-6 h-6 opacity-60" />
          </div>
          <h3 className="text-base font-bold text-[#0F2537] dark:text-white">
            No matching grievance records found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Please adjust your search criteria, clear category filters, or verify the complaint token.
          </p>
          <Button variant="outline" size="sm" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <Link
              key={c._id}
              to={`/complaints/${c._id}`}
              className="bg-white dark:bg-[#131E2D] rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {c.images && c.images.length > 0 ? (
                    <img
                      src={c.images[0]}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1">
                      <Landmark className="w-8 h-8 opacity-30 text-[#1B365D]" />
                      <span className="text-[10px] font-medium uppercase tracking-wider">Official Record</span>
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[#0F2537]/90 text-white border border-[#C59B27]/40">
                      {c.complaintNumber}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <Badge status={c.status} size="sm" />
                  </div>
                </div>

                <div className="p-4 space-y-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span className="font-bold text-[#1B365D] dark:text-blue-400 text-[11px] uppercase tracking-wide">
                      {c.category?.name || 'Civic Infrastructure'}
                    </span>
                    <Badge priority={c.priority} size="sm" />
                  </div>

                  <h3 className="font-bold text-sm text-[#0F2537] dark:text-white line-clamp-2 group-hover:text-[#1B365D] dark:group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="px-4 py-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] truncate max-w-[150px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {c.location?.address || 'Municipal Ward'}
                </span>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-semibold text-[#1B365D] dark:text-blue-400 text-xs">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    {c.upvoteCount}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                    <MessageSquare className="w-3.5 h-3.5" />
                    {c.commentCount}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pages > 1 && !isNearbyMode && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>

          <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 px-3">
            Page {currentPage} of {pages}
          </span>

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= pages}
            onClick={() => setCurrentPage((p) => Math.min(pages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};
