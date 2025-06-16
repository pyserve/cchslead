"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { leadTypes } from "@/lib/data";
import axios from "axios";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { FileUploadField } from "./file-upload-field";
import { AddressAutoComplete } from "./google-address-inputv2";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

export default function AddressForm() {
  const form = useFormContext();
  const values = form.watch();
  const [timeOptions, setTimeOptions] = useState(
    Array.from({ length: 6 }, (_, i) => {
      const startHour = 9 + i * 2;
      const endHour = startHour + 2;

      const formatHour = (hour: number) =>
        hour.toString().padStart(2, "0") + ":00";

      return {
        value: formatHour(startHour),
        label: `${formatHour(startHour)} - ${formatHour(endHour)}`,
        disabled: false,
        startHour,
        endHour,
      };
    })
  );

  useEffect(() => {
    const fetchAPI = async () => {
      const response = await axios.post("/api/leads/", {
        date: values.meetingDate,
        source: values.leadSource,
      });
      const serverTimes =
        response.data?.data?.map(
          (d: any) => dayjs(d.Meeting_Time).format("HH") + ":00"
        ) || [];

      const bookingCount: Record<string, number> = {};

      timeOptions.forEach(({ value, startHour, endHour }) => {
        bookingCount[value] = 0;
        serverTimes.forEach((time: any) => {
          const [hourStr] = time.split(":");
          const hour = parseInt(hourStr, 10);
          if (hour >= startHour && hour < endHour) bookingCount[value]++;
        });
      });
      console.log("🚀 ~ timeOptions.forEach ~ bookingCount:", bookingCount);

      setTimeOptions((prevOptions) =>
        prevOptions.map((slot) => ({
          ...slot,
          disabled: (bookingCount[slot.value] || 0) >= 4,
        }))
      );
    };
    if (values.leadSource && values.meetingDate) {
      fetchAPI();
      form.setValue("meetingTime", "");
    }
  }, [values.leadSource, values.meetingDate]);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">
        Location & Additional Information
      </h2>

      <FormField
        control={form.control}
        name="fullAddress"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Address</FormLabel>
            <FormControl>
              <AddressAutoComplete
                value={field.value}
                displayName={field.value}
                onAddressSelected={(value) => {
                  form.setValue(field?.name, value.fullAddress);
                  form.setValue("streetAddress", value.street);
                  form.setValue("city", value.city);
                  form.setValue("state", value.state);
                  form.setValue("zipCode", value.postalCode);
                  form.setValue("country", value.country);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="streetAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Mains St" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel>City</FormLabel>
              <FormControl>
                <Input placeholder="Toronto" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={form.control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel>State</FormLabel>
              <FormControl>
                <Input placeholder="ON" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="zipCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zip Code</FormLabel>
              <FormControl>
                <Input placeholder="M2H 1J2" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Country</FormLabel>
              <FormControl>
                <Input placeholder="Canada" {...field} disabled />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="col-span-1 sm:col-span-2">
          <FormField
            control={form.control}
            name="meetingDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Meeting Date</FormLabel>

                <input
                  {...field}
                  type="date"
                  className="border p-2 py-1.5 rounded-md shadow-sm text-gray-700 text-sm"
                />
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <FormField
            control={form.control}
            name="meetingTime"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Preferred Time</FormLabel>

                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select Time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((option) => (
                      <SelectItem
                        disabled={option.disabled}
                        key={option.value}
                        value={option.value}
                      >
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <FormField
            control={form.control}
            name="leadType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lead Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value ?? ""}
                >
                  <FormControl className="w-full">
                    <SelectTrigger>
                      <SelectValue placeholder="Select a lead type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {leadTypes.map((type) => (
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
      </div>
      <FormField
        control={form.control}
        name="file"
        render={({ field }) => (
          <FileUploadField onChange={field.onChange} value={field.value} />
        )}
      />
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
