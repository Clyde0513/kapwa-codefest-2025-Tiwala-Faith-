"use client";

import { useEffect, useState } from 'react';
import PhotoUpload from '../../../components/PhotoUpload';

interface Photo {
  id: string;
  publicId: string;
  url: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  caption?: string | null;
  moderationStatus?: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
  post?: { id: string; title?: string } | null;
  uploader?: { id: string; name?: string } | null;
}

export default function PhotosManager() {
  const [photos, setPhotos] = useState<Photo[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [captionDrafts, setCaptionDrafts] = useState<Record<string, string>>({});

  const fetchPhotos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/photos?moderationStatus=all');
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Failed fetching photos');
      setPhotos(json.photos || []);
    } catch (err: any) {
      console.error('fetchPhotos error', err);
      setError(err?.message || String(err));
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  const deletePhoto = async (id: string) => {
    if (!confirm('Delete this photo? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/photos/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Delete failed');
      // remove from state
      setPhotos((prev) => (prev ? prev.filter((p) => p.id !== id) : prev));
    } catch (err) {
      alert('Failed to delete photo');
      console.error(err);
    }
  };

  const updateModerationStatus = async (id: string, moderationStatus: 'pending' | 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ moderationStatus }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Moderation update failed');
      setPhotos((prev) => prev?.map((p) => (p.id === id ? json.photo : p)) ?? []);
    } catch (err) {
      alert('Failed to update photo moderation status');
      console.error(err);
    }
  };

  const statusClassName = (status?: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const startEdit = (id: string, caption: string | null) => {
    setEditingId(id);
    setCaptionDrafts((d) => ({ ...d, [id]: caption || '' }));
  };

  const cancelEdit = (id: string) => {
    setEditingId(null);
    setCaptionDrafts((d) => {
      const copy = { ...d };
      delete copy[id];
      return copy;
    });
  };

  const saveCaption = async (id: string) => {
    const caption = captionDrafts[id] ?? '';
    try {
      const res = await fetch(`/api/photos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Update failed');
      setPhotos((prev) => prev?.map((p) => (p.id === id ? json.photo : p)) ?? []);
      cancelEdit(id);
    } catch (err) {
      alert('Failed to update caption');
      console.error(err);
    }
  };

  if (loading && photos === null) return <div className="p-6">Loading photos...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">Photos</h2>
        <div className="text-sm text-gray-500">{photos?.length ?? 0} photos</div>
      </div>

      {/* Upload Section */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Upload New Photos</h3>
        <p className="text-sm text-gray-600 mb-4">
          Admin uploads are approved immediately. Community uploads appear here for review before they show publicly.
        </p>
        <PhotoUpload 
          moderationStatus="approved"
          onUploadComplete={() => fetchPhotos()} 
        />
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded">Error: {error}</div>
      )}

      {photos && photos.length === 0 && (
        <div className="p-4 text-gray-600">No photos found.</div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {photos?.map((photo) => (
          <div key={photo.id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="w-full h-48 bg-gray-100 relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt={photo.caption || 'photo'} className="object-cover w-full h-full" />
            </div>
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{photo.post?.title ?? 'Unattached'}</p>
                  <p className="text-sm text-gray-500">Uploaded by {photo.uploader?.name ?? 'Unknown'}</p>
                  <p className="text-sm text-gray-500">{photo.format} • {photo.width}x{photo.height}</p>
                  <span className={`mt-2 inline-block rounded-full px-2 py-1 text-xs font-semibold ${statusClassName(photo.moderationStatus)}`}>
                    {photo.moderationStatus || 'pending'}
                  </span>
                </div>
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {photo.moderationStatus !== 'approved' && (
                    <button
                      onClick={() => updateModerationStatus(photo.id, 'approved')}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      Approve
                    </button>
                  )}
                  {photo.moderationStatus !== 'rejected' && (
                    <button
                      onClick={() => updateModerationStatus(photo.id, 'rejected')}
                      className="text-sm text-orange-600 hover:text-orange-800"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    onClick={() => deletePhoto(photo.id)}
                    className="text-sm text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </div>
              </div>

              <div className="mt-3">
                {editingId === photo.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={captionDrafts[photo.id] ?? ''}
                      onChange={(e) => setCaptionDrafts((d) => ({ ...d, [photo.id]: e.target.value }))}
                      className="w-full border rounded p-2 text-sm"
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => cancelEdit(photo.id)} className="px-3 py-1 rounded border text-sm">Cancel</button>
                      <button onClick={() => saveCaption(photo.id)} className="px-3 py-1 rounded bg-blue-600 text-white text-sm">Save</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-700">{photo.caption ?? <span className="text-gray-400">No caption</span>}</p>
                    <button onClick={() => startEdit(photo.id, photo.caption ?? '')} className="text-sm text-blue-600 hover:underline">Edit</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
