import { LoadingText } from "@/components/charts/loading";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { capitalize } from "@/lib/utils";

interface GenericTableProps<T extends { name: string; count: number }> {
  data: T[] | undefined;
  title: string;
  countLabel: string;
}

export function UsageTable<T extends { name: string; count: number }>({
  data,
  title,
  countLabel,
}: GenericTableProps<T>) {
  if (!data) {
    return <LoadingText />;
  }

  const sortedData = [...data].sort((a, b) => b.count - a.count);

  return (
    <div>
      <Table className="border rounded-lg shadow-sm">
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="w-[200px] py-4 font-semibold">
              {title}
            </TableHead>
            <TableHead className="text-right py-4 font-semibold">
              {countLabel}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow
              key={item.name}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-medium py-4">
                {capitalize(item.name)}
              </TableCell>
              <TableCell className="text-right py-4 font-medium text-gray-600">
                {item.count.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
