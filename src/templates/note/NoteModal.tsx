"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNoteModal } from "@/stores/use-note-modal";
import { createNote, updateNote } from "./action";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const noteSchema = z.object({
  title: z.string().min(1, "Title is required"),
  image: z.any().optional(),
});

type FormValues = z.infer<typeof noteSchema>;

export const NoteModal = () => {
  const { isOpen, onClose, data } = useNoteModal();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(noteSchema),
    defaultValues: { title: "" },
  });

  useEffect(() => {
    if (data) {
      form.reset({ title: data.title });
      setPreview(data.attachments?.[0]?.fileUrl ?? null);
    } else {
      form.reset({ title: "" });
      setPreview(null);
    }
  }, [data, isOpen, form]);

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", values.title);
      if (values.image instanceof File) {
        formData.append("image", values.image);
      }

      const result = data
        ? await updateNote(data.id, formData)
        : await createNote(formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Note" : "Create Note"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Bergamot" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="image"
              render={({ field: { onChange, value: _value, ...field } }) => (
                <FormItem>
                  <FormLabel>Image</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      {...field}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        onChange(file);
                        if (file) setPreview(URL.createObjectURL(file));
                      }}
                    />
                  </FormControl>
                  {preview && (
                    <div className="relative mt-2 h-24 w-24 overflow-hidden rounded border">
                      <Image
                        src={preview}
                        alt="Preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Save" : "Create"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
