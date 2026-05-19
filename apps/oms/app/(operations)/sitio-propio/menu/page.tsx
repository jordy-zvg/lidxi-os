import { permanentRedirect } from 'next/navigation';

export const metadata = { title: 'Editor de menú' };

export default function SitioPropioMenuRedirect() {
  permanentRedirect('/admin/menu');
}
