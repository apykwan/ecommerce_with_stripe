"use server";

import { Resend } from "resend";
import { z } from "zod";

import db from "@/db";
// import OrderHistoryEmail from "@/email/OrderHistory";

const emailSchema = z.string().email()
const resend = new Resend(process.env.RESEND_API_KEY as string)

export async function emailOrderHistory() {
  
}
 