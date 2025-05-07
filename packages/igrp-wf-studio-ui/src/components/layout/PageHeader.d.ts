import React from "react";
interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
    onCreateNew?: () => void;
    createNewLabel?: string;
}
declare const PageHeader: React.FC<PageHeaderProps>;
export default PageHeader;
//# sourceMappingURL=PageHeader.d.ts.map