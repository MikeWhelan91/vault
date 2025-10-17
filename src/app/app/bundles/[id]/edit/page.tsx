import EditBundlePageClient from './EditBundlePageClient';

export default async function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditBundlePageClient bundleId={id} />;
}
