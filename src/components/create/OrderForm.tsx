"use client";

import { useForm } from "react-hook-form";

export interface OrderFormValues {
  price: string;       // ETH amount
  startPrice: string;  // Dutch auction start price (same as price for fixed)
  startTime: string;   // ISO datetime-local
  endTime: string;     // ISO datetime-local (empty = never expires)
  taker: string;       // address(0) = public
  paymentToken: string;
}

interface Props {
  mode: "sell" | "buy";
  onSubmit: (values: OrderFormValues) => void;
  isPending: boolean;
}

export default function OrderForm({ mode, onSubmit, isPending }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderFormValues>({
    defaultValues: {
      price: "",
      startPrice: "",
      startTime: "",
      endTime: "",
      taker: "",
      paymentToken: "",
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <h3 className="text-sm font-medium text-gray-300">Order Details</h3>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Price ({mode === "sell" ? "ETH" : "WETH"})
        </label>
        <input
          type="text"
          placeholder="0.1"
          {...register("price", {
            required: "Price is required",
            pattern: {
              value: /^\d*\.?\d*$/,
              message: "Invalid number",
            },
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500"
        />
        {errors.price && (
          <p className="mt-1 text-xs text-red-400">{errors.price.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Start Time
        </label>
        <input
          type="datetime-local"
          {...register("startTime", { required: "Start time is required" })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
        />
        {errors.startTime && (
          <p className="mt-1 text-xs text-red-400">{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          End Time (empty = never expires)
        </label>
        <input
          type="datetime-local"
          {...register("endTime")}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Taker (empty = public)
        </label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("taker", {
            validate: (v) =>
              !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 font-mono"
        />
      </div>

      <div>
        <label className="block text-xs text-gray-500 mb-1">
          Payment Token (empty = {mode === "sell" ? "ETH" : "WETH"})
        </label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("paymentToken", {
            validate: (v) =>
              !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-200 ring-1 ring-gray-700 placeholder-gray-500 font-mono"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
      >
        {isPending
          ? "Signing..."
          : mode === "sell"
          ? "Sign & List"
          : "Sign & Offer"}
      </button>
    </form>
  );
}
