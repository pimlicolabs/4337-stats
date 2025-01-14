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

interface UsageTableProps {
  title: string;
  description: string;
  data: { name: string; count: number }[] | undefined;
}

export function BundlerTable({ title, data }: UsageTableProps) {
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
              Bundler
            </TableHead>
            <TableHead className="text-right py-4 font-semibold">
              User Operations Bundled
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((data) => (
            <TableRow
              key={data.name}
              className="hover:bg-gray-50 transition-colors"
            >
              <TableCell className="font-medium py-4">
                {capitalize(data.name)}
              </TableCell>
              <TableCell className="text-right py-4 font-medium text-gray-600">
                {data.count.toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
