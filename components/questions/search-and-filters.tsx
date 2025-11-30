"use client";

import { useState, useMemo } from "react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, X, CircleCheck, CircleEllipsis } from "lucide-react";
import { CATEGORIES, VERIFICATION_STATUS } from "@/constants/questions";
import { QuestionsState } from "@/hooks/use-questions";
import { debounce } from "@/lib/utils/time";

interface SearchAndFiltersProps {
  filters: QuestionsState["filters"];
  onFiltersChange: (filters: QuestionsState["filters"]) => void;
  onClear: () => void;
}

export function SearchAndFilters({
  filters,
  onFiltersChange,
  onClear,
}: SearchAndFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        onFiltersChange({ ...filters, search: value });
      }, 300),
    [filters, onFiltersChange],
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({ ...filters, category });
  };

  const handleVerificationStatusChange = (verificationStatus: string) => {
    onFiltersChange({ ...filters, verificationStatus });
  };

  const hasActiveFilters =
    filters.search || filters.category || filters.verificationStatus;

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search questions or names..."
                defaultValue={filters.search}
                onChange={handleSearchChange}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter button */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              Filters
              {(filters.category || filters.verificationStatus) && (
                <Badge variant="secondary" className="ml-1">
                  {(filters.category ? 1 : 0) +
                    (filters.verificationStatus ? 1 : 0)}
                </Badge>
              )}
            </Button>

            {hasActiveFilters && (
              <Button variant="ghost" onClick={onClear} className="gap-2">
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </div>

        {/* Category and Status filters */}
        {showFilters && (
          <div className="mt-4 space-y-4">
            {/* Category filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Categories</h4>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={
                      filters.category === category ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleCategoryChange(category)}
                    className="text-xs"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Verification status filters */}
            <div>
              <h4 className="text-sm font-medium mb-2">Verification Status</h4>
              <div className="flex flex-wrap gap-2">
                {VERIFICATION_STATUS.map((status) => (
                  <Button
                    key={status.value}
                    variant={
                      filters.verificationStatus === status.value
                        ? "default"
                        : "outline"
                    }
                    size="sm"
                    onClick={() => handleVerificationStatusChange(status.value)}
                    className="text-xs"
                  >
                    {status.value === "verified" && (
                      <CircleCheck className="h-3 w-3 mr-1" />
                    )}
                    {status.value === "unverified" && (
                      <CircleEllipsis className="h-3 w-3 mr-1" />
                    )}
                    {status.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardHeader>
    </Card>
  );
}