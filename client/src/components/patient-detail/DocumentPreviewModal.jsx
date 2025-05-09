import { X, Download, ZoomIn, ZoomOut } from 'lucide-react';
import Button from '../ui/button';
import { useState, useEffect } from 'react';
import DocumentService from '../../services/DocumentService';

export default function DocumentPreviewModal({ isOpen, onClose, document }) {
  const [scale, setScale] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isPdf, setIsPdf] = useState(false);

  useEffect(() => {
    const loadPreviewUrl = async () => {
      if (!document) return;
      
      try {
        setLoading(true);
        const extension = document.documentUrl.split('.').pop().toLowerCase();
        setIsPdf(extension === 'pdf');
        
        if (extension === 'pdf') {
          // For PDFs, use direct URL with attachment flag disabled
          const pdfUrl = document.documentUrl.replace('/upload/', '/upload/fl_attachment:false/');
          setPreviewUrl(pdfUrl);
        } else {
          // For other files, get preview URL from server
          const url = await DocumentService.getDocumentPreviewUrl(document._id);
          setPreviewUrl(url);
        }
        setError(null);
      } catch (err) {
        console.error('Error loading preview URL:', err);
        setError('Failed to load document preview');
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      loadPreviewUrl();
      // Reset zoom and position when opening new document
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [document, isOpen]);

  if (!isOpen || !document) return null;

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e) => {
    if (e.button === 0) { // Left click only
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderContent = () => {
    if (loading) {
      return <div className="flex items-center justify-center h-full">Loading...</div>;
    }

    if (error) {
      return <div className="flex items-center justify-center h-full text-red-500">{error}</div>;
    }

    if (!previewUrl) {
      return <div className="flex items-center justify-center h-full">Preview not available</div>;
    }

    if (isPdf) {
      return (
        <div className="w-full h-full">
          <iframe
            src={previewUrl}
            className="w-full h-full border-none"
            title={document.documentName}
            type="application/pdf"
          />
        </div>
      );
    }

    return (
      <div className="relative w-full h-[calc(100vh-200px)] flex items-center justify-center bg-gray-50">
        <div 
          className="overflow-auto w-full h-full flex items-center justify-center"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        >
          <img
            src={previewUrl}
            alt={document.documentName}
            className="max-w-none select-none"
            style={{ 
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: isDragging ? 'none' : 'transform 0.2s ease-in-out'
            }}
            draggable="false"
          />
        </div>
        <div className="absolute bottom-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomOut}
            className="bg-white shadow-md hover:bg-gray-50"
            disabled={scale <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResetZoom}
            className="bg-white shadow-md hover:bg-gray-50"
          >
            {Math.round(scale * 100)}%
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleZoomIn}
            className="bg-white shadow-md hover:bg-gray-50"
            disabled={scale >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-xl font-semibold">{document.documentName}</h2>
            <p className="text-sm text-gray-500 mt-1">
              {document.documentType} • {new Date(document.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.open(previewUrl, '_blank')}
              className="bg-white shadow-md hover:bg-gray-50"
            >
              Open in New Tab
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}