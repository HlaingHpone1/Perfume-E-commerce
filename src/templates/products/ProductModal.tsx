"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Plus,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { Brand, Category, Note, Scent } from "@/generated/prisma/client";
import { createProduct, updateProduct } from "./action";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductModal } from "@/stores/use-product-modal";
import { ensureScent } from "@/templates/scent/action";
import { ensureNote } from "@/templates/note/action";
import { cn } from "@/utils";

type CategoryWithParent = Category & {
  parentCategory?: { id: string; name: string } | null;
};

type Option = { id: string; label: string };

enum GenderTarget {
  Men = "Men",
  Women = "Women",
  Unisex = "Unisex",
}

enum Concentration {
  EDT = "EDT",
  EDP = "EDP",
  Parfum = "Parfum",
  Extrait = "Extrait",
}

const emptyVariant = () => ({
  id: "",
  sku: "",
  name: "",
  concentration: Concentration.EDP,
  volumeMl: 100,
  price: 0,
  reorderPoint: 10,
  isTester: false,
  weightGrams: undefined as number | undefined,
});

const variantSchema = z
  .object({
    id: z.string().optional(),
    sku: z.string(),
    name: z.string(),
    concentration: z.nativeEnum(Concentration),
    volumeMl: z.coerce.number().min(1, "Volume required"),
    price: z.coerce.number().min(0, "Price required"),
    reorderPoint: z.coerce.number().min(0).default(0),
    isTester: z.boolean().default(false),
    weightGrams: z.preprocess(
      (val) =>
        val === "" || val === null || val === undefined
          ? undefined
          : Number(val),
      z.number().optional(),
    ),
  })
  .superRefine((v, ctx) => {
    const blank = !v.sku.trim() && !v.name.trim();
    if (blank) return;
    if (!v.sku.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "SKU required",
        path: ["sku"],
      });
    }
    if (!v.name.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Name required",
        path: ["name"],
      });
    }
  });

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  scentId: z.string().optional(),
  genderTarget: z.nativeEnum(GenderTarget).optional().or(z.literal("")),
  topNoteIds: z.array(z.string()),
  middleNoteIds: z.array(z.string()),
  baseNoteIds: z.array(z.string()),
  variants: z.array(variantSchema),
});

type FormValues = z.infer<typeof formSchema>;

interface ProductModalProps {
  brands: Brand[];
  categories: CategoryWithParent[];
  scents: Scent[];
  notes: Note[];
}

function categoryLabel(c: CategoryWithParent) {
  return c.parentCategory
    ? `${c.parentCategory.name} / ${c.name}`
    : c.name;
}

export const ProductModal = ({
  brands,
  categories,
  scents,
  notes,
}: ProductModalProps) => {
  const { isOpen, onClose, data } = useProductModal();
  const [loading, startTransition] = useTransition();
  const [creating, startCreate] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [scentOptions, setScentOptions] = useState<Option[]>([]);
  const [noteOptions, setNoteOptions] = useState<Option[]>([]);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [scentOpen, setScentOpen] = useState(false);
  const [scentQuery, setScentQuery] = useState("");
  const [topOpen, setTopOpen] = useState(false);
  const [topQuery, setTopQuery] = useState("");
  const [middleOpen, setMiddleOpen] = useState(false);
  const [middleQuery, setMiddleQuery] = useState("");
  const [baseOpen, setBaseOpen] = useState(false);
  const [baseQuery, setBaseQuery] = useState("");

  const categoryOptions = useMemo(
    () =>
      categories
        .map((c) => ({ id: c.id, label: categoryLabel(c) }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    [categories],
  );

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      brandId: "",
      categoryId: "",
      scentId: "",
      genderTarget: "",
      topNoteIds: [],
      middleNoteIds: [],
      baseNoteIds: [],
      variants: [emptyVariant()],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "variants",
  });

  // Only reset form when the modal opens or the edited product changes —
  // not when scents/notes lists refresh after ensureScent/ensureNote.
  useEffect(() => {
    if (!isOpen) return;

    setScentOptions(
      scents
        .map((s) => ({ id: s.id, label: s.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    );
    setNoteOptions(
      notes
        .map((n) => ({ id: n.id, label: n.title }))
        .sort((a, b) => a.label.localeCompare(b.label)),
    );
    setCategoryQuery("");
    setScentQuery("");
    setTopQuery("");
    setMiddleQuery("");
    setBaseQuery("");

    const productNotes = data?.productNotes ?? [];
    const variants =
      data?.variants?.map((v) => ({
        id: v.id,
        sku: v.sku,
        name: v.name,
        concentration: v.concentration as Concentration,
        volumeMl: v.volumeMl,
        price: v.price,
        reorderPoint: v.reorderPoint,
        isTester: v.isTester,
        weightGrams: v.weightGrams ?? undefined,
      })) ?? [emptyVariant()];

    form.reset({
      name: data?.name || "",
      description: data?.description || "",
      brandId: data?.brandId || "",
      categoryId: data?.categoryId || "",
      scentId: data?.scentId || "",
      genderTarget: (data?.genderTarget as GenderTarget | null) || "",
      topNoteIds: productNotes
        .filter((n) => n.type === "Top")
        .map((n) => n.noteId),
      middleNoteIds: productNotes
        .filter((n) => n.type === "Middle")
        .map((n) => n.noteId),
      baseNoteIds: productNotes
        .filter((n) => n.type === "Base")
        .map((n) => n.noteId),
      variants: variants.length ? variants : [emptyVariant()],
    });
    setPreview(null);
    setFile(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: don't reset on scents/notes refresh
  }, [isOpen, data, form]);

  // Merge newly created catalog items into option lists without touching form values.
  useEffect(() => {
    if (!isOpen) return;
    setScentOptions((prev) => {
      const fromServer = scents.map((s) => ({ id: s.id, label: s.title }));
      const map = new Map(fromServer.map((o) => [o.id, o]));
      for (const o of prev) if (!map.has(o.id)) map.set(o.id, o);
      return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
    });
    setNoteOptions((prev) => {
      const fromServer = notes.map((n) => ({ id: n.id, label: n.title }));
      const map = new Map(fromServer.map((o) => [o.id, o]));
      for (const o of prev) if (!map.has(o.id)) map.set(o.id, o);
      return [...map.values()].sort((a, b) => a.label.localeCompare(b.label));
    });
  }, [isOpen, scents, notes]);

  const onSubmit = (values: FormValues) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("brandId", values.brandId);
      formData.append("categoryId", values.categoryId);
      if (values.scentId) formData.append("scentId", values.scentId);
      if (values.genderTarget)
        formData.append("genderTarget", values.genderTarget);
      values.topNoteIds.forEach((id) => formData.append("topNoteIds", id));
      values.middleNoteIds.forEach((id) =>
        formData.append("middleNoteIds", id),
      );
      values.baseNoteIds.forEach((id) => formData.append("baseNoteIds", id));
      const variants = values.variants.filter(
        (v) => v.sku.trim().length > 0 || v.name.trim().length > 0,
      );
      formData.append(
        "variants",
        JSON.stringify(
          variants.map((v) => ({
            id: v.id || undefined,
            sku: v.sku.trim(),
            name: v.name.trim(),
            concentration: v.concentration,
            volumeMl: Number(v.volumeMl),
            price: Number(v.price),
            reorderPoint: Number(v.reorderPoint ?? 0),
            isTester: Boolean(v.isTester),
            weightGrams:
              v.weightGrams === undefined || v.weightGrams === null
                ? null
                : Number(v.weightGrams),
          })),
        ),
      );
      if (file) formData.append("image", file);

      const result = data
        ? await updateProduct(data.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload className="mb-1 h-8 w-8" />
                    <span className="text-xs">Upload Image</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => {
                  const selected = categoryOptions.find(
                    (o) => o.id === field.value,
                  );
                  const q = categoryQuery.trim().toLowerCase();
                  const filtered = q
                    ? categoryOptions.filter((o) =>
                        o.label.toLowerCase().includes(q),
                      )
                    : categoryOptions;
                  return (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Popover
                        open={categoryOpen}
                        onOpenChange={setCategoryOpen}
                        modal
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal"
                            >
                              <span className="truncate">
                                {selected?.label || "Select category"}
                              </span>
                              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" collisionPadding={8}>
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search categories…"
                              value={categoryQuery}
                              onValueChange={setCategoryQuery}
                            />
                            <CommandList>
                              <CommandEmpty>No results</CommandEmpty>
                              <CommandGroup>
                                {filtered.map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={option.id}
                                    onSelect={() => {
                                      field.onChange(option.id);
                                      setCategoryOpen(false);
                                      setCategoryQuery("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 size-4",
                                        field.value === option.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="truncate">
                                      {option.label}
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scentId"
                render={({ field }) => {
                  const selected = scentOptions.find(
                    (o) => o.id === field.value,
                  );
                  const trimmed = scentQuery.trim();
                  const q = trimmed.toLowerCase();
                  const filtered = q
                    ? scentOptions.filter((o) =>
                        o.label.toLowerCase().includes(q),
                      )
                    : scentOptions;
                  const exactMatch = scentOptions.some(
                    (o) => o.label.toLowerCase() === q,
                  );
                  return (
                    <FormItem>
                      <FormLabel>Scent Family</FormLabel>
                      <Popover
                        open={scentOpen}
                        onOpenChange={setScentOpen}
                        modal
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              type="button"
                              variant="outline"
                              role="combobox"
                              className="w-full justify-between font-normal"
                            >
                              <span className="truncate">
                                {selected?.label || "Select scent"}
                              </span>
                              <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="p-0" collisionPadding={8}>
                          <Command shouldFilter={false}>
                            <CommandInput
                              placeholder="Search or create scent…"
                              value={scentQuery}
                              onValueChange={setScentQuery}
                            />
                            <CommandList>
                              <CommandEmpty>
                                {trimmed
                                  ? "No match — create below"
                                  : "No results"}
                              </CommandEmpty>
                              <CommandGroup>
                                {field.value ? (
                                  <CommandItem
                                    value="__clear__"
                                    onSelect={() => {
                                      field.onChange("");
                                      setScentOpen(false);
                                      setScentQuery("");
                                    }}
                                  >
                                    Clear selection
                                  </CommandItem>
                                ) : null}
                                {filtered.map((option) => (
                                  <CommandItem
                                    key={option.id}
                                    value={option.id}
                                    onSelect={() => {
                                      field.onChange(option.id);
                                      setScentOpen(false);
                                      setScentQuery("");
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 size-4",
                                        field.value === option.id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="truncate">
                                      {option.label}
                                    </span>
                                  </CommandItem>
                                ))}
                                {trimmed && !exactMatch ? (
                                  <CommandItem
                                    value={`__create__${trimmed}`}
                                    disabled={creating}
                                    onSelect={() => {
                                      startCreate(async () => {
                                        const result =
                                          await ensureScent(trimmed);
                                        if (!result.success) {
                                          toast.error(
                                            result.error ||
                                              "Failed to create scent",
                                          );
                                          return;
                                        }
                                        const item = {
                                          id: result.scent.id,
                                          label: result.scent.title,
                                        };
                                        setScentOptions((prev) =>
                                          prev.some((o) => o.id === item.id)
                                            ? prev
                                            : [...prev, item].sort((a, b) =>
                                                a.label.localeCompare(b.label),
                                              ),
                                        );
                                        field.onChange(item.id);
                                        setScentOpen(false);
                                        setScentQuery("");
                                      });
                                    }}
                                  >
                                    {creating ? (
                                      <Loader2 className="mr-2 size-4 animate-spin" />
                                    ) : (
                                      <Plus className="mr-2 size-4" />
                                    )}
                                    Create “{trimmed}”
                                  </CommandItem>
                                ) : null}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="genderTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Target</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        <SelectItem value={GenderTarget.Men}>Men</SelectItem>
                        <SelectItem value={GenderTarget.Women}>
                          Women
                        </SelectItem>
                        <SelectItem value={GenderTarget.Unisex}>
                          Unisex
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Fragrance Notes</h4>
              {(
                [
                  {
                    name: "topNoteIds" as const,
                    label: "Top Notes",
                    open: topOpen,
                    setOpen: setTopOpen,
                    query: topQuery,
                    setQuery: setTopQuery,
                    placeholder: "Add top notes",
                  },
                  {
                    name: "middleNoteIds" as const,
                    label: "Middle / Heart Notes",
                    open: middleOpen,
                    setOpen: setMiddleOpen,
                    query: middleQuery,
                    setQuery: setMiddleQuery,
                    placeholder: "Add middle notes",
                  },
                  {
                    name: "baseNoteIds" as const,
                    label: "Base Notes",
                    open: baseOpen,
                    setOpen: setBaseOpen,
                    query: baseQuery,
                    setQuery: setBaseQuery,
                    placeholder: "Add base notes",
                  },
                ] as const
              ).map((noteField) => (
                <FormField
                  key={noteField.name}
                  control={form.control}
                  name={noteField.name}
                  render={({ field }) => {
                    const selected = noteOptions.filter((o) =>
                      field.value.includes(o.id),
                    );
                    const trimmed = noteField.query.trim();
                    const q = trimmed.toLowerCase();
                    const filtered = q
                      ? noteOptions.filter((o) =>
                          o.label.toLowerCase().includes(q),
                        )
                      : noteOptions;
                    const exactMatch = noteOptions.some(
                      (o) => o.label.toLowerCase() === q,
                    );
                    const toggle = (id: string) => {
                      if (field.value.includes(id)) {
                        field.onChange(field.value.filter((v) => v !== id));
                      } else {
                        field.onChange([...field.value, id]);
                      }
                    };
                    return (
                      <FormItem>
                        <FormLabel className="text-xs">
                          {noteField.label}
                        </FormLabel>
                        {selected.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {selected.map((item) => (
                              <span
                                key={item.id}
                                className="bg-secondary text-secondary-foreground inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
                              >
                                {item.label}
                                <button
                                  type="button"
                                  className="hover:text-foreground"
                                  onClick={() => toggle(item.id)}
                                  aria-label={`Remove ${item.label}`}
                                >
                                  <X className="size-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        ) : null}
                        <Popover
                          open={noteField.open}
                          onOpenChange={noteField.setOpen}
                          modal
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between font-normal"
                              >
                                <span className="text-muted-foreground truncate">
                                  {noteField.placeholder}
                                </span>
                                <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="p-0"
                            collisionPadding={8}
                          >
                            <Command shouldFilter={false}>
                              <CommandInput
                                placeholder="Search or create note…"
                                value={noteField.query}
                                onValueChange={noteField.setQuery}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  {trimmed
                                    ? "No match — create below"
                                    : "No results"}
                                </CommandEmpty>
                                <CommandGroup>
                                  {filtered.map((option) => {
                                    const checked = field.value.includes(
                                      option.id,
                                    );
                                    return (
                                      <CommandItem
                                        key={option.id}
                                        value={option.id}
                                        onSelect={() => toggle(option.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 size-4",
                                            checked
                                              ? "opacity-100"
                                              : "opacity-0",
                                          )}
                                        />
                                        <span className="truncate">
                                          {option.label}
                                        </span>
                                      </CommandItem>
                                    );
                                  })}
                                  {trimmed && !exactMatch ? (
                                    <CommandItem
                                      value={`__create__${trimmed}`}
                                      disabled={creating}
                                      onSelect={() => {
                                        startCreate(async () => {
                                          const result =
                                            await ensureNote(trimmed);
                                          if (!result.success) {
                                            toast.error(
                                              result.error ||
                                                "Failed to create note",
                                            );
                                            return;
                                          }
                                          const item = {
                                            id: result.note.id,
                                            label: result.note.title,
                                          };
                                          setNoteOptions((prev) =>
                                            prev.some((o) => o.id === item.id)
                                              ? prev
                                              : [...prev, item].sort((a, b) =>
                                                  a.label.localeCompare(
                                                    b.label,
                                                  ),
                                                ),
                                          );
                                          const current = form.getValues(
                                            noteField.name,
                                          );
                                          if (!current.includes(item.id)) {
                                            field.onChange([
                                              ...current,
                                              item.id,
                                            ]);
                                          }
                                          noteField.setQuery("");
                                        });
                                      }}
                                    >
                                      {creating ? (
                                        <Loader2 className="mr-2 size-4 animate-spin" />
                                      ) : (
                                        <Plus className="mr-2 size-4" />
                                      )}
                                      Create “{trimmed}”
                                    </CommandItem>
                                  ) : null}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Variants</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append(emptyVariant())}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Add variant
                </Button>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="space-y-3 rounded-md border p-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                      Variant {index + 1}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <FormField
                    control={form.control}
                    name={`variants.${index}.id`}
                    render={({ field: f }) => (
                      <input type="hidden" {...f} value={f.value ?? ""} />
                    )}
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.sku`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="PROD-100" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.name`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Name</FormLabel>
                          <FormControl>
                            <Input placeholder="100ml Bottle" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.concentration`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Concentration
                          </FormLabel>
                          <Select
                            onValueChange={f.onChange}
                            value={f.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Object.values(Concentration).map((c) => (
                                <SelectItem key={c} value={c}>
                                  {c}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.volumeMl`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Volume (ml)</FormLabel>
                          <FormControl>
                            <Input type="number" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.price`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">Price ($)</FormLabel>
                          <FormControl>
                            <Input type="number" step="0.01" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name={`variants.${index}.weightGrams`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Weight (g){" "}
                            <span className="text-muted-foreground">
                              optional
                            </span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              value={f.value ?? ""}
                              onChange={f.onChange}
                              onBlur={f.onBlur}
                              name={f.name}
                              ref={f.ref}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`variants.${index}.reorderPoint`}
                      render={({ field: f }) => (
                        <FormItem>
                          <FormLabel className="text-xs">
                            Reorder Point
                          </FormLabel>
                          <FormControl>
                            <Input type="number" {...f} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name={`variants.${index}.isTester`}
                    render={({ field: f }) => (
                      <FormItem className="flex flex-row items-center gap-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={f.value}
                            onCheckedChange={f.onChange}
                          />
                        </FormControl>
                        <FormLabel className="text-xs font-normal">
                          Is Tester?
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
