import PublicCataloguesContent from "./_components/Content";

const PublicCataloguesPage = async (props: { params: Promise<{ id: string }> }) => {
  const { params } = props;

  const { id } = await params;

  return <PublicCataloguesContent id={id} />;
};

export default PublicCataloguesPage;
