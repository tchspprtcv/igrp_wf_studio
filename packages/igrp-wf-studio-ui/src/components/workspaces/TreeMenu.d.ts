import React from 'react';
interface TreeNode {
    id: string;
    code: string;
    title: string;
    status: string;
    processes?: TreeNode[];
    subareas?: TreeNode[];
}
interface TreeMenuProps {
    areas: TreeNode[];
    onCreateArea?: () => void;
    onCreateSubArea?: (areaCode: string) => void;
    onCreateProcess?: (areaCode: string, subareaCode?: string) => void;
    onEditItem?: (type: 'area' | 'subarea' | 'process', code: string, parentCode?: string) => void;
    onDeleteItem?: (type: 'area' | 'subarea' | 'process', code: string, parentCode?: string) => void;
}
declare const TreeMenu: React.FC<TreeMenuProps>;
export default TreeMenu;
//# sourceMappingURL=TreeMenu.d.ts.map