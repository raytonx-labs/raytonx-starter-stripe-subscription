"use client";

import * as React from "react";
import { Controller, FormProvider, useFormContext } from "react-hook-form";
import type { ControllerProps, FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

type FormProps<TFieldValues extends FieldValues> = React.PropsWithChildren<
  UseFormReturn<TFieldValues>
>;

export function Form<TFieldValues extends FieldValues>({
  children,
  ...props
}: FormProps<TFieldValues>) {
  return <FormProvider {...props}>{children}</FormProvider>;
}

type FormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

const FormFieldContext = React.createContext<FormFieldContextValue>({} as FormFieldContextValue);

export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>(props: ControllerProps<TFieldValues, TName>) {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function FormItem({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={["grid gap-2", className].join(" ")} {...props} />;
}

export function FormLabel({
  className = "",
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={["text-sm text-foreground", className].join(" ")} {...props} />;
}

export function FormControl({ children }: { children: React.ReactElement }) {
  const { getFieldState, formState } = useFormContext();
  const { name } = React.useContext(FormFieldContext);
  const fieldState = getFieldState(name, formState);

  return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
    "aria-invalid": fieldState.invalid,
  });
}

export function FormDescription({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={["text-sm text-muted-foreground", className].join(" ")} {...props} />;
}

export function FormMessage({
  className = "",
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  const { getFieldState, formState } = useFormContext();
  const { name } = React.useContext(FormFieldContext);
  const fieldState = getFieldState(name, formState);
  const message = fieldState.error?.message ?? children;

  if (!message) {
    return null;
  }

  return (
    <p className={["text-sm text-destructive", className].join(" ")} {...props}>
      {message}
    </p>
  );
}
