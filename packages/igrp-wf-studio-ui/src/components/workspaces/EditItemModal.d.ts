import React from 'react';
interface EditItemModalProps {
    type: 'area' | 'subarea' | 'process';
    workspaceCode: string;
    itemCode: string;
    parentCode?: string;
    onClose: () => void;
    onUpdated: () => void;
}
declare const EditItemModal: React.FC<EditItemModalProps>;
export default EditItemModal;
//# sourceMappingURL=EditItemModal.d.ts.map