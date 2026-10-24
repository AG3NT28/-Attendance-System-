import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X, Camera, AlertCircle, Crosshair } from 'lucide-react';

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

    const qrConfig = { fps: 12, qrbox: { width: 240, height: 240 } };

    html5QrCode
      .start(
        { facingMode: 'environment' },
        qrConfig,
        (decodedText) => {
          try {
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
        () => {}
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div className="relative w-full max-w-sm border border-zinc-700 bg-[#111114] p-5 shadow-2xl bracket-card">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between border-b border-zinc-800 pb-3 font-mono">
          <div className="flex items-center gap-2">
            <Crosshair className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold tracking-wider text-zinc-100 uppercase">
              OPTICAL_RETICLE
            </span>
          </div>
          <button
            onClick={onClose}
            className="border border-zinc-700 bg-zinc-800 p-1 text-zinc-400 hover:border-zinc-500 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {errorMsg ? (
          <div className="my-4 border border-signal-crimson/30 bg-signal-crimson/10 p-4 text-center font-mono text-xs">
            <AlertCircle className="mx-auto mb-2 h-6 w-6 text-signal-crimson" />
            <p className="font-semibold text-red-300">{errorMsg}</p>
            <p className="mt-2 text-[11px] text-zinc-400">
              You can also use your device native camera scanner.
            </p>
          </div>
        ) : (
          <div>
            <div
              id="qr-reader-container"
              className="overflow-hidden border border-zinc-700 bg-black relative"
              style={{ minHeight: '260px' }}
            ></div>
            {isStarting && (
              <p className="mt-3 text-center text-xs font-mono text-amber-400 animate-pulse">
                INITIALIZING WEBRTC SENSOR...
              </p>
            )}
            <p className="mt-3 text-center text-[11px] font-mono text-zinc-400">
              Align camera reticle with classroom dynamic QR.
            </p>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-4 w-full border border-zinc-700 bg-zinc-900 py-2.5 text-xs font-mono font-bold uppercase tracking-wider text-zinc-300 hover:bg-zinc-800 hover:border-zinc-500 transition"
        >
          DISMISS VIEWFINDER
        </button>
      </div>
    </div>
  );
}
