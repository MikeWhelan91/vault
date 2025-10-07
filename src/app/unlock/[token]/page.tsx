export const runtime = 'edge';

import UnlockClient from './UnlockClient';

export default function UnlockPage({ params }: { params: Promise<{ token: string }> }) {
  return <UnlockClient params={params} />;
}
