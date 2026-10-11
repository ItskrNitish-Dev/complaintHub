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
  ShieldAlert,
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      <div>
        <BackButton fallbackUrl="/" />
      </div>

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Explore Civic Complaints
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Browse, filter, and track public community issues submitted by fellow residents
          </p>
        </div>

        <Link
          to="/complaints/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-xs"
        >
          + Report an Issue
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by keywords, address, or complaint ID (e.g. CH-2026-000001)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          <Button type="submit" variant="primary">
            Search
          </Button>

          {/* Nearby Toggle Button */}
          <Button
            type="button"
            variant={isNearbyMode ? 'primary' : 'outline'}
            onClick={handleToggleNearby}
            leftIcon={<Navigation className="w-4 h-4" />}
          >
            {isNearbyMode ? 'Nearby Active' : 'Nearby (GPS)'}
          </Button>
        </form>

        {geoError && (
          <p className="text-xs text-rose-500 font-medium">{geoError}</p>
        )}

        {/* Dropdown Filters */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-medium">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="">All Categories</option>
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
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
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
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ml-auto"
            aria-label="Sort complaints"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-upvoteCount">Most Upvoted</option>
            <option value="-priority">Highest Priority</option>
          </select>

          {(selectedCategory || selectedStatus || selectedPriority || searchTerm || isNearbyMode) && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-rose-600 hover:text-rose-700 flex items-center gap-1 font-semibold"
            >
              <X className="w-3.5 h-3.5" /> Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <p>
          Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{complaints.length}</span> of{' '}
          <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> reports
          {isNearbyMode && ' (within 10km of your location)'}
        </p>
      </div>

      {/* Complaints Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 animate-pulse space-y-4"
            >
              <div className="h-40 bg-slate-100 dark:bg-slate-800 rounded-xl" />
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-3/4" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No complaints found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            Try adjusting your search query, clearing filters, or switching off nearby location mode.
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
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="h-44 bg-slate-100 dark:bg-slate-800 relative overflow-hidden">
                  {c.images && c.images.length > 0 ? (
                    <img
                      src={c.images[0]}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <ShieldAlert className="w-10 h-10 opacity-30" />
                    </div>
                  )}

                  <div className="absolute top-2.5 left-2.5">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900/80 text-white backdrop-blur-xs">
                      {c.complaintNumber}
                    </span>
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <Badge status={c.status} size="sm" />
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-medium text-blue-600 dark:text-blue-400">
                      {c.category?.name || 'Civic'}
                    </span>
                    <Badge priority={c.priority} size="sm" />
                  </div>

                  <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {c.title}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {c.description}
                  </p>
                </div>
              </div>

              <div className="px-5 py-3.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] truncate max-w-[150px]">
                  <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  {c.location?.address || 'City Area'}
                </span>

                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 font-medium">
                    <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                    {c.upvoteCount}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
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

          <span className="text-xs font-medium text-slate-600 dark:text-slate-400 px-3">
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
