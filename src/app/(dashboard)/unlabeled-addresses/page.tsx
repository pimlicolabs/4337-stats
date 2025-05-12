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
import { Eye, X } from "lucide-react";
import { toast, Toaster } from "sonner";
import { PieChart } from "@/components/charts/pieChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
  type: "bundler" | "paymaster" | "factory";
}

// Wrapper component that uses the search params
function UnlabeledAddressesContent() {  
  // Date range parameters (fixed for now, could be made configurable later)
  const startDateParam = startDate.toISOString();
  const endDateParam = endDate.toISOString();
  
  // State for the inspection panel
  const [inspectionPanel, setInspectionPanel] = useState<{
    isOpen: boolean;
    address: string;
    type: "bundler" | "paymaster" | "factory";
    data?: SmartLabelingData[];
  }>({ isOpen: false, address: "", type: "bundler" });

  // Query for unlabeled addresses with refetchOnWindowFocus disabled to prevent data reset
  const unlabeledBundlers = api.unlabeledAddresses.getUnlabeledBundlers.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );
  
  const unlabeledPaymasters = api.unlabeledAddresses.getUnlabeledPaymasters.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  const unlabeledApps = api.unlabeledAddresses.getUnlabeledApps.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  const unlabeledFactories = api.unlabeledAddresses.getUnlabeledFactories.useQuery(
    {
      startDate: new Date(startDateParam),
      endDate: new Date(endDateParam)
    },
    {
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false
    }
  );

  // Create a client for direct API calls
  const apiClient = api.useUtils();
  
  // Process smart labeling data to determine the best label
  const processSmartLabelingData = (data: SmartLabelingData[], addressType: "bundler" | "paymaster" | "factory") => {
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
      
      return { label: topLabel.name, color, percentage: topLabel.percentage };
    }
    
    return { label: "Unknown", color: "#94a3b8" };
  };

  // SmartLabelTable component for reuse
  interface SmartLabelTableProps {
    title: string;
    type: "bundler" | "paymaster" | "factory";
    data: { address: string; count: number; chainId?: number }[] | undefined;
    isLoading: boolean;
  }

  const SmartLabelTable: React.FC<SmartLabelTableProps> = ({ 
    title, 
    type, 
    data, 
    isLoading, 
  }) => {
    // State to track inspection status for each address
    const [inspectionStatus, setInspectionStatus] = useState<Record<string, {
      status: "idle" | "loading" | "completed" | "error";
      label?: string;
      color?: string;
      percentage?: number;
    }>>({});

    // Function to handle inspection of an address
    const handleInspect = async (address: string) => {
      // Update status to loading
      setInspectionStatus(prev => ({
        ...prev,
        [address]: { status: "loading" }
      }));

      try {
        // Only bundlers and paymasters can be smart labeled with the API
        if (type === "factory") {
          setInspectionStatus(prev => ({
            ...prev,
            [address]: { 
              status: "completed", 
              label: "Not supported", 
              color: "#94a3b8"
            }
          }));
          toast.info("Smart labeling is not supported for factories");
          return;
        }

        // Get smart labeling data using the API client
        const result = await apiClient.client.unlabeledAddresses.getUserOperationsForSmartLabeling.query({
          address: address,
          addressType: type as "bundler" | "paymaster", // Cast to the expected type
          limit: 1000
        });
        
        // Process the data
        const labelResult = processSmartLabelingData(result, type);
        
        // Update the status
        setInspectionStatus(prev => ({
          ...prev,
          [address]: { 
            status: "completed", 
            label: labelResult.label, 
            color: labelResult.color,
            percentage: labelResult.percentage
          }
        }));

        // Show toast with the result
        if (labelResult.label !== "Unknown") {
          toast.success(`Address identified as ${labelResult.label} with ${labelResult.percentage}% confidence`);
        } else {
          toast.info("Could not identify a clear pattern for this address");
        }
      } catch (error) {
        // Handle error
        setInspectionStatus(prev => ({
          ...prev,
          [address]: { status: "error" }
        }));
        console.error(`Error processing ${type} ${address}:`, error);
        toast.error("Error analyzing address");
      }
    };


    // Function to open inspection panel
    const openInspectionPanel = async (address: string) => {
      // Don't allow opening for factory type
      if (type === "factory") {
        toast.info("Inspection is not supported for factories");
        return;
      }
      
      setInspectionPanel({
        isOpen: true,
        address,
        type,
        data: undefined // Will be loaded
      });
      
      try {
        // Get smart labeling data using the API client
        const result = await apiClient.client.unlabeledAddresses.getUserOperationsForSmartLabeling.query({
          address: address,
          addressType: type as "bundler" | "paymaster",
          limit: 1000
        });
        
        setInspectionPanel(prev => ({
          ...prev,
          data: result
        }));
      } catch (error) {
        console.error(`Error fetching data for inspection: ${error}`);
        toast.error("Error loading inspection data");
        setInspectionPanel(prev => ({ ...prev, isOpen: false }));
      }
    };
    
    // Function to render smart label status cell
    const renderSmartLabelStatus = (address: string) => {
      const status = inspectionStatus[address];
      
      // Maintain consistent height with a wrapper div
      const cellWrapper = (content: React.ReactNode, actions?: React.ReactNode) => (
        <div className="h-9 flex items-center justify-between">
          <div className="flex items-center gap-2">{content}</div>
          {actions}
        </div>
      );
      
      if (!status) {
        return cellWrapper(
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleInspect(address)}
          >
            Inspect
          </Button>
        );
      }
      
      if (status.status === "loading") {
        return cellWrapper(
          <div className="flex items-center gap-2">
            <div className="animate-pulse h-2 w-2 rounded-full bg-blue-500"></div>
            <span>Loading...</span>
          </div>
        );
      }
      
      if (status.status === "error") {
        return cellWrapper(
          <span className="text-red-500">Error</span>
        );
      }
      
      if (status.status === "completed" && status.label) {
        const eyeButton = (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => openInspectionPanel(address)}
            className="p-1 h-6 w-6"
            title="Inspect details"
          >
            <Eye size={14} />
          </Button>
        );
        
        return cellWrapper(
          <>
            {status.color && (
              <div 
                className="w-3 h-3 rounded-full flex-shrink-0" 
                style={{ backgroundColor: status.color }}
              />
            )}
            <span className={`${status.label === "Unknown" ? "text-gray-500" : "font-medium"}`}>
              {status.label}
            </span>
          </>,
          eyeButton
        );
      }
      
      return cellWrapper(<span className="text-gray-500">Unknown</span>);
    };
    
    return (
      <div>
        <h2 className="text-2xl mb-2">{title}</h2>
        <div className="mt-2 rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[400px]">Address</TableHead>
                <TableHead>Count</TableHead>
                <TableHead className="w-[200px]">Smart Label</TableHead>
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
                    <TableCell className="py-2">
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

  // Function to render the inspection panel
  const renderInspectionPanel = () => {
    if (!inspectionPanel.isOpen) return null;
    
    // Prepare data for pie chart
    const prepareChartData = () => {
      if (!inspectionPanel.data || inspectionPanel.data.length === 0) {
        return [];
      }
      
      // Group by label
      const groupedData: Record<string, number> = {};
      let totalCount = 0;
      
      inspectionPanel.data.forEach(item => {
        const label = item.label || "unknown";
        groupedData[label] = (groupedData[label] || 0) + item.count;
        totalCount += item.count;
      });
      
      // Convert to array format for pie chart
      return Object.entries(groupedData).map(([name, value]) => ({
        name,
        value,
        percentage: Math.round((value / totalCount) * 100)
      }));
    };
    
    const chartData = prepareChartData();
    
    // Determine which config to use based on type
    let chartConfig = {};
    if (inspectionPanel.type === "bundler") {
      chartConfig = BUNDLER_CHART_CONFIG;
    } else if (inspectionPanel.type === "paymaster") {
      chartConfig = PAYMASTER_CHART_CONFIG;
    }
    
    return (
      <div className="w-100 h-full fixed right-0 top-0 bg-white dark:bg-gray-900 shadow-lg border-l border-gray-200 dark:border-gray-800 overflow-auto z-40">
        <div className="p-4 border-b flex justify-between items-center sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h2 className="text-lg font-bold">Inspection Results</h2>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setInspectionPanel(prev => ({ ...prev, isOpen: false }))}
            className="p-1 h-8 w-8"
          >
            <X size={16} />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <div className="space-y-2 border-b pb-4">
            <div>
              <span className="text-sm text-gray-500 block">Address:</span>
              <span className="font-mono text-sm break-all">{inspectionPanel.address}</span>
            </div>
            <div>
              <span className="text-sm text-gray-500 block">Type:</span>
              <span className="capitalize">{inspectionPanel.type}</span>
            </div>
          </div>
          
          {!inspectionPanel.data ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-pulse flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <span>Loading data...</span>
              </div>
            </div>
          ) : chartData.length === 0 ? (
            <div className="text-center p-8 text-gray-500">
              No data available for analysis
            </div>
          ) : (
            <div>
              <PieChart
                title="Distribution"
                innerTitle={`${chartData.length} items`}
                description="Distribution of interactions"
                config={chartConfig}
                data={chartData}
                dataKey="value"
                nameKey="name"
              />
              
              <div className="mt-4 border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Label</TableHead>
                      <TableHead>Count</TableHead>
                      <TableHead>%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((item) => (
                      <TableRow key={item.name}>
                        <TableCell className="capitalize py-2">{item.name}</TableCell>
                        <TableCell className="py-2">{item.value.toLocaleString()}</TableCell>
                        <TableCell className="py-2">{item.percentage}%</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  return (
    <div className={`mx-auto ${inspectionPanel.isOpen ? 'mr-96' : 'max-w-7xl'} space-y-8 p-8 transition-all duration-300`}>
      <Toaster position="bottom-right" richColors />
      {inspectionPanel.isOpen && renderInspectionPanel()}
      <h1 className="text-3xl font-bold">Unlabeled Addresses</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-8">
          {/* Paymasters Table */}
          <SmartLabelTable
            title="Paymasters"
            type="paymaster"
            data={unlabeledPaymasters.data}
            isLoading={unlabeledPaymasters.isLoading}
          />
          
          {/* Bundlers Table */}
          <SmartLabelTable
            title="Bundlers"
            type="bundler"
            data={unlabeledBundlers.data}
            isLoading={unlabeledBundlers.isLoading}
          />
          
          {/* Account Factories Table */}
          <div>
            <h2 className="text-2xl mb-2">Account Factories</h2>
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
            <h2 className="text-2xl mb-2">Apps</h2>
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
