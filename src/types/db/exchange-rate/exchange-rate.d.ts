import type { Database } from "../database.types";

export type ExchangeRateRow =
	Database["op3dcloud"]["Tables"]["exchange_rate"]["Row"];

export type ExchangeRateInsert =
	Database["op3dcloud"]["Tables"]["exchange_rate"]["Insert"];
