import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

// Toaster: Renders all active toast notifications using ToastProvider
// Maps over toasts from the custom useToast hook and displays them in the UI
export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {/* Render each toast notification */}
      {toasts.map(function ({ id, title, description, action, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      {/* ToastViewport positions the toasts on the screen */}
      <ToastViewport />
    </ToastProvider>
  )
}
