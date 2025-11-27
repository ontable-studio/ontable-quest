"use client";

import * as React from "react";
import {
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  Loader2Icon,
  TagIcon,
  XIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export interface ComboboxOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface ComboboxGroup {
  label: string;
  options: ComboboxOption[];
}

interface ComboboxConfig {
  // Text
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  createButtonText?: string;
  createPlaceholder?: string;
  searchingText?: string;
  loadingText?: string;
  clearAriaLabel?: string;
  removeAriaLabel?: (label: string) => string;

  // Timing
  debounceMs?: number;

  // Styling
  sizes?: {
    icon?: string;
    iconSmall?: string;
    iconMedium?: string;
    iconLarge?: string;
    button?: string;
    buttonSmall?: string;
  };

  // Animation
  animation?: {
    duration?: string;
    easing?: string;
  };
}

interface ComboboxProps {
  options?: ComboboxOption[];
  groups?: ComboboxGroup[];
  value?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  allowCreate?: boolean;
  onCreateOption?: (value: string) => void | Promise<void>;
  className?: string;
  multiSelect?: boolean;
  maxItems?: number;
  disabled?: boolean;
  loading?: boolean;
  onSearch?: (searchTerm: string) => Promise<ComboboxOption[]>;
  renderOption?: (option: ComboboxOption) => React.ReactNode;
  renderSelected?: (selectedOptions: ComboboxOption[]) => React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  config?: ComboboxConfig;
}

// Default configuration
const defaultConfig: ComboboxConfig = {
  placeholder: "Select option...",
  searchPlaceholder: "Search...",
  emptyMessage: "No options found.",
  createButtonText: "New category",
  createPlaceholder: "Enter category name...",
  searchingText: "Searching...",
  loadingText: "Loading...",
  clearAriaLabel: "Clear selection",
  removeAriaLabel: (label: string) => `Remove ${label}`,
  debounceMs: 300,
  sizes: {
    icon: "h-4 w-4",
    iconSmall: "h-3 w-3",
    iconMedium: "h-6 w-6",
    button: "h-9 px-3",
  },
  animation: {
    duration: "300ms",
    easing: "ease-in-out",
  },
};

export function Combobox({
  options: initialOptions,
  groups,
  value,
  onValueChange,
  allowCreate = false,
  onCreateOption,
  className,
  multiSelect = false,
  maxItems,
  disabled = false,
  loading = false,
  onSearch,
  renderOption,
  renderSelected,
  clearable = false,
  onClear,
  config = {},
}: ComboboxProps) {
  // Merge with default config
  const finalConfig = { ...defaultConfig, ...config };
  const {
    placeholder,
    searchPlaceholder,
    emptyMessage,
    createButtonText,
    createPlaceholder,
    searchingText,
    loadingText,
    clearAriaLabel,
    removeAriaLabel,
    debounceMs,
    sizes,
  } = finalConfig;
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");
  const [newCategoryInput, setNewCategoryInput] = React.useState("");
  const [searchResults, setSearchResults] = React.useState<ComboboxOption[] | null>(null);
  const [searchLoading, setSearchLoading] = React.useState(false);
  const [creatingOption, setCreatingOption] = React.useState(false);

  // Memoize options
  const allOptions = React.useMemo(() => {
    if (groups) {
      return groups.flatMap(group => group.options);
    }
    return initialOptions || [];
  }, [initialOptions, groups]);

  // Get selected option(s)
  const selectedOptions = React.useMemo(() => {
    if (multiSelect && Array.isArray(value)) {
      return allOptions.filter(option => value.includes(option.value));
    } else if (!multiSelect && typeof value === 'string') {
      const option = allOptions.find(option => option.value === value);
      return option ? [option] : [];
    }
    return [];
  }, [value, allOptions, multiSelect]);

  // Debounced search
  React.useEffect(() => {
    if (!onSearch || !inputValue) {
      setSearchResults(null);
      setSearchLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const results = await onSearch(inputValue);
        setSearchResults(results);
      } catch (error) {
        console.error("Search failed:", error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [inputValue, onSearch, debounceMs]);

  const handleSelect = (selectedValue: string) => {
    if (multiSelect) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(selectedValue)
        ? currentValues.filter(v => v !== selectedValue)
        : [...currentValues, selectedValue];

      // Respect maxItems limit
      if (maxItems && newValues.length > maxItems) {
        return;
      }

      onValueChange?.(newValues);
    } else {
      onValueChange?.(selectedValue === value ? "" : selectedValue);
      setOpen(false);
    }
  };

  const handleCreateNew = async () => {
    const categoryToCreate = newCategoryInput.trim() || createButtonText;
    if (!categoryToCreate) return;

    try {
      setCreatingOption(true);
      await onCreateOption?.(categoryToCreate);
      setNewCategoryInput("");
      setInputValue("");
      if (!multiSelect) {
        setOpen(false);
      }
    } catch (error) {
      console.error("Failed to create option:", error);
    } finally {
      setCreatingOption(false);
    }
  };

  const handleNewCategoryKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCreateNew();
    } else if (e.key === "Escape") {
      setNewCategoryInput("");
    }
  };

  const handleClear = () => {
    if (multiSelect) {
      onValueChange?.([]);
    } else {
      onValueChange?.("");
    }
    onClear?.();
  };

  const filterOptions = (optionsToFilter: ComboboxOption[]) => {
    if (!inputValue) return optionsToFilter;
    return optionsToFilter.filter(option =>
      option.label.toLowerCase().includes(inputValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const getDisplayOptions = () => {
    if (searchResults !== null) {
      return filterOptions(searchResults);
    }

    if (groups) {
      return groups.map(group => ({
        label: group.label,
        options: filterOptions(group.options),
        isGroup: true
      }));
    }

    return filterOptions(allOptions);
  };

  return (
    <Popover open={open} onOpenChange={disabled ? undefined : setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-multiselectable={multiSelect}
          disabled={disabled || loading}
          asChild
          className={cn(
            "w-full justify-between font-normal outline-offset-0 outline-none focus-visible:outline-[3px]",
            "min-h-10",
            className,
          )}
        >
          <div>
          {loading ? (
            <Loader2Icon className={cn(sizes?.icon, "animate-spin text-muted-foreground")} />
          ) : multiSelect ? (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {renderSelected ? (
                renderSelected(selectedOptions)
              ) : selectedOptions.length > 0 ? (
                selectedOptions.map((option) => (
                  <Badge
                    key={option.value}
                    variant="secondary"
                    className="flex items-center gap-1 px-2 py-0.5 text-xs"
                  >
                    {option.label}
                    {!disabled && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className={cn(sizes?.iconSmall, "p-0 hover:bg-muted-foreground/20 rounded-sm")}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(option.value);
                        }}
                        aria-label={removeAriaLabel?.(option.label)}
                      >
                        <XIcon className={sizes?.iconSmall} />
                      </Button>
                    )}
                  </Badge>
                ))
              ) : (
                <span className="text-muted-foreground truncate">{placeholder}</span>
              )}
            </div>
          ) : (
            <span className={cn("truncate", !selectedOptions[0] && "text-muted-foreground")}>
              {selectedOptions[0]?.label || placeholder}
            </span>
          )}
          <div className="flex items-center gap-1">
            {clearable && selectedOptions.length > 0 && !disabled && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(sizes?.iconMedium, "p-0 hover:bg-muted-foreground/20 rounded-sm")}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                aria-label={clearAriaLabel}
              >
                <XIcon className={sizes?.iconSmall} />
              </Button>
            )}
            <ChevronDownIcon className={cn("text-muted-foreground/80 shrink-0", sizes?.icon)} />
          </div>
          </div>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="border-input w-full min-w-[var(--radix-popper-anchor-width)] max-w-[var(--radix-popper-anchor-width)] max-h-80 p-0 z-50"
        align="start"
        side="bottom"
        sideOffset={4}
        avoidCollisions={true}
        collisionPadding={10}
      >
        <Command className="w-full max-h-80 overflow-hidden">
          <CommandInput
            placeholder={searchPlaceholder}
            value={inputValue}
            onValueChange={setInputValue}
          />
          <CommandList className="max-h-60 overflow-auto overflow-x-hidden">
            {searchLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2Icon className={cn(sizes?.icon, "animate-spin text-muted-foreground")} />
                <span className="ml-2 text-sm text-muted-foreground">{searchingText}</span>
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {searchLoading ? searchingText : emptyMessage}
                </CommandEmpty>
                {(() => {
                  const displayOptions = getDisplayOptions();

                  if (!groups || searchResults !== null) {
                    // Handle flat options (search results or no groups)
                    return (
                      <CommandGroup key="default-group">
                        {(displayOptions as ComboboxOption[]).map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => handleSelect(option.value)}
                            disabled={option.disabled}
                          >
                            {renderOption ? (
                              renderOption(option)
                            ) : (
                              <>
                                <CheckIcon
                                  className={cn(
                                    "mr-2",
                                    sizes?.icon,
                                    selectedOptions.some(opt => opt.value === option.value)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    );
                  } else {
                    // Handle grouped options
                    return (displayOptions as Array<{label: string; options: ComboboxOption[]; isGroup: boolean}>).map((group) => (
                      <CommandGroup
                        key={group.label}
                        heading={group.label}
                      >
                        {group.options.map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => handleSelect(option.value)}
                            disabled={option.disabled}
                          >
                            {renderOption ? (
                              renderOption(option)
                            ) : (
                              <>
                                <CheckIcon
                                  className={cn(
                                    "mr-2",
                                    sizes?.icon,
                                    selectedOptions.some(opt => opt.value === option.value)
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span>{option.label}</span>
                                  {option.description && (
                                    <span className="text-xs text-muted-foreground">
                                      {option.description}
                                    </span>
                                  )}
                                </div>
                              </>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    ));
                  }
                })()}
              </>
            )}
            {allowCreate && (
              <>
                <CommandSeparator />
                <CommandGroup className="sticky bottom-0 bg-background border-t p-2">
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder={createPlaceholder}
                      value={newCategoryInput}
                      onChange={(e) => setNewCategoryInput(e.target.value)}
                      onKeyDown={handleNewCategoryKeyDown}
                      className={cn("flex-1", sizes?.button)}
                      autoFocus={false}
                      disabled={creatingOption}
                    />
                    <Button
                      size="sm"
                      onClick={handleCreateNew}
                      disabled={!newCategoryInput.trim() || creatingOption}
                      className={cn(sizes?.button)}
                    >
                      {creatingOption ? (
                        <Loader2Icon className={cn(sizes?.icon, "animate-spin")} />
                      ) : (
                        <>
                          <PlusIcon className={sizes?.icon} />
                          {createButtonText}
                        </>
                      )}
                    </Button>
                  </div>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export { defaultConfig };

export function useComboboxAsyncSearch(searchFn: (query: string) => Promise<ComboboxOption[]>) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSearch = React.useCallback(async (query: string) => {
    if (!query.trim()) {
      return [];
    }

    setLoading(true);
    setError(null);
    try {
      const results = await searchFn(query);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      return [];
    } finally {
      setLoading(false);
    }
  }, [searchFn]);

  return { handleSearch, loading, error };
}
