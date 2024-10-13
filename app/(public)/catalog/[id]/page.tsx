import PublicCataloguesContent from "./_components/Content";

const PublicCataloguesPage = (props: { params: { id: string } }) => {
  const { params } = props;
  return (
    <PublicCataloguesContent id={params.id} />
  );
};

export default PublicCataloguesPage;