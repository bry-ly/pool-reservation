"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";

function PasswordInput(props: React.ComponentProps<"input">) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input type={visible ? "text" : "password"} {...props} />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        tabIndex={-1}
      >
        {visible ? <IconEyeOff className="size-4" /> : <IconEye className="size-4" />}
      </button>
    </div>
  );
}

export { PasswordInput };
