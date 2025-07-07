// Placeholder for DataTable component
"use client"; // Assuming this will be a client component for interactivity

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataTableProps<TData, TValue> {
  columns: any[]; // Replace with actual ColumnDef type later
  data: TData[];
  className?: string;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  className,
}: DataTableProps<TData, TValue>) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column, index) => (
                <TableHead key={index}>{column.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length ? (
              data.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {/* Placeholder for cell rendering */}
                      {(row as any)[column.accessorKey]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// Example usage (will be removed or adapted later)
// const sampleColumns = [
//   { header: "Name", accessorKey: "name" },
//   { header: "Date", accessorKey: "date" },
//   { header: "Status", accessorKey: "status" },
// ];
// const sampleData = [
//   { name: "Project Alpha", date: "2023-10-26", status: "Active" },
//   { name: "Workflow Beta", date: "2023-10-25", status: "Completed" },
// ];
