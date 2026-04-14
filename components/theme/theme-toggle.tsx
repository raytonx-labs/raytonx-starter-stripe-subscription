"use client";

import { Check, Laptop, Moon, SunMedium } from "lucide-react";

import { type ThemeChoice, useTheme } from "@/components/theme/theme-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const themeItems: Array<{
  value: ThemeChoice;
  label: string;
  icon: typeof SunMedium;
}> = [
  { value: "system", label: "跟随系统", icon: Laptop },
  { value: "light", label: "浅色模式", icon: SunMedium },
  { value: "dark", label: "深色模式", icon: Moon },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const activeTheme = theme;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="切换主题"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background text-foreground outline-none transition hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring/30"
        >
          <SunMedium className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="normal-case tracking-normal text-muted-foreground">
          主题
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {themeItems.map((item) => {
          const Icon = item.icon;

          return (
            <DropdownMenuItem
              key={item.value}
              className="cursor-pointer justify-between"
              onSelect={() => {
                setTheme(item.value);
              }}
            >
              <span className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {item.label}
              </span>
              {activeTheme === item.value ? <Check className="h-4 w-4" /> : null}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
