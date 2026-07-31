import HistoryHeader from "@/components/history/HistoryHeader";
import HistoryFilters from "@/components/history/HistoryFilters";
import HistoryTable from "@/components/history/HistoryTable";
import HistoryPagination from "@/components/history/HistoryPagination";

export default function HistoryPage() {
  return (
    <div className="space-y-6">
      <HistoryHeader />
      <HistoryFilters />
      <HistoryTable />
      <HistoryPagination />
    </div>
  );
}