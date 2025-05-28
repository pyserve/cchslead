import { getValidAccessToken } from "@/lib/zoho";
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
