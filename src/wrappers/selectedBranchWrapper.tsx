"use client";

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';

export default function SelectedBranchWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const selectedSource = useSelector((state: any) => state.selectedSource.selected_source?.id_on_device);

  useEffect(() => {
    
    const currentUrl = window.location.pathname;
    const searchParams = new URLSearchParams(window.location.search);
    
    if (searchParams.get("incomeSource") === selectedSource) return;
    
    searchParams.set("incomeSource", selectedSource ? selectedSource : "");
    const newUrl = `${currentUrl}?${searchParams.toString()}`;

    router.replace(newUrl);
  }, [selectedSource]);

  return <>{children}</>;
}
