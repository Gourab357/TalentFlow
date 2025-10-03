import { useTheme } from "next-themes";
import { Toaster as SonnerToaster, toast } from "sonner";

const Toaster = (props) => {
  const { theme = "system" } = useTheme();

  return (
    <SonnerToaster
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "",
          actionButton: "",
          cancelButton: "",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
