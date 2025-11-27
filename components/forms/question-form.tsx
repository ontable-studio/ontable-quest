"use client";

import { useState, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { QuestionValues, questionSchema } from "@/lib/validations/question";
import { submitQuestion } from "@/app/actions/submit-question";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Combobox,
  ComboboxOption,
  ComboboxGroup,
  useComboboxAsyncSearch,
} from "@/components/ui/combobox";
import { toast } from "sonner";

const predefinedCategories: ComboboxOption[] = [
  {
    value: "marketing",
    label: "Marketing",
    description: "Marketing strategies, campaigns, and growth",
  },
  {
    value: "3d",
    label: "3D",
    description: "3D modeling, animation, and visualization",
  },
  {
    value: "unity",
    label: "Unity",
    description: "Unity game engine development",
  },
  {
    value: "programming",
    label: "Programming",
    description: "Software development and coding",
  },
  {
    value: "project-management",
    label: "Project Management",
    description: "Agile, scrum, and project coordination",
  },
  {
    value: "design",
    label: "Design",
    description: "UI/UX, graphic design, and visual arts",
  },
  {
    value: "business",
    label: "Business",
    description: "Business strategy and operations",
  },
  {
    value: "data-science",
    label: "Data Science",
    description: "Data analysis and statistics",
  },
  {
    value: "machine-learning",
    label: "Machine Learning",
    description: "AI, ML models, and algorithms",
  },
  {
    value: "devops",
    label: "DevOps",
    description: "DevOps practices and infrastructure",
  },
  {
    value: "other",
    label: "Other",
    description: "Questions not fitting other categories",
  },
];

const popularCategories: ComboboxOption[] = [
  {
    value: "programming",
    label: "Programming",
    description: "Most popular category",
  },
  { value: "unity", label: "Unity", description: "High demand topics" },
  { value: "design", label: "Design", description: "Creative discussions" },
];

interface QuestionFormProps {
  enableScrolling?: boolean;
  onQuestionSubmitted?: () => void;
}

export function QuestionForm({ enableScrolling = false, onQuestionSubmitted }: QuestionFormProps) {
  const [customCategories, setCustomCategories] = useState<ComboboxOption[]>(
    [],
  );
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  const form = useForm<QuestionValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      name: "",
      category: "",
      question: "",
    },
  });

  // Memoize all category options
  const allCategories = useMemo(
    () => [...predefinedCategories, ...customCategories],
    [customCategories],
  );

  // Organize categories with popular ones first
  const organizedCategories = useMemo(() => {
    const popularValues = popularCategories.map((cat) => cat.value);
    const nonPopular = allCategories.filter(
      (cat) => !popularValues.includes(cat.value),
    );

    return [...popularCategories, ...nonPopular];
  }, [allCategories]);

  // Simulate async category search (could be replaced with actual API call)
  const handleSearchCategories = useCallback(
    async (query: string): Promise<ComboboxOption[]> => {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 300));

      const filtered = organizedCategories.filter(
        (category) =>
          category.label.toLowerCase().includes(query.toLowerCase()) ||
          category.description?.toLowerCase().includes(query.toLowerCase()),
      );

      return filtered;
    },
    [organizedCategories],
  );

  const { handleSearch, loading: searchLoading } = useComboboxAsyncSearch(
    handleSearchCategories,
  );

  async function onSubmit(values: QuestionValues) {
    try {
      const result = await submitQuestion(values);

      if (result.success) {
        toast.success("Your question has been submitted successfully!");
        form.reset();

        // Call the callback to refresh the questions list
        if (onQuestionSubmitted) {
          onQuestionSubmitted();
        }
      } else {
        throw new Error("Submission failed");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit question. Please try again.");
    }
  }

  const handleCreateCategory = useCallback(
    async (newCategory: string) => {
      const trimmedCategory = newCategory.trim();
      if (!trimmedCategory) {
        toast.error("Category name cannot be empty");
        return;
      }

      const categoryExists = organizedCategories.some(
        (cat) => cat.label.toLowerCase() === trimmedCategory.toLowerCase(),
      );

      if (categoryExists) {
        toast.error("Category already exists");
        return;
      }

      const newCategoryOption: ComboboxOption = {
        value: trimmedCategory.toLowerCase().replace(/\s+/g, "-"),
        label: trimmedCategory,
        description: `Custom category: ${trimmedCategory}`,
      };

      try {
        setIsLoadingCategories(true);
        // Simulate API call to save category
        await new Promise((resolve) => setTimeout(resolve, 500));

        setCustomCategories((prev) => [...prev, newCategoryOption]);
        form.setValue("category", newCategoryOption.value);
        toast.success(`Category "${trimmedCategory}" added successfully!`);
      } catch (error) {
        console.error("Failed to create category:", error);
        toast.error("Failed to create category. Please try again.");
      } finally {
        setIsLoadingCategories(false);
      }
    },
    [organizedCategories, form],
  );

  // Custom render function for categories
  const renderCategoryOption = useCallback(
    (option: ComboboxOption) => (
      <div className="flex flex-col">
        <span className="font-medium">{option.label}</span>
        {option.description && (
          <span className="text-xs text-muted-foreground">
            {option.description}
          </span>
        )}
      </div>
    ),
    [],
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full"
      >
        {enableScrolling ? (
          <ScrollArea
            className="flex-1 -m-[3px]"
            variant="card"
            maskHeight={20}
          >
            <div className="space-y-6 pb-6 m-[3px]">
              {/* Name field */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name (optional)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Enter your name or leave blank for anonymous"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category combobox with enhanced features */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <FormControl>
                      <Combobox
                        options={organizedCategories}
                        value={field.value}
                        onValueChange={field.onChange}
                        allowCreate={true}
                        onCreateOption={handleCreateCategory}
                        loading={isLoadingCategories}
                        config={{
                          placeholder: "Select or search for a category",
                          searchPlaceholder: "Search categories...",
                          emptyMessage:
                            "No categories found. Try creating one!",
                          createButtonText: "Add new category",
                        }}
                        onSearch={handleSearch}
                        renderOption={renderCategoryOption}
                        clearable={true}
                        onClear={() => form.setValue("category", "")}
                        className="w-full"
                      />
                    </FormControl>
                    <div className="flex flex-wrap gap-1 mt-2 items-center">
                      <span className="text-xs text-muted-foreground">
                        Popular:
                      </span>
                      {popularCategories.slice(0, 3).map((category) => (
                        <Badge
                          key={category.value}
                          variant="outline"
                          className="text-xs cursor-pointer hover:bg-muted"
                          onClick={() =>
                            form.setValue("category", category.value)
                          }
                        >
                          {category.label}
                        </Badge>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Question textarea */}
              <FormField
                control={form.control}
                name="question"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question *</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Write your question in detail..."
                        rows={5}
                        className="resize-none"
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 5 characters required
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
        ) : (
          <div className="space-y-6">
            {/* Name field */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name (optional)</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Enter your name or leave blank for anonymous"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Category combobox with enhanced features */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Combobox
                      options={organizedCategories}
                      value={field.value}
                      onValueChange={field.onChange}
                      allowCreate={true}
                      onCreateOption={handleCreateCategory}
                      loading={isLoadingCategories}
                      config={{
                        placeholder: "Select or search for a category",
                        searchPlaceholder: "Search categories...",
                        emptyMessage: "No categories found. Try creating one!",
                        createButtonText: "Add new category",
                      }}
                      onSearch={handleSearch}
                      renderOption={renderCategoryOption}
                      clearable={true}
                      onClear={() => form.setValue("category", "")}
                      className="w-full"
                    />
                  </FormControl>
                  <div className="flex flex-wrap gap-1 mt-2 items-center">
                    <span className="text-xs text-muted-foreground">
                      Popular:
                    </span>
                    {popularCategories.slice(0, 3).map((category) => (
                      <Badge
                        key={category.value}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-muted"
                        onClick={() =>
                          form.setValue("category", category.value)
                        }
                      >
                        {category.label}
                      </Badge>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question textarea */}
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Write your question in detail..."
                      rows={5}
                      className="resize-none"
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 5 characters required
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        {/* Fixed submit button at bottom */}
        <div className={enableScrolling ? "pt-6 border-t" : "mt-6"}>
          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full"
          >
            {form.formState.isSubmitting ? "Submitting..." : "Submit Question"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
