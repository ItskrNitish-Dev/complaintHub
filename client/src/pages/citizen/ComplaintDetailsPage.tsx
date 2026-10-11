import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ThumbsUp,
  Bookmark,
  MapPin,
  Calendar,
  User,
  Building,
  Send,
  Trash2,
  Clock,
  ArrowLeft,
  X,
  Pencil,
  Paperclip,
  FileImage,
  Check,
} from 'lucide-react';
import { complaintsApi } from '../../api/complaints.api';
import { useAuth } from '../../features/auth/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Complaint, Comment, StatusHistory, Attachment } from '../../types';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Alert } from '../../components/ui/Alert';

// ─── Edit Modal ────────────────────────────────────────────────────────────────
interface EditModalProps {
  complaint: Complaint;
  onClose: () => void;
  onSaved: (updated: Complaint) => void;
}

const EditModal: React.FC<EditModalProps> = ({ complaint, onClose, onSaved }) => {
  const toast = useToast();
  const [title, setTitle] = useState(complaint.title);
  const [description, setDescription] = useState(complaint.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { toast.error('Title is required'); return; }
    try {
      setIsSaving(true);
      const res = await complaintsApi.updateComplaint(complaint._id, { title: title.trim(), description: description.trim() });
      if (res.success && res.data) {
        toast.success('Complaint updated successfully');
        onSaved(res.data);
        onClose();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update complaint');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Edit Complaint">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Pencil className="w-4 h-4 text-blue-600" /> Edit Complaint
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="edit-title" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Title *</label>
            <input
              id="edit-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="edit-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">Description</label>
            <textarea
              id="edit-desc"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none"
            />
          </div>
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isSaving} leftIcon={<Check className="w-3.5 h-3.5" />}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Attachment Upload Modal ────────────────────────────────────────────────────
interface AttachModalProps {
  complaintId: string;
  onClose: () => void;
  onUploaded: () => void;
}

const AttachModal: React.FC<AttachModalProps> = ({ complaintId, onClose, onUploaded }) => {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async () => {
    if (files.length === 0) { toast.error('Please select at least one file'); return; }
    const formData = new FormData();
    files.forEach((f) => formData.append('attachments', f));
    try {
      setIsUploading(true);
      await complaintsApi.uploadAttachments(complaintId, formData);
      toast.success(`${files.length} attachment(s) uploaded successfully`);
      onUploaded();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Add Attachments">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Paperclip className="w-4 h-4 text-blue-600" /> Add Attachments
          </h2>
          <button type="button" onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full py-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex flex-col items-center gap-2 hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
          >
            <FileImage className="w-8 h-8 text-slate-400" />
            <span className="text-xs font-medium text-slate-500">Click to select files (up to 5)</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,application/pdf"
            className="hidden"
            onChange={(e) => {
              const selected = Array.from(e.target.files || []).slice(0, 5);
              setFiles(selected);
            }}
          />
          {files.length > 0 && (
            <ul className="space-y-1">
              {files.map((f, i) => (
                <li key={i} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
                  <FileImage className="w-3.5 h-3.5 text-blue-500" /> {f.name}
                </li>
              ))}
            </ul>
          )}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>Cancel</Button>
            <Button type="button" variant="primary" size="sm" isLoading={isUploading} leftIcon={<Paperclip className="w-3.5 h-3.5" />} onClick={handleUpload}>
              Upload
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [statusHistory, setStatusHistory] = useState<StatusHistory[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // UI modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isDeletingComplaint, setIsDeletingComplaint] = useState(false);

  const fetchComplaintDetails = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [res, attachRes] = await Promise.all([
        complaintsApi.getComplaintById(id),
        complaintsApi.getAttachments(id),
      ]);
      if (res.success && res.data) {
        setComplaint(res.data);
        setStatusHistory((res.data as any).statusHistory || []);
        setComments((res.data as any).comments || []);
      }
      if (attachRes.success && attachRes.data) {
        setAttachments(attachRes.data);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Complaint not found.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaintDetails();
  }, [id]);

  // Handle Upvote
  const handleVoteToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!complaint) return;
    try {
      if (complaint.isUpvoted) {
        const res = await complaintsApi.unvote(complaint._id);
        if (res.success) setComplaint({ ...complaint, isUpvoted: false, upvoteCount: res.data.upvoteCount });
      } else {
        const res = await complaintsApi.vote(complaint._id);
        if (res.success) setComplaint({ ...complaint, isUpvoted: true, upvoteCount: res.data.upvoteCount });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Vote action failed');
    }
  };

  // Handle Follow
  const handleFollowToggle = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    if (!complaint) return;
    try {
      if (complaint.isFollowed) {
        const res = await complaintsApi.unfollow(complaint._id);
        if (res.success) setComplaint({ ...complaint, isFollowed: false, followerCount: res.data.followerCount });
      } else {
        const res = await complaintsApi.follow(complaint._id);
        if (res.success) setComplaint({ ...complaint, isFollowed: true, followerCount: res.data.followerCount });
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Follow action failed');
    }
  };

  // Add Comment
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !complaint) return;
    try {
      setIsSubmittingComment(true);
      const res = await complaintsApi.addComment(complaint._id, newComment.trim());
      if (res.success && res.data.comment) {
        setComments((prev) => [...prev, res.data.comment]);
        setNewComment('');
        setComplaint({ ...complaint, commentCount: complaint.commentCount + 1 });
        toast.success('Comment posted');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Comment
  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await complaintsApi.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      if (complaint) setComplaint({ ...complaint, commentCount: Math.max(0, complaint.commentCount - 1) });
      toast.success('Comment deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete comment');
    }
  };

  // Cancel Complaint
  const handleCancelComplaint = async () => {
    if (!complaint) return;
    if (!window.confirm('Are you sure you want to cancel this complaint?')) return;
    try {
      const res = await complaintsApi.updateStatus(complaint._id, { status: 'CANCELLED', note: 'Cancelled by reporting citizen.' });
      if (res.success && res.data) {
        toast.success('Complaint cancelled successfully.');
        fetchComplaintDetails();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel complaint');
    }
  };

  // Delete Complaint
  const handleDeleteComplaint = async () => {
    if (!complaint) return;
    if (!window.confirm(`Permanently delete complaint ${complaint.complaintNumber}? This cannot be undone.`)) return;
    try {
      setIsDeletingComplaint(true);
      await complaintsApi.deleteComplaint(complaint._id);
      toast.success('Complaint deleted successfully');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete complaint');
      setIsDeletingComplaint(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-medium">Loading complaint details...</p>
      </div>
    );
  }

  if (errorMsg || !complaint) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <Alert type="error">{errorMsg || 'Complaint not found.'}</Alert>
        <Link to="/complaints" className="inline-block text-xs font-semibold text-blue-600">← Return to Complaints List</Link>
      </div>
    );
  }

  const isOwner = user && complaint.createdBy && (user.id === complaint.createdBy._id || user._id === complaint.createdBy._id);
  const isAdmin = role === 'ADMIN';
  const isOwnerOrAdmin = isOwner || isAdmin;
  const canEdit = isOwnerOrAdmin && complaint.status === 'SUBMITTED';
  const canDelete = isOwnerOrAdmin && complaint.status === 'SUBMITTED';
  const canCancel = isOwner && complaint.status === 'SUBMITTED';
  const canAddAttachments = isAuthenticated && isOwnerOrAdmin;

  const canDeleteComment = (cm: Comment) =>
    user && (user.id === cm.user?._id || user._id === cm.user?._id || isAdmin);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Back Button */}
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-100"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to list
      </button>

      {/* Main Header Container */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-extrabold px-3 py-1 rounded-lg bg-slate-900 text-white dark:bg-slate-800">
              {complaint.complaintNumber}
            </span>
            <Badge status={complaint.status} size="md" />
            <Badge priority={complaint.priority} size="md" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Upvote Button */}
            <Button type="button" variant={complaint.isUpvoted ? 'primary' : 'outline'} size="sm" onClick={handleVoteToggle} leftIcon={<ThumbsUp className="w-4 h-4" />}>
              {complaint.isUpvoted ? 'Upvoted' : 'Upvote'} ({complaint.upvoteCount})
            </Button>

            {/* Follow Button */}
            <Button type="button" variant={complaint.isFollowed ? 'secondary' : 'outline'} size="sm" onClick={handleFollowToggle} leftIcon={<Bookmark className="w-4 h-4" />}>
              {complaint.isFollowed ? 'Following' : 'Follow'} ({complaint.followerCount})
            </Button>

            {/* Add Attachments */}
            {canAddAttachments && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowAttachModal(true)} leftIcon={<Paperclip className="w-4 h-4" />}>
                Add Files
              </Button>
            )}

            {/* Edit Button */}
            {canEdit && (
              <Button type="button" variant="outline" size="sm" onClick={() => setShowEditModal(true)} leftIcon={<Pencil className="w-3.5 h-3.5" />}>
                Edit
              </Button>
            )}

            {/* Delete Button */}
            {canDelete && (
              <Button type="button" variant="danger" size="sm" isLoading={isDeletingComplaint} leftIcon={<Trash2 className="w-3.5 h-3.5" />} onClick={handleDeleteComplaint}>
                Delete
              </Button>
            )}

            {/* Cancel Button (citizen) */}
            {canCancel && !canDelete && (
              <Button type="button" variant="danger" size="sm" onClick={handleCancelComplaint}>
                Cancel Report
              </Button>
            )}
          </div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {complaint.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-400" />
            Reported by <span className="font-semibold text-slate-700 dark:text-slate-200">{complaint.createdBy?.name || 'Citizen'}</span>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(complaint.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {complaint.category?.name} • {complaint.department?.name}
          </span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 Cols */}
        <div className="lg:col-span-2 space-y-8">
          {/* Description */}
          <Card>
            <CardHeader><CardTitle>Issue Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {complaint.description}
              </p>
            </CardContent>
          </Card>

          {/* Photo Gallery */}
          {complaint.images && complaint.images.length > 0 && (
            <Card>
              <CardHeader><CardTitle>Photographic Evidence ({complaint.images.length})</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((imgUrl, i) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(imgUrl)}
                      className="aspect-video bg-slate-100 dark:bg-slate-800 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition-opacity border border-slate-200 dark:border-slate-800"
                    >
                      <img src={imgUrl} alt={`Evidence ${i + 1}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Attachments Section (PRD Section 27) */}
          {attachments && attachments.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-blue-600" /> Supporting Attachments ({attachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {attachments.map((att) => {
                    const isImg = att.fileType?.startsWith('image/') || att.url?.match(/\.(jpeg|jpg|png|webp|gif)$/i);
                    return (
                      <div
                        key={att._id}
                        className="p-3 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/50 dark:bg-slate-800/40"
                      >
                        <div className="flex items-center gap-2.5 overflow-hidden">
                          <FileImage className="w-4 h-4 text-blue-500 shrink-0" />
                          <div className="truncate">
                            <a
                              href={att.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-semibold text-slate-900 dark:text-white hover:text-blue-600 truncate block"
                            >
                              {att.originalName || 'Attachment'}
                            </a>
                            <span className="text-[10px] text-slate-400">
                              {att.size ? `${Math.round(att.size / 1024)} KB` : 'File'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isImg && (
                            <button
                              type="button"
                              onClick={() => setSelectedImage(att.url)}
                              className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 px-2 py-1 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40"
                            >
                              Preview
                            </button>
                          )}
                          {canAddAttachments && (
                            <button
                              type="button"
                              aria-label="Delete attachment"
                              onClick={async () => {
                                if (!window.confirm('Delete this attachment?')) return;
                                try {
                                  await complaintsApi.deleteAttachment(att._id);
                                  toast.success('Attachment deleted');
                                  setAttachments((prev) => prev.filter((a) => a._id !== att._id));
                                } catch (err: any) {
                                  toast.error(err.response?.data?.message || 'Failed to delete attachment');
                                }
                              }}
                              className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" /> Location Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Address</p>
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                    {complaint.location?.address || 'Street address not specified'}
                  </p>
                </div>
                {complaint.location?.coordinates && (
                  <a
                    href={`https://www.google.com/maps?q=${complaint.location.coordinates[1]},${complaint.location.coordinates[0]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                  >
                    View on Maps ↗
                  </a>
                )}
              </div>
              {complaint.location?.landmark && (
                <div>
                  <p className="text-slate-400 font-semibold uppercase text-[10px]">Nearby Landmark</p>
                  <p className="text-slate-700 dark:text-slate-300 mt-0.5">{complaint.location.landmark}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader><CardTitle>Comments & Discussion ({comments.length})</CardTitle></CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 divide-y divide-slate-100 dark:divide-slate-800/80">
                {comments.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4">No comments posted yet. Be the first to share an update.</p>
                ) : (
                  comments.map((cm) => (
                    <div key={cm._id} className="pt-4 first:pt-0 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">{cm.user?.name}</span>
                          <Badge role={cm.user?.role || 'CITIZEN'} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400">
                            {new Date(cm.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                          </span>
                          {canDeleteComment(cm) && (
                            <button
                              type="button"
                              aria-label="Delete comment"
                              onClick={() => handleDeleteComment(cm._id)}
                              className="p-1 rounded-md text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{cm.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Post Comment */}
              {isAuthenticated ? (
                <form onSubmit={handleCommentSubmit} className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
                  <textarea
                    rows={3}
                    placeholder="Write a public remark, update, or verification..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                  <div className="flex justify-end">
                    <Button type="submit" variant="primary" size="sm" isLoading={isSubmittingComment} leftIcon={<Send className="w-3.5 h-3.5" />}>
                      Post Comment
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center text-xs text-slate-500">
                  <Link to="/login" className="font-semibold text-blue-600 hover:underline">Sign in</Link>{' '}to participate in the discussion.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Col */}
        <div className="space-y-6">
          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" /> Status Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {statusHistory.map((item, idx) => (
                  <div key={item._id || idx} className="relative text-xs space-y-1">
                    <div className="absolute -left-6 top-0.5 w-4 h-4 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900 shrink-0" />
                    <div className="flex items-center justify-between">
                      <Badge status={item.status} size="sm" />
                      <span className="text-[10px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">Changed by {item.changedBy?.name || 'System'}</p>
                    {item.note && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-1">{item.note}</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Assigned Officer */}
          <Card>
            <CardHeader><CardTitle className="text-sm">Assigned Division</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">{complaint.department?.name || 'Under Review'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-semibold block uppercase text-[10px]">Assigned Officer</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                  {complaint.assignedOfficer ? complaint.assignedOfficer.name : 'Awaiting Assignment'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      {showEditModal && (
        <EditModal
          complaint={complaint}
          onClose={() => setShowEditModal(false)}
          onSaved={(updated) => setComplaint(updated)}
        />
      )}

      {showAttachModal && (
        <AttachModal
          complaintId={complaint._id}
          onClose={() => setShowAttachModal(false)}
          onUploaded={fetchComplaintDetails}
        />
      )}

      {/* Fullscreen Image Preview */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              type="button"
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:text-slate-300"
              aria-label="Close image"
            >
              <X className="w-6 h-6" />
            </button>
            <img src={selectedImage} alt="Fullscreen preview" className="max-w-full max-h-[85vh] object-contain rounded-xl" />
          </div>
        </div>
      )}
    </div>
  );
};
