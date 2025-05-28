import axios from "axios";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";

type ZohoLead = {
  id: string;
  [key: string]: any;
};

type ZohoResponse = {
  data: ZohoLead[];
  info?: any;
};

let accessToken = "";
let tokenExpiry = 0;

export async function refreshAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.ZOHO_REFRESH_TOKEN!,
    client_id: process.env.ZOHO_CLIENT_ID!,
    client_secret: process.env.ZOHO_CLIENT_SECRET!,
    grant_type: "refresh_token",
  });

  const res = await axios.post(
    `${process.env.ZOHO_REFRESH_TOKEN_URL}?${params.toString()}`
  );

  if (res.status !== 200) {
    throw new Error("Failed to refresh access token");
  }

  const data = res.data;
  accessToken = data.access_token;
  tokenExpiry = Date.now() + data.expires_in * 1000;
}

export async function getValidAccessToken() {
  if (!accessToken || Date.now() > tokenExpiry - 5 * 60 * 1000) {
    await refreshAccessToken();
  }
  return accessToken;
}

export async function POST(req: NextRequest) {
  const token = await getValidAccessToken();
  console.log("🚀 ~ GET ~ token:", token);

  const data = await req.json();
  console.log("Received data:", data);

  if (!token || !process.env.ZOHO_ORG_ID) {
    return NextResponse.json(
      { error: "Missing access token or organization ID" },
      { status: 500 }
    );
  }

  try {
    const { date, source } = data;
    const from = dayjs(date).startOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
    const to = dayjs(date).endOf("day").format("YYYY-MM-DDTHH:mm:ssZ");
    const criteria = `(Meeting_Time:between:${from},${to}) and (Lead_Source:equals:${source})`;
    console.log("🚀 ~ POST ~ criteria:", criteria);
    const response = await axios.get<ZohoResponse>(
      `https://www.zohoapis.com/crm/v6/Leads/search?criteria=${encodeURIComponent(
        criteria
      )}`,
      {
        headers: {
          Authorization: `Zoho-oauthtoken ${token}`,
          "X-CRM-ORG": process.env.ZOHO_ORG_ID,
        },
      }
    );
    return NextResponse.json(response.data, { status: 200 });
  } catch (error: any) {
    console.error(
      "Error fetching leads:",
      error.response?.data || error.message
    );
    return NextResponse.json(
      { error: "Failed to fetch leads" },
      { status: error.response?.status || 500 }
    );
  }
}
