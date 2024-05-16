import type { AccountView } from "near-api-js/lib/providers/provider";

export interface Message {
  id: string;
  premium_attached: string;
  message: string;
}

export type Account = AccountView & {
  account_id: string;
};