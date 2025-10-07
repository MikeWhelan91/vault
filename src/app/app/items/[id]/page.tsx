export const runtime = 'edge';

import ItemViewClient from './ItemViewClient';

export default function ItemViewPage({ params }: { params: Promise<{ id: string }> }) {
  return <ItemViewClient params={params} />;
}
