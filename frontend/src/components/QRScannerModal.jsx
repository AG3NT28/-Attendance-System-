import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle } from 'lucide-react';

export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [errorMsg, setErrorMsg] = useState('');
  const [isStarting, setIsStarting] = useState(true);
  const scannerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    setErrorMsg('');
    setIsStarting(true);
    const html5QrCode = new Html5Qrcode('qr-reader-container');
    scannerRef.current = html5QrCode;

    const qrConfig = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        qrConfig,
        (decodedText) => {
          // Success callback
          try {
            // Extract token from URL or text
            let token = decodedText;
            if (decodedText.includes('token=')) {
              const url = new URL(decodedText);
              token = url.searchParams.get('token') || decodedText;
            }
            if (scannerRef.current && scannerRef.current.isScanning) {
              scannerRef.current.stop().then(() => {
                onScanSuccess(token);
                onClose();
              }).catch(() => {
                onScanSuccess(token);
                onClose();
              });
            } else {
              onScanSuccess(token);
              onClose();
            }
          } catch {
            onScanSuccess(decodedText);
            onClose();
          }
        },
        () => {
          // Frame error (ignore scanning frames)
        }
      )
      .then(() => {
        setIsStarting(false);
      })
      .catch((err) => {
        setIsStarting(false);
        setErrorMsg('Camera access denied or unavailable: ' + (err.message || err));
      });

    return () => {
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
        try {
          scannerRef.current.clear();
        } catch {}
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-brand-50 p-2 text-brand-600">
              <Camera className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-800">Scan Classroom QR</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {errorMsg ? (
          <div className="my-4 rounded-xl border border-red-200 bg-red-50 p-4 text-center">
            <AlertCircle className="mx-auto mb-2 h-8 w-8 text-red-500" />
            <p className="text-sm font-medium text-red-700">{errorMsg}</p>
            <p className="mt-2 text-xs text-red-600">
              You can also use your phone's default camera app to scan the QR code.
            </p>
          </div>
        ) : (
          <div>
            <div
              id="qr-reader-container"
              className="overflow-hidden rounded-xl border-2 border-dashed border-brand-200 bg-slate-900"
              style={{ minHeight: '300px' }}
            ></div>
            {isStarting && (
              <p className="mt-3 text-center text-xs text-slate-500 animate-pulse">
                Initializing camera feed...
              </p>
            )}
            <p className="mt-3 text-center text-xs text-slate-500">
              Point your camera at the dynamic QR code displayed on the classroom screen.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}
