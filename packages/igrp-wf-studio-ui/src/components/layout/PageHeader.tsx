import React from "react";
import Button from "@/components/ui/Button";
import { PlusIcon } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  onCreateNew?: () => void;
  createNewLabel?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  onCreateNew,
  createNewLabel = "Create New",
}) => {
  return (
    <div className="border-b border-gray-200 pb-5 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate mb-1">
            {title}
          </h1>
          {description && <p className="text-gray-600">{description}</p>}
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
          {actions}
          {onCreateNew && (
            <Button 
              variant="primary"
              onClick={onCreateNew}
              icon={<PlusIcon className="h-4 w-4" />}
            >
              {createNewLabel}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PageHeader;