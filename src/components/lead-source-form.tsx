"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { leadSources } from "@/lib/data";
import { useFormContext } from "react-hook-form";

export default function LeadSourceForm() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Lead Sources</h2>

      <FormField
        control={form.control}
        name="leadSource"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Lead Source</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl className="w-full">
                <SelectTrigger>
                  <SelectValue placeholder="Select lead source" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {leadSources.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
