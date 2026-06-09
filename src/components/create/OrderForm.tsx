"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";

export interface OrderFormValues {
  price: string;
  startPrice: string;
  startTime: string;
  endTime: string;
  taker: string;
  paymentToken: string;
}

interface Props {
  mode: "sell" | "buy";
  onSubmit: (values: OrderFormValues) => void;
  onValuesChange?: (values: OrderFormValues) => void;
  isPending: boolean;
}

const inputClass =
  "w-full rounded-md border border-[#e8e2d8] bg-white px-3 py-2.5 font-mono text-sm text-[#1a1a1a] placeholder-[#c4bfb8] outline-none transition focus:border-[#b8860b]";
const labelClass =
  "mb-1.5 block font-mono text-xs uppercase tracking-wider text-[#8c8580]";
const errorClass = "mt-1 font-serif text-xs text-[#c53030]";

export default function OrderForm({ mode, onSubmit, onValuesChange, isPending }: Props) {
  const {
    register,
    handleSubmit,
    watch,
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
  useEffect(() => {
    const subscription = watch((value) => {
      onValuesChange?.({
        price: value.price || "",
        startPrice: value.startPrice || "",
        startTime: value.startTime || "",
        endTime: value.endTime || "",
        taker: value.taker || "",
        paymentToken: value.paymentToken || "",
      });
    });
    return () => subscription.unsubscribe();
  }, [onValuesChange, watch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <h3 className="font-serif text-base font-medium text-[#1a1a1a]">
        Order Details
      </h3>

      <div>
        <label className={labelClass}>
          Price ({mode === "sell" ? "ETH" : "WETH"})
        </label>
        <input
          type="text"
          placeholder="0.1"
          {...register("price", {
            required: "Price is required",
            pattern: { value: /^\d*\.?\d*$/, message: "Invalid number" },
          })}
          className={inputClass}
        />
        {errors.price && <p className={errorClass}>{errors.price.message}</p>}
      </div>

      <div>
        <label className={labelClass}>Start Time</label>
        <input
          type="datetime-local"
          {...register("startTime", { required: "Start time is required" })}
          className={inputClass}
        />
        {errors.startTime && (
          <p className={errorClass}>{errors.startTime.message}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>End Time (empty = never)</label>
        <input type="datetime-local" {...register("endTime")} className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Taker (empty = public)</label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("taker", {
            validate: (v) => !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Payment Token (empty = {mode === "sell" ? "ETH" : "configured WETH"})
        </label>
        <input
          type="text"
          placeholder="0x... or empty"
          {...register("paymentToken", {
            validate: (v) => !v || v.startsWith("0x") || "Must be a hex address",
          })}
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-md bg-[#1a1a1a] px-4 py-3 font-serif text-base font-medium text-[#faf7f2] transition hover:bg-[#3d3d3d] disabled:opacity-40"
      >
        {isPending ? "Signing" : mode === "sell" ? "Sign & List" : "Sign & Offer"}
      </button>
    </form>
  );
}
