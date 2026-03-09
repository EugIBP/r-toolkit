import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const [jumpValue, setJumpValue] = useState("");

  const handleJump = () => {
    const page = parseInt(jumpValue, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
      setJumpValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-4 px-2">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost-dark"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <span className="text-xs text-muted-foreground font-medium">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="ghost-dark"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="disabled:opacity-30"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Jump to:</span>
        <Input
          variant="dark"
          type="text"
          value={jumpValue}
          onChange={(e) => setJumpValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleJump}
          placeholder={String(totalPages)}
          className="w-16 h-7 text-xs"
        />
      </div>
    </div>
  );
}
