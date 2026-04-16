"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { APP_ROUTES, getSafeInternalPath } from "@/lib/auth/config";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";
type OAuthProvider = "github" | "google";

type AuthDialogProps = {
  defaultNextPath?: string;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
};

const authSchema = z.object({
  email: z.string().email("请输入有效邮箱"),
  password: z.string().min(6, "密码至少 6 位"),
  fullName: z.string().optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

function ProviderButton({
  provider,
  icon,
  onClick,
  disabled,
}: {
  provider: OAuthProvider;
  icon: ReactNode;
  onClick: (provider: OAuthProvider) => Promise<void>;
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={provider}
      disabled={disabled}
      onClick={() => onClick(provider)}
      className="rounded-2xl"
    >
      {icon}
    </Button>
  );
}

export function AuthDialog({
  defaultNextPath,
  triggerLabel = "登录",
  triggerVariant = "default",
  triggerSize = "default",
  triggerClassName,
}: AuthDialogProps) {
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const nextPath = getSafeInternalPath(defaultNextPath, APP_ROUTES.app);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  function resetState() {
    setMessage(null);
  }

  async function handleOAuth(provider: OAuthProvider) {
    setIsSubmitting(true);
    resetState();

    try {
      const supabase = createClient();
      const callbackUrl = new URL(APP_ROUTES.authCallback, window.location.origin);
      callbackUrl.searchParams.set("next", nextPath);

      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: callbackUrl.toString(),
        },
      });

      if (error) {
        setMessage(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAuth(values: AuthFormValues) {
    setIsSubmitting(true);
    resetState();

    try {
      const supabase = createClient();

      if (mode === "sign-in") {
        const { error } = await supabase.auth.signInWithPassword({
          email: values.email,
          password: values.password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        window.location.assign(nextPath);
        setOpen(false);
        return;
      }

      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: {
            full_name: values.fullName,
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session) {
        window.location.assign(nextPath);
        setOpen(false);
        return;
      }

      setMessage("注册成功，请查看邮箱完成验证后再登录。");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);

    if (!nextOpen) {
      setMessage(null);
      form.reset({
        email: "",
        password: "",
        fullName: "",
      });
      setMode("sign-in");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={["rounded-full", triggerClassName].filter(Boolean).join(" ")}
        >
          {triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader className="flex items-start justify-between gap-4">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            {mode === "sign-in" ? "登录" : "注册"}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              ×
            </Button>
          </DialogClose>
        </DialogHeader>

        <div className="mt-5 flex rounded-full border border-border bg-muted p-1">
          <Button
            type="button"
            variant={mode === "sign-in" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => {
              resetState();
              form.clearErrors();
              setMode("sign-in");
            }}
          >
            登录
          </Button>
          <Button
            type="button"
            variant={mode === "sign-up" ? "default" : "ghost"}
            size="sm"
            className="flex-1 rounded-full"
            onClick={() => {
              resetState();
              form.clearErrors();
              setMode("sign-up");
            }}
          >
            注册
          </Button>
        </div>

        <div className="mt-5 flex items-center justify-center gap-3">
          <ProviderButton
            provider="github"
            icon={<FaGithub className="h-4 w-4" />}
            onClick={handleOAuth}
            disabled={isSubmitting}
          />
          <ProviderButton
            provider="google"
            icon={<FcGoogle className="h-4 w-4" />}
            onClick={handleOAuth}
            disabled={isSubmitting}
          />
        </div>

        <div className="my-6 h-px bg-border" />

        <Form {...form}>
          <form className="grid gap-4" onSubmit={form.handleSubmit(handleAuth)}>
            {mode === "sign-up" ? (
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="auth-full-name">姓名</FormLabel>
                    <FormControl>
                      <Input
                        id="auth-full-name"
                        placeholder="你的名字"
                        autoComplete="name"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : null}

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="auth-email">邮箱</FormLabel>
                  <FormControl>
                    <Input
                      id="auth-email"
                      type="email"
                      placeholder="name@example.com"
                      autoComplete="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel htmlFor="auth-password">密码</FormLabel>
                  <FormControl>
                    <Input
                      id="auth-password"
                      type="password"
                      placeholder="至少 6 位"
                      autoComplete={mode === "sign-in" ? "current-password" : "new-password"}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isSubmitting} className="mt-2 rounded-2xl">
              {isSubmitting ? "处理中..." : mode === "sign-in" ? "登录并继续" : "注册并继续"}
            </Button>
          </form>
        </Form>

        {message ? (
          <p className="mt-4 rounded-2xl border border-border bg-muted px-4 py-3 text-sm leading-6 text-muted-foreground">
            {message}
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
