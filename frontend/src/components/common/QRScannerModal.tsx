import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, Upload, AlertCircle, RefreshCw } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (certificateId: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
  const [scanMode, setScanMode] = useState<'camera' | 'file'>('camera');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = 'qr-camera-viewport';

  // Helper to extract Certificate ID from URL or raw string
  const parseCertificateId = (decodedText: string): string => {
    // Check if it's a TerAuth URL: https://terauth.com/verify/TER-2026-XXXXXX
    const urlMatch = decodedText.match(/\/verify\/([A-Za-z0-9_-]+)/i);
    if (urlMatch && urlMatch[1]) {
      return urlMatch[1].trim();
    }
    // Check if it's already a TER-... or CERT-... code
    const codeMatch = decodedText.match(/(TER-[0-9]{4}-[A-Z0-9]+)/i);
    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim();
    }
    return decodedText.trim();
  };

  useEffect(() => {
    if (!isOpen || scanMode !== 'camera') {
      stopCamera();
      return;
    }

    let isMounted = true;
    setIsInitializing(true);
    setErrorMessage(null);

    const timer = setTimeout(async () => {
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode(containerId);
        }

        const config = {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        };

        await scannerRef.current.start(
          { facingMode: 'environment' },
          config,
          (decodedText) => {
            const certId = parseCertificateId(decodedText);
            stopCamera();
            onScanSuccess(certId);
            onClose();
          },
          () => {
            // Frame scan failure (expected between frames)
          }
        );

        if (isMounted) setIsInitializing(false);
      } catch (err: any) {
        if (isMounted) {
          setIsInitializing(false);
          setErrorMessage(
            err?.name === 'NotAllowedError'
              ? 'Camera permission denied. Please allow camera access in your browser or switch to image upload.'
              : 'Unable to access camera. Please make sure no other application is using it or upload a QR image.'
          );
        }
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
      stopCamera();
    };
  }, [isOpen, scanMode]);

  const stopCamera = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (e) {
        // Safe ignore
      }
      scannerRef.current = null;
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    try {
      const html5QrCode = new Html5Qrcode('qr-file-processor');
      const decodedText = await html5QrCode.scanFile(file, true);
      await html5QrCode.clear();
      const certId = parseCertificateId(decodedText);
      onScanSuccess(certId);
      onClose();
    } catch (err) {
      setErrorMessage('Could not detect a valid QR code in the uploaded image. Please try a clearer picture.');
    }
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50 flex-shrink-0">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-800 text-sm">Scan Certificate QR Code</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-1.5 gap-1.5 flex-shrink-0">
          <button
            onClick={() => setScanMode('camera')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              scanMode === 'camera'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Live Camera</span>
          </button>
          <button
            onClick={() => {
              stopCamera();
              setScanMode('file');
            }}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              scanMode === 'file'
                ? 'bg-white text-blue-600 shadow-sm border border-slate-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image</span>
          </button>
        </div>

        {/* Viewport */}
        <div className="p-4 sm:p-5 overflow-y-auto">
          {scanMode === 'camera' ? (
            <div className="relative rounded-xl overflow-hidden bg-slate-950 aspect-square max-h-[300px] sm:max-h-[340px] mx-auto flex flex-col items-center justify-center text-white">
              <div id={containerId} className="w-full h-full" />
              {isInitializing && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-white gap-2">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-400" />
                  <p className="text-xs text-slate-300">Activating camera scanner...</p>
                </div>
              )}
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
              <div id="qr-file-processor" className="hidden" />
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                id="qr-file-input"
                className="hidden"
              />
              <label
                htmlFor="qr-file-input"
                className="cursor-pointer flex flex-col items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-800">Select certificate QR screenshot</p>
                <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP formats supported</p>
                <span className="mt-4 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                  Browse Device
                </span>
              </label>
            </div>
          )}

          {errorMessage && (
            <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          <p className="text-[11px] text-center text-slate-400 mt-4">
            Point camera at the official TerAuth QR code printed on the physical credential.
          </p>
        </div>
      </div>
    </div>
  );
};
