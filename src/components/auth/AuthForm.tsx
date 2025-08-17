// components/auth/AuthForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import {
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
interface AuthFormProps {
  onSuccess: () => void; // callback after login/signup
  onClose: () => void; // closes modal/dialog
}

const AuthForm = ({ onSuccess, onClose }: AuthFormProps) => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isResetMode, setIsResetMode] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      toast({
        title: "Missing Information",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Sign In Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password || !fullName) {
      toast({
        title: "Missing Information",
        description: "Fill in all fields",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 6) {
      toast({
        title: "Password Too Short",
        description: "At least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { full_name: fullName },
        },
      });
      if (error) throw error;

      toast({
        title: "Account Created!",
        description: "Please verify your email.",
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      toast({
        title: "Sign Up Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      toast({
        title: "Email Required",
        description: "Enter your email",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) throw error;

      toast({ title: "Reset Email Sent", description: "Check your inbox" });
      setIsResetMode(false);
      setEmail("");
    } catch (err: any) {
      toast({
        title: "Reset Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <DialogHeader>
        <DialogTitle>
          {isResetMode ? "Reset Password" : "Sign In or Create Account"}
        </DialogTitle>
        <DialogDescription>
          {isResetMode
            ? "Enter your email to receive password reset instructions"
            : "Sign in to your account or create a new one to book our services"}
        </DialogDescription>
      </DialogHeader>

      {/* Email */}
      <div>
        <Label>Email *</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter email"
          required
        />
      </div>

      {/* Password */}
      {!isResetMode && (
        <>
          <div>
            <Label>Password *</Label>
            <div className="relative">
              <Input
                type={passwordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password (min 6 characters)"
                minLength={6}
                required
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setPasswordVisible(!passwordVisible)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                <FontAwesomeIcon icon={passwordVisible ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          {/* Full Name for signup */}
          <div>
            <Label>Full Name (for new accounts)</Label>
            <Input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter full name"
            />
          </div>
        </>
      )}

      {/* Action buttons */}
      <div className="flex gap-2">
        {isResetMode ? (
          <>
            <Button
              onClick={handlePasswordReset}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Sending..." : "Send Reset Email"}
            </Button>
            <Button
              onClick={() => setIsResetMode(false)}
              variant="outline"
              className="flex-1"
            >
              Back to Sign In
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleSignIn}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
            <Button
              onClick={handleSignUp}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Creating..." : "Create Account"}
            </Button>
          </>
        )}
      </div>

      {!isResetMode && (
        <div className="text-center">
          <button
            type="button"
            onClick={() => setIsResetMode(true)}
            className="text-blue-600 hover:underline text-sm"
          >
            Forgot your password?
          </button>
        </div>
      )}
    </div>
  );
};

export default AuthForm;
