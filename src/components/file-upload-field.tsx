import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { FileCheckIcon, Trash } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadFieldProps {
  onChange: (file: File | null) => void;
  value?: File | null;
}

export function FileUploadField({ onChange, value }: FileUploadFieldProps) {
  const [fileName, setFileName] = useState<string | null>(value?.name || null);
  const [filePreview, setFilePreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      onChange(file);
      setFileName(file.name);
      const reader = new FileReader();
      if (file.type.startsWith("image")) {
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        reader.onloadend = () => {};
        reader.readAsArrayBuffer(file);
        setFilePreview(null);
      }
    },

    [onChange]
  );

  const clearFile = () => {
    onChange(null);
    setFileName(null);
    setFilePreview(null);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "application/*": [],
      "image/*": [],
      "audio/*": [],
      "video/*": [],
      "text/*": [],
    },
  });

  useEffect(() => {
    if (value?.name !== fileName) {
      setFileName(value?.name || null);
      setFilePreview(null);
    }
  }, [value, fileName]);

  return (
    <FormItem>
      <div className="flex justify-between items-center">
        <FormLabel>Upload File</FormLabel>
        {fileName && (
          <div className="text-center">
            <Button
              variant="destructive"
              size={"sm"}
              type="button"
              onClick={clearFile}
            >
              <Trash className="mr-2 h-4 w-4" />
              Clear File
            </Button>
          </div>
        )}
      </div>
      <FormControl>
        <div className="space-y-2">
          <div
            {...getRootProps()}
            className={`border border-dashed border-gray-400 p-6 rounded-md cursor-pointer text-center ${
              fileName ? "bg-green-100" : ""
            }`}
          >
            <input {...getInputProps()} />
            {isDragActive ? (
              <p>Drop the file here ...</p>
            ) : (
              <p>
                {fileName ? (
                  <div className="flex items-center justify-center font-bold text-sm">
                    <FileCheckIcon className="mr-2 h-4 w-4 text-green-600" />
                    <span>{fileName}</span>
                  </div>
                ) : (
                  "Drag & drop or click to select file"
                )}
              </p>
            )}
          </div>

          {/* {filePreview && (
            <div>
              <img
                src={filePreview}
                alt="File Preview"
                className="w-[100px] rounded-md"
              />
            </div>
          )} */}
          {fileName && !filePreview && (
            <p className="text-sm text-gray-500">
              Preview not available for this file type.
            </p>
          )}
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}
