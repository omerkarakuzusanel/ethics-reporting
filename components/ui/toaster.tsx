"use client"

import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast"
import { CheckCircle, AlertCircle, Info } from "lucide-react"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        // Determine icon based on variant
        let Icon = Info
        if (props.variant === "destructive") {
          Icon = AlertCircle
        } else if (props.variant === "success" || props.variant === "default") {
          Icon = CheckCircle
        }

        return (
          <Toast key={id} {...props}>
            <div className="flex items-start gap-3">
              <Icon className="h-5 w-5" />
              <div className="grid gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}

