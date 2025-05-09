"use client";

import { api } from "@/trpc/react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { subMonths } from "date-fns";
import { useState, useEffect, Suspense } from "react";
import { 
  BUNDLER_CHART_CONFIG, 
  PAYMASTER_CHART_CONFIG,
  FACTORY_CHART_CONFIG
} from "@/lib/registry";
import pLimit from "p-limit";
import { ClipboardCopy } from "lucide-react";
import { toast, Toaster } from "sonner";

const endDate = new Date();
const startDate = subMonths(endDate, 1);

// Interface for the smart labeling data
interface SmartLabelingData {
  address: string;
  count: number;
  label: string | null;
}

// Smart label status type
type SmartLabelStatus = "idle" | "loading" | string;

// Interface for tracking smart label status for addresses
interface AddressLabelStatus {
  address: string;
  status: SmartLabelStatus;
  color?: string;
  type: "bundler" | "paymaster";
}

// Wrapper component that uses the search params
function UnlabeledAddressesContent() {  
  // Date range parameters (fixed for now, could be made configurable later)
  const startDateParam = startDate.toISOString();
  const endDateParam = endDate.toISOString();

  // Combined state for all address statuses
  const [addressStatuses, setAddressStatuses] = useState<AddressLabelStatus[]>([]);
  
  // Query for unlabeled addresses
  const unlabeledBundlers = api.unlabeledAddresses.getUnlabeledBundlers.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1
    }
  );
  
  const unlabeledPaymasters = api.unlabeledAddresses.getUnlabeledPaymasters.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1
    }
  );

  const unlabeledApps = api.unlabeledAddresses.getUnlabeledApps.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1
    }
  );

  const unlabeledFactories = api.unlabeledAddresses.getUnlabeledFactories.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1
    }
  );
  
  // Create a client for direct API calls
  const apiClient = api.useUtils();
  
  // Process smart labeling data to determine the best label
  const processSmartLabelingData = (data: SmartLabelingData[], addressType: "bundler" | "paymaster") => {
    if (!data || data.length === 0) {
      return { label: "Unknown", color: "#94a3b8" };
    }
    
    // Group by label
    const groupedData: Record<string, number> = {};
    let totalCount = 0;
    
    data.forEach(item => {
      const label = item.label || "unknown";
      groupedData[label] = (groupedData[label] || 0) + item.count;
      totalCount += item.count;
    });
    
    // Convert to array and sort by count
    const sortedData = Object.entries(groupedData)
      .map(([label, count]) => ({
        name: label,
        value: count,
        percentage: Math.round((count / totalCount) * 100),
      }))
      .sort((a, b) => b.value - a.value);
    
    // Get the top label
    const topLabel = sortedData[0];
    
    if (topLabel && topLabel.name !== "unknown" && topLabel.percentage > 50) {
      // Find color from registry
      let color = "#94a3b8";
      const name = topLabel.name.toLowerCase();
      
      if (addressType === "bundler" && PAYMASTER_CHART_CONFIG[name]) {
        color = PAYMASTER_CHART_CONFIG[name].color || "#94a3b8";
      } else if (addressType === "paymaster" && BUNDLER_CHART_CONFIG[name]) {
        color = BUNDLER_CHART_CONFIG[name].color || "#94a3b8";
      } else if (FACTORY_CHART_CONFIG[name]) {
        color = FACTORY_CHART_CONFIG[name].color || "#94a3b8";
      }
      
      return { label: topLabel.name, color };
    }
    
    return { label: "Unknown", color: "#94a3b8" };
  };

  // Initialize and process addresses when data is loaded
  useEffect(() => {
    // Wait until both bundlers and paymasters are loaded
    if (
      unlabeledBundlers.isLoading || 
      !unlabeledBundlers.data || 
      unlabeledPaymasters.isLoading || 
      !unlabeledPaymasters.data
    ) return;
    
    // Initialize all addresses with 'idle' status
    const initialStatuses = [
      ...unlabeledBundlers.data.map(bundler => ({
        address: bundler.address,
        status: "idle" as SmartLabelStatus,
        type: "bundler" as const
      })),
      ...unlabeledPaymasters.data.map(paymaster => ({
        address: paymaster.address,
        status: "idle" as SmartLabelStatus,
        type: "paymaster" as const
      }))
    ];
    
    setAddressStatuses(initialStatuses);
    
    // Create a limit function that allows 5 concurrent operations
    const limit = pLimit(5);
    
    // Create an array of promises for processing each address
    const promises = initialStatuses.map(status => {
      return limit(async () => {
        try {
          // Update status to loading
          setAddressStatuses(prev => 
            prev.map(s => 
              s.address === status.address 
                ? { ...s, status: "loading" } 
                : s
            )
          );
          
          // Get smart labeling data using the API client directly
          const result = await apiClient.client.unlabeledAddresses.getUserOperationsForSmartLabeling.query({
            address: status.address,
            addressType: status.type,
            limit: 1000
          });
          
          // Process the data
          const labelResult = processSmartLabelingData(result, status.type);
          
          // Update the status
          setAddressStatuses(prev => 
            prev.map(s => 
              s.address === status.address 
                ? { ...s, status: labelResult.label, color: labelResult.color } 
                : s
            )
          );
        } catch (error) {
          // Handle error
          setAddressStatuses(prev => 
            prev.map(s => 
              s.address === status.address 
                ? { ...s, status: "Error" } 
                : s
            )
          );
          console.error(`Error processing ${status.type} ${status.address}:`, error);
        }
      });
    });
    
    // Execute all promises
    Promise.all(promises).catch(error => {
      console.error("Error processing addresses:", error);
    });
  }, [unlabeledBundlers.data, unlabeledBundlers.isLoading, unlabeledPaymasters.data, unlabeledPaymasters.isLoading, apiClient.client]);

  // SmartLabelTable component for reuse
interface SmartLabelTableProps {
  title: string;
  type: "bundler" | "paymaster" | "factory";
  data: { address: string; count: number; chainId?: number }[] | undefined;
  isLoading: boolean;
  statuses: AddressLabelStatus[];
}

const SmartLabelTable: React.FC<SmartLabelTableProps> = ({ 
  title, 
  type, 
  data, 
  isLoading, 
  statuses 
}) => {
  // Function to copy smart labels to clipboard in CSV format
  const copySmartLabels = () => {
    if (!data || !statuses.length) return;
    
    // Filter only addresses with valid labels (not idle, loading, or error)
    const validLabels = statuses.filter(s => 
      s.type === type && 
      s.status !== "idle" && 
      s.status !== "loading" && 
      s.status !== "Error" &&
      s.status !== "Unknown"
    );
    
    if (!validLabels.length) {
      toast.error("No valid labels to copy");
      return;
    }
    
    // Format as CSV: name\taddress\ttype
    const csvContent = validLabels.map(label => 
      `${label.status}\t${label.address}\t${type === "bundler" ? "" : type === "paymaster" ? "verifying" : ""}`
    ).join('\n');
    
    // Copy to clipboard
    navigator.clipboard.writeText(csvContent)
      .then(() => toast.success(`${validLabels.length} labels copied to clipboard!`))
      .catch(err => {
        console.error("Failed to copy labels:", err);
        toast.error("Failed to copy labels to clipboard");
      });
  };
  
  // Function to render smart label status cell
  const renderSmartLabelStatus = (address: string) => {
    const status = statuses.find(s => s.address === address);
    
    if (!status) return "Idle";
    
    if (status.status === "idle") return "Idle";
    if (status.status === "loading") return "Loading...";
    if (status.status === "Error") return "Error";
    
    // If we have a label and color, show with color indicator
    if (status.color) {
      return (
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: status.color }}
          />
          <span>{status.status}</span>
        </div>
      );
    }
    
    return status.status;
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl">{title}</h2>
        <Button 
          variant="outline" 
          size="sm"
          onClick={copySmartLabels}
          className="flex items-center gap-1"
        >
          <ClipboardCopy size={16} />
          <span>Copy Smart Labels</span>
        </Button>
      </div>
      <div className="mt-2 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[400px]">Address</TableHead>
              <TableHead>Count</TableHead>
              <TableHead className="w-[150px]">Smart Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Loading...
                </TableCell>
              </TableRow>
            ) : !data || data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  No unlabeled {title.toLowerCase()} found
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={`${item.address}-${item.chainId || ''}`}>
                  <TableCell className="font-mono py-1">
                    {item.address}
                  </TableCell>
                  <TableCell className="py-1">{item.count.toLocaleString()}</TableCell>
                  <TableCell className="py-1">
                    {renderSmartLabelStatus(item.address)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-8">
      <Toaster position="top-right" richColors />
      <h1 className="text-3xl font-bold">Unlabeled Addresses</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-8">
          {/* Paymasters Table */}
          <SmartLabelTable
            title="Paymasters"
            type="paymaster"
            data={unlabeledPaymasters.data}
            isLoading={unlabeledPaymasters.isLoading}
            statuses={addressStatuses}
          />
          
          {/* Bundlers Table */}
          <SmartLabelTable
            title="Bundlers"
            type="bundler"
            data={unlabeledBundlers.data}
            isLoading={unlabeledBundlers.isLoading}
            statuses={addressStatuses}
          />
          
          {/* Account Factories Table */}
          <div>
            <h2 className="text-2xl">Account Factories</h2>
            <div className="mt-2 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Address</TableHead>
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unlabeledFactories.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : unlabeledFactories.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No unlabeled factories found
                      </TableCell>
                    </TableRow>
                  ) : (
                    unlabeledFactories.data?.map((factory) => (
                      <TableRow key={`${factory.address}-${factory.chainId}`}>
                        <TableCell className="font-mono py-1">
                          {factory.address}
                        </TableCell>
                        <TableCell className="py-1">{factory.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          
          {/* Apps Table */}
          <div>
            <h2 className="text-2xl">Apps</h2>
            <div className="mt-2 rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[400px]">Address</TableHead>
                    <TableHead>Count</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {unlabeledApps.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : unlabeledApps.data?.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4">
                        No unlabeled apps found
                      </TableCell>
                    </TableRow>
                  ) : (
                    unlabeledApps.data?.map((app) => (
                      <TableRow key={`${app.address}-${app.chainId}`}>
                        <TableCell className="font-mono py-1">
                          {app.address}
                        </TableCell>
                        <TableCell className="py-1">{app.count.toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main page component wrapped in Suspense
export default function UnlabeledAddressesPage() {
  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <UnlabeledAddressesContent />
    </Suspense>
  );
}
