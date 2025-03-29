"use client";
import { useMemo } from "react";

import { useCatalog } from "../_hooks/useCatalog";

const PublicCataloguesContent = (props: { id: string }) => {
  const { id } = props;

  const catalogQuery = useCatalog({ id });
  const catalogURL = useMemo(() => {
    const googleViewerUrl = `https://docs.google.com/gview?url=${catalogQuery.data?.pdf}&embedded=true`;

    return googleViewerUrl;
  }, [catalogQuery.data]);

  return (
    <div className="w-full h-screen">
      <iframe
        height="100%"
        src={catalogURL}
        style={{ border: "none" }}
        title="PDF Viewer"
        width="100%"
      />
    </div>
  );
};

export default PublicCataloguesContent;
