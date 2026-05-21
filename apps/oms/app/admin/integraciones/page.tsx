export const metadata = { title: 'Integraciones' };

import { IntegracionesScreen } from '@/components/integraciones/IntegracionesScreen';
import { loadChannels } from '@/lib/channel-actions';
import { CHANNEL_SCHEMAS } from '@/lib/channel-schemas';

export default async function IntegracionesPage() {
  const channels = await loadChannels();
  return <IntegracionesScreen channels={channels} schemas={CHANNEL_SCHEMAS} />;
}
