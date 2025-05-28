"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";

import AddressForm from "@/components/address-form";
import ContactInfoForm from "@/components/contact-info-form";
import { AlertDialog } from "@/components/form-submitted-dialog";
import LeadSourceForm from "@/components/lead-source-form";
import ProgressBar from "@/components/progress-bar";
import { useAppStore } from "@/hooks/store";
import { getRequiredFields, prepareFormData } from "@/lib/utils";
import type { Values } from "@/schemas";
import { formSchema } from "@/schemas/form-schema";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("lead-source");
  const { progress, setProgress } = useAppStore();
  const [IsSubmitting, setIsSubmitting] = useState(false);
  const form = useForm({
    resolver: zodResolver(formSchema),
  });
  const values = form.watch();
  const requiredFields = getRequiredFields(formSchema);

  const { totalFields, filledFields } = useMemo(() => {
    const total = requiredFields.length;
    const filled = requiredFields.filter((key: string) => {
      const value = values?.[key as keyof Values];
      return value !== undefined && value !== null && value !== "";
    }).length;
    return { totalFields: total, filledFields: filled };
  }, [values]);

  useEffect(() => {
    const percentage =
      totalFields === 0 ? 0 : Math.round((filledFields / totalFields) * 100);
    setProgress(percentage);
  }, [filledFields, totalFields]);

  const onSubmit = async (data: any) => {
    console.log("🚀 ~ onSubmit ~ data:", data);
    setIsSubmitting(true);
    try {
      const formData = await prepareFormData(data);
      if (data.file) {
        const fileFormData = new FormData();
        fileFormData.append("file", data.file);
        const res = await axios.post("/api/upload", fileFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("🚀 ~ onSubmit ~ res:", res);
        if (res.data) {
          formData.append("fileURL", res.data?.webViewLink);
          toast.success(res.data?.message || "File uploaded successfully!");
        }
      }
      const response = await axios.post(
        "https://hooks.zapier.com/hooks/catch/7641205/2jgfs36/",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 200) {
        console.log("🚀 ~ Submit Successful:", response.data);
        toast.success("Form submitted successfully!");
      } else {
        throw new Error("Unexpected response status: " + response.status);
      }
      setTimeout(() => {
        router.push("/submission");
      }, 500);
      form.reset();
    } catch (error: any) {
      console.error("🚀 ~ onSubmit ~ error:", error);
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToNextTab = () => {
    if (activeTab === "lead-source") {
      form.trigger("leadSource").then((isValid) => {
        if (isValid) setActiveTab("contact-info");
      });
    } else if (activeTab === "contact-info") {
      form
        .trigger(["firstName", "lastName", "email", "mobileNumber"])
        .then((isValid) => {
          if (isValid) setActiveTab("address-info");
        });
    }
  };

  const goToPreviousTab = () => {
    if (activeTab === "contact-info") {
      setActiveTab("lead-source");
    } else if (activeTab === "address-info") {
      setActiveTab("contact-info");
    }
  };
  console.log(form.formState.errors);

  return (
    <div className="mx-auto py-10 px-2 max-w-4xl ">
      <AlertDialog
        title="Form Submitted"
        description="Your form has been successfully submitted."
        btnName="Submit Another"
        btnAction={() => window.location.reload()}
      />
      <Card>
        <CardHeader className="text-center sticky top-0 z-1 bg-white shadow-sm">
          <CardTitle className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 tracking-tight">
            Lead Generation Form
          </CardTitle>
          <ProgressBar progress={progress} />
        </CardHeader>
        <CardContent className="">
          <div className="mb-8 ">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="">
              <TabsList className="grid grid-cols-3 gap-4 mb-8 w-full h-15">
                <TabsTrigger
                  value="lead-source"
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white">
                    1
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-medium">First</span>
                    <span className="text-sm text-muted-foreground">
                      Lead Source
                    </span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="contact-info"
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white">
                    2
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-medium">Second</span>
                    <span className="text-sm text-muted-foreground">
                      Customer Info
                    </span>
                  </div>
                </TabsTrigger>

                <TabsTrigger
                  value="address-info"
                  className="flex items-center gap-2"
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-teal-600 text-white">
                    3
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                    <span className="font-medium">Third</span>
                    <span className="text-sm text-muted-foreground">
                      Address & Meeting
                    </span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <FormProvider {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                  <TabsContent value="lead-source">
                    <LeadSourceForm />
                    <div className="flex justify-end mt-6">
                      <Button type="button" onClick={goToNextTab} className="">
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="contact-info">
                    <ContactInfoForm />
                    <div className="flex justify-between mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousTab}
                      >
                        Previous
                      </Button>
                      <Button type="button" onClick={goToNextTab} className="">
                        Next
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="address-info">
                    <AddressForm />
                    <div className="flex justify-between mt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={goToPreviousTab}
                      >
                        Previous
                      </Button>
                      <Button
                        type="submit"
                        variant="default"
                        disabled={IsSubmitting}
                      >
                        {IsSubmitting ? (
                          <div className="flex items-center">
                            <Loader2 className="mr-2 animate-spin" size={20} />
                            Submitting
                          </div>
                        ) : (
                          "Submit"
                        )}
                      </Button>
                    </div>
                  </TabsContent>
                </form>
              </FormProvider>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
