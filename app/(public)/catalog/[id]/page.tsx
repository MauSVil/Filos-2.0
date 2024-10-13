"use client";
import { useMemo } from "react";
import { useCatalog } from "./_hooks/useCatalog";

const PublicCataloguesPage = (params: { id: string }) => {
  const catalogQuery = useCatalog({ id: params.id });
  const catalogURL = useMemo(() => {
    const googleViewerUrl = `https://docs.google.com/gview?url=${catalogQuery.data?.pdf}&embedded=true`;
    return googleViewerUrl;
  }, [catalogQuery.data]);

  return (
    <div className="w-full h-screen">
      <iframe
        src={catalogURL}
        width="100%"
        height="100%"
        style={{ border: 'none' }}
        title="PDF Viewer"
      />
    </div>
  );
};

export default PublicCataloguesPage;