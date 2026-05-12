import { PageStub } from '@lidxi/ui';

interface Props {
  params: { employeeId: string };
}

export default function PersonalDetailPage({ params }: Props) {
  return <PageStub title={`Perfil — ${params.employeeId}`} />;
}
