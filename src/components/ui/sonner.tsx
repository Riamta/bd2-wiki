"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {

  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-center"
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-100",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-gray-700 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-gray-600 group-[.toaster]:border-l-4 group-[.toaster]:border-l-green-500",
          error: "group-[.toaster]:bg-gray-700 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-gray-600 group-[.toaster]:border-l-4 group-[.toaster]:border-l-red-500",
          info: "group-[.toaster]:bg-gray-700 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-gray-600 group-[.toaster]:border-l-4 group-[.toaster]:border-l-blue-500",
          warning: "group-[.toaster]:bg-gray-700 group-[.toaster]:text-white group-[.toaster]:border group-[.toaster]:border-gray-600 group-[.toaster]:border-l-4 group-[.toaster]:border-l-yellow-500",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
