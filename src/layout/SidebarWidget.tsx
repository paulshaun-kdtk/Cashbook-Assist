import React, { useEffect, useState } from "react";
import Image from "next/image";
import QRCode from "qrcode";

export default function SidebarWidget() {
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [showWidget, setShowWidget] = useState(false);

  useEffect(() => {
    // Generate QR code as a Data URL
    QRCode.toDataURL("https://expo.dev/artifacts/eas/kZMcYZpWwLQUHRizxqwMEp.apk")
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <>
    {!showWidget ? (
      <span className="underline text-base dark:text-gray-300 cursor-pointer mx-auto" onClick={() => setShowWidget(true)}>get the app</span>
    ) : (
      <div
      className={`
        mx-auto mb-10 w-full max-w-60 rounded-2xl bg-gray-50 px-4 py-5 text-center dark:bg-white/[0.03]`}
    >
      <h3 className="mb-2 font-semibold text-gray-900 dark:text-white">
        Cashbook Assist mobile app
      </h3>
      <p className="mb-4 text-gray-500 text-theme-sm dark:text-gray-400">
        #download our state of the art mobile application and personalize your financial management.
      </p>

      {/* QR Code */}
      {qrCodeUrl && (
        <Image
          width={128}
          height={128}
          src={qrCodeUrl}
          alt="Download Book Assist App QR Code"
          className="mx-auto mb-4 w-32 h-32"
        />
      )}

      <a
        href="https://expo.dev/artifacts/eas/kZMcYZpWwLQUHRizxqwMEp.apk" 
        target="_blank"
        rel="nofollow"
        className="flex items-center justify-center p-3 font-medium text-white rounded-lg bg-brand-500 text-theme-sm hover:bg-brand-600"
        >
        Get the app
      </a>
    </div>
  )}
    </>
  );
}
