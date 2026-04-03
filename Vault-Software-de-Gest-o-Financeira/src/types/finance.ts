import type { PropsWithChildren, ReactNode } from "react";
import type { IconType } from "react-icons";

export type EntityId = string | number;
export type TransactionType = "expense" | "income" | "investment";
export type TransactionFilter = "all" | "card" | TransactionType;
export type PaymentMethod =
  | ""
  | "dinheiro"
  | "pix"
  | "debito"
  | "credito"
  | "boleto";

export interface Category {
  id: string;
  label: string;
  icon: string;
  color: string;
  custom: boolean;
}

export interface CategoryForm {
  label: string;
  icon: string;
  color: string;
}

export interface Transaction {
  id: EntityId;
  desc: string;
  value: number;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod | string;
  cardId: EntityId | "";
  accountId: EntityId | "";
  date: string;
  received?: boolean;
  paid?: boolean;
}

export interface TransactionForm {
  desc: string;
  value: string;
  type: TransactionType;
  category: string;
  paymentMethod: PaymentMethod | string;
  cardId: EntityId | "";
  accountId: EntityId | "";
  date: string;
  received: boolean;
  paid: boolean;
}

export interface CardForm {
  name: string;
  digits: string;
  flag: string;
  limit: string;
  balance: string;
  due: string;
  gradIdx: number;
}

export interface Card {
  id: EntityId;
  name: string;
  digits: string;
  flag: string;
  limit: number;
  baseBalance: number;
  due: string;
  grad?: string[];
  bankId?: string;
  balance: number;
  available: number;
}

export interface StoredCard extends Omit<Card, "balance" | "available"> {}

export interface AccountForm {
  name: string;
  type: string;
  balance: string;
  gradIdx: number;
}

export interface Account {
  id: EntityId;
  name: string;
  type: string;
  baseBalance: number;
  grad?: string[];
  bankId?: string;
  balance: number;
}

export interface StoredAccount extends Omit<Account, "balance"> {}

export interface BudgetPlanGroup {
  id: string;
  label: string;
  pct: number;
  color: string;
  icon: string;
  catIds: string[];
}

export interface BudgetPlanFormGroup {
  id?: string;
  label: string;
  pct: number | string;
  color: string;
  icon: string;
  catIds: string[];
}

export interface BudgetPlanForm {
  name: string;
  groups: BudgetPlanFormGroup[];
}

export interface PaymentOption {
  value: PaymentMethod | string;
  label: string;
  Icon: IconType;
}

export interface SelectOption<TValue extends EntityId | "" = EntityId | ""> {
  value: TValue;
  label: ReactNode;
}

export type ValidationErrors<TField extends string = string> = Partial<
  Record<TField | string, string>
>;

export type ModalSaveResult<TField extends string = string> =
  | ValidationErrors<TField>
  | null
  | void;

export interface FinanceProviderProps extends PropsWithChildren {}
