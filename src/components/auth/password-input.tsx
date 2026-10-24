"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";

/** Password field with an accessible show/hide toggle. Passes every other prop to <Input>. */
export function PasswordInput(props: Omit<React.ComponentProps<typeof Input>, "type">) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input {...props} type={visible ? "text" : "password"} className={`${props.className ?? ""} pr-20`} />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-pressed={visible}
        aria-controls={props.id}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2.5 py-1.5 text-sm font-semibold text-lp-accent hover:bg-lp-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lp-accent"
      >
        {visible ? "Hide" : "Show"}
        <span className="sr-only"> password</span>
      </button>
    </div>
  );
}
