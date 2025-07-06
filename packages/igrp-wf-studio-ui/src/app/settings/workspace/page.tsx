import React from 'react';
import WorkspaceSettingsForm from '@/components/settings/WorkspaceSettingsForm'; // Ajustar caminho se necessário
import MainLayout from '@/components/layout/MainLayout'; // Supondo que existe um layout principal
import PageHeader from '@/components/layout/PageHeader'; // Supondo que existe um PageHeader

// export const metadata = {
//   title: 'Configurações do Workspace - IGRP Web/Mobile Studio',
// };

const WorkspaceSettingsPage: React.FC = () => {
  return (
    // <MainLayout> // Se o MainLayout for usado para envolver todas as páginas
    // Idealmente, o MainLayout seria parte do `layout.tsx` da rota /settings
    <>
      <PageHeader
        title="Configurações de Workspace"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Configurações', href: '/settings' }, // Supondo uma página /settings
          { label: 'Workspace' },
        ]}
      />
      <div className="container mx-auto px-4 py-8">
        <WorkspaceSettingsForm />
      </div>
    </>
    // </MainLayout>
  );
};

export default WorkspaceSettingsPage;
