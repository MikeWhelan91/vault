import EditBundlePageClient from './EditBundlePageClient';

export default function EditBundlePage({ params }: { params: { id: string } }) {
  return <EditBundlePageClient bundleId={params.id} />;
}
