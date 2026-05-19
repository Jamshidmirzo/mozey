'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { useDropzone } from 'react-dropzone';
import { toast } from 'sonner';
import { ImagePlus, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE } from '@/lib/constants';
import {
  useUploadMuseumPhoto,
  useUploadHistoricalPlacePhoto,
  useDeletePhoto,
  useReorderPhotos,
} from '@/lib/hooks/use-upload';
import type { MuseumPhoto, HistoricalPlacePhoto } from '@/lib/types';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';

interface PhotoUploadProps {
  entityType: 'museum' | 'historical-place';
  entityId: string;
  photos: (MuseumPhoto | HistoricalPlacePhoto)[];
}

export function PhotoUpload({ entityType, entityId, photos }: PhotoUploadProps) {
  const t = useTranslations();
  const [deleteTarget, setDeleteTarget] = React.useState<string | null>(null);
  const [draggedIdx, setDraggedIdx] = React.useState<number | null>(null);
  const [localPhotos, setLocalPhotos] = React.useState(photos);

  React.useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  const uploadMuseum = useUploadMuseumPhoto(entityId);
  const uploadPlace = useUploadHistoricalPlacePhoto(entityId);
  const deletePhotoMutation = useDeletePhoto();
  const reorderMutation = useReorderPhotos(entityType, entityId);

  const upload = entityType === 'museum' ? uploadMuseum : uploadPlace;
  const isUploading = upload.isPending;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true,
    onDrop: async (acceptedFiles) => {
      for (const file of acceptedFiles) {
        try {
          await upload.mutateAsync(file);
          toast.success(
            entityType === 'museum'
              ? t('museums.photoUploaded')
              : t('museums.photoUploaded')
          );
        } catch {
          toast.error(t('common.error'));
        }
      }
    },
    onDropRejected: (rejections) => {
      rejections.forEach((rejection) => {
        const errors = rejection.errors.map((e) => e.message).join(', ');
        toast.error(`${rejection.file.name}: ${errors}`);
      });
    },
  });

  function handleDeleteConfirm() {
    if (!deleteTarget) return;
    deletePhotoMutation.mutate(deleteTarget, {
      onSuccess: () => {
        toast.success(t('museums.photoDeleted'));
        setDeleteTarget(null);
      },
      onError: () => {
        toast.error(t('common.error'));
      },
    });
  }

  function handleDragStart(idx: number) {
    setDraggedIdx(idx);
  }

  function handleDragOver(e: React.DragEvent, idx: number) {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;

    const newPhotos = [...localPhotos];
    const [removed] = newPhotos.splice(draggedIdx, 1);
    newPhotos.splice(idx, 0, removed);
    setLocalPhotos(newPhotos);
    setDraggedIdx(idx);
  }

  function handleDragEnd() {
    if (draggedIdx !== null) {
      const photoIds = localPhotos.map((p) => p.id);
      reorderMutation.mutate(photoIds, {
        onSuccess: () => {
          toast.success(t('museums.photoReordered'));
        },
        onError: () => {
          toast.error(t('common.error'));
          setLocalPhotos(photos);
        },
      });
    }
    setDraggedIdx(null);
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">{t('museums.photos')}</h3>

      {/* Photo grid */}
      {localPhotos.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {localPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group relative aspect-square overflow-hidden rounded-lg border bg-muted',
                draggedIdx === idx && 'opacity-50'
              )}
            >
              <img
                src={photo.url}
                alt={`Photo ${idx + 1}`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-start justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/30 group-hover:opacity-100">
                <div className="cursor-grab rounded bg-white/80 p-1">
                  <GripVertical className="h-4 w-4 text-gray-600" />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setDeleteTarget(photo.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white">
                {idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {localPhotos.length === 0 && (
        <p className="text-sm text-muted-foreground">{t('museums.noPhotos')}</p>
      )}

      {/* Upload dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/25 hover:border-primary/50',
          isUploading && 'pointer-events-none opacity-60'
        )}
      >
        <input {...getInputProps()} />
        {isUploading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        ) : (
          <ImagePlus className="h-8 w-8 text-muted-foreground" />
        )}
        <p className="text-sm text-muted-foreground">{t('common.dragDrop')}</p>
        <p className="text-xs text-muted-foreground">
          {t('common.supportedFormats')} &middot; {t('common.maxFileSize')}
        </p>
      </div>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('common.delete')}
        description={t('museums.deleteConfirm')}
        onConfirm={handleDeleteConfirm}
        loading={deletePhotoMutation.isPending}
      />
    </div>
  );
}
