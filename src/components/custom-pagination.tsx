"use client";

import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationLink,
} from "./ui/pagination";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Ellipsis } from "lucide-react";
import { useTranslations } from "next-intl";
import useDataTableParams from "@/hooks/use-data-table-params";

interface CustomPaginationProps {
  totalPages: number;
}

const rowsPerPageOptions = [5, 10, 25, 50, 100] as const;

const getPageRange = (
  currentPage: number,
  totalPages: number,
  delta: number = 1,
): (number | "ellipsis")[] => {
  const range: (number | "ellipsis")[] = [];

  const left = Math.max(2, currentPage - delta);
  const right = Math.min(totalPages - 1, currentPage + delta);

  range.push(1);

  if (left > 2) {
    range.push("ellipsis");
  }

  for (let i = left; i <= right; i++) {
    range.push(i);
  }

  if (right < totalPages - 1) {
    range.push("ellipsis");
  }

  if (totalPages > 1) {
    range.push(totalPages);
  }

  return range;
};

const CustomPagination = ({ totalPages }: CustomPaginationProps) => {
  const { page = 1, limit = 10, setFilter } = useDataTableParams();

  const t = useTranslations();

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setFilter({ page: newPage });
    }
  };

  const handleLimitChange = (newLimit: number) => {
    setFilter({ page: 1, limit: newLimit });
  };

  const pageRange = getPageRange(page, totalPages);

  return (
    <div className="mt-12 flex flex-wrap items-center justify-end gap-4 border-t border-[var(--border)] pt-8">
      {/* Rows Per Page */}
      <div className="flex items-center space-x-2">
        <Label
          htmlFor="rows-per-page"
          className="text-muted-foreground text-xs tracking-wide"
        >
          {t("pagination.rows_per_page")}:
        </Label>
        <Select
          value={limit.toString()}
          onValueChange={(value) => handleLimitChange(Number(value))}
        >
          <SelectTrigger id="rows-per-page" className="w-25 rounded-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {rowsPerPageOptions.map((option) => (
              <SelectItem key={option} value={option.toString()}>
                {option}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Pagination Controls */}
      <Pagination className="mx-0 w-fit justify-end">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              text={t("pagination.previous")}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page - 1);
              }}
              className={page === 1 ? "pointer-events-none opacity-50" : ""}
            />
          </PaginationItem>

          {pageRange.map((item, index) => (
            <PaginationItem key={`${item}-${index}`}>
              {item === "ellipsis" ? (
                <span className="text-muted-foreground px-2">
                  <Ellipsis className="h-fit w-4" />
                </span>
              ) : (
                <PaginationLink
                  href="#"
                  isActive={item === page}
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(item);
                  }}
                >
                  {item}
                </PaginationLink>
              )}
            </PaginationItem>
          ))}

          <PaginationItem>
            <PaginationNext
              href="#"
              text={t("pagination.next")}
              onClick={(e) => {
                e.preventDefault();
                handlePageChange(page + 1);
              }}
              className={
                page === totalPages ? "pointer-events-none opacity-50" : ""
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export default CustomPagination;
