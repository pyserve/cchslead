import { google } from "googleapis";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

const SERVICE_ACCOUNT_EMAIL = process.env.SERVICE_ACCOUNT_EMAIL;
const SERVICE_ACCOUNT_PRIVATE_KEY =
  process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n");
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID;

if (
  !SERVICE_ACCOUNT_EMAIL ||
  !SERVICE_ACCOUNT_PRIVATE_KEY ||
  !DRIVE_FOLDER_ID
) {
  throw new Error(
    "Missing environment variables. Ensure SERVICE_ACCOUNT_EMAIL, SERVICE_ACCOUNT_PRIVATE_KEY, and DRIVE_FOLDER_ID are set."
  );
}

async function uploadFileToDrive(
  file: {
    filename: string;
    mimetype: string;
    data: Buffer | Readable;
  },
  drive: any,
  folderId: string,
  onProgress?: (progress: { bytesRead: number; totalBytes: number }) => void // Add onProgress
) {
  try {
    const fileMetadata = {
      name: file.filename,
      parents: [folderId],
    };
    let mediaBody: any;

    if (file.data instanceof Buffer) {
      mediaBody = Readable.from(file.data);
    } else {
      mediaBody = file.data;
    }

    const response = await drive.files.create(
      {
        requestBody: fileMetadata,
        media: {
          mimeType: file.mimetype,
          body: mediaBody,
        },
        fields: "id, webViewLink",
        // Enable progress reporting.
      },
      {
        onUploadProgress: (evt: any) => {
          if (onProgress) {
            onProgress({
              bytesRead: evt.bytesRead,
              totalBytes: evt.total,
            });
          }
        },
      }
    );

    if (response.status !== 200) {
      console.error(
        "Error uploading file:",
        response.statusText,
        response.data
      );
      throw new Error(`Failed to upload file: ${response.statusText}`);
    }
    return {
      id: response.data.id,
      webViewLink: response.data.webViewLink,
    };
  } catch (error: any) {
    console.error("Error uploading file to Google Drive:", error);
    throw error;
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: SERVICE_ACCOUNT_EMAIL,
        private_key: SERVICE_ACCOUNT_PRIVATE_KEY,
      },
      scopes: ["https://www.googleapis.com/auth/drive.file"],
    });
    const client: any = await auth.getClient();
    const drive = google.drive({ version: "v3", auth: client });

    const formData = await req.formData();
    const fileField = formData.get("file");

    if (!fileField) {
      return NextResponse.json({ error: "File is required." }, { status: 400 });
    }

    if (!(fileField instanceof Blob)) {
      return NextResponse.json(
        { error: "Invalid file type." },
        { status: 400 }
      );
    }
    const buffer = await fileField.arrayBuffer();

    const fileData = {
      filename: fileField.name,
      mimetype: fileField.type,
      data: Buffer.from(buffer), // Pass the buffer directly
    };

    const uploadedFile = await uploadFileToDrive(
      fileData,
      drive,
      DRIVE_FOLDER_ID!,
      (progress) => {
        //  progress callback
        // IMPORTANT:  DO NOT SEND THE ENTIRE FILE DATA HERE.
        //  Instead, just send the progress.
        console.log("Upload Progress:", progress);
        //  You could optionally send this progress to the client if needed.
      }
    );

    return NextResponse.json(
      {
        message: "File uploaded successfully!",
        fileId: uploadedFile.id,
        webViewLink: uploadedFile.webViewLink,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to upload file" },
      { status: 500 }
    );
  }
}
