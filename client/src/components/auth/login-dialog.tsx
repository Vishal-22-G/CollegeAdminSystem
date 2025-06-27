import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

const loginSchema = z.object({
  pin: z.string().length(4, "PIN must be 4 digits"),
});

type LoginForm = z.infer<typeof loginSchema>;

interface LoginDialogProps {
  open: boolean;
  onSuccess: () => void;
}

export function LoginDialog({ open, onSuccess }: LoginDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      pin: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    
    // Check if PIN is correct (2503)
    if (data.pin === "2503") {
      localStorage.setItem("admin_authenticated", "true");
      toast({ 
        title: "Success", 
        description: "Admin access granted" 
      });
      onSuccess();
    } else {
      toast({ 
        title: "Error", 
        description: "Invalid PIN. Please try again.",
        variant: "destructive"
      });
    }
    
    setIsLoading(false);
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Admin Access Required
          </DialogTitle>
          <DialogDescription>
            Please enter the admin PIN to access the system.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Admin PIN</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="Enter 4-digit PIN"
                      maxLength={4}
                      className="text-center text-lg font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Verifying..." : "Access System"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}