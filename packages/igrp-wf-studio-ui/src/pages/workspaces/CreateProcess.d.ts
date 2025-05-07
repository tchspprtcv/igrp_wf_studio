import React from 'react';
interface CreateProcessProps {
    workspaceCode: string;
    onClose: () => void;
    onCreated: (newProcessCode: string) => void;
    initialArea?: string | null;
    initialSubArea?: string | null;
}
declare const CreateProcess: React.FC<CreateProcessProps>;
export default CreateProcess;
//# sourceMappingURL=CreateProcess.d.ts.map