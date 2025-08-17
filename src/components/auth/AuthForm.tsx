// import { useState } from "react";
// import { supabase } from "@/integrations/supabase/client";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
// import { useToast } from "@/hooks/use-toast";

// interface AuthFormProps {
//   onSuccess: () => void;
// }

// const AuthForm = ({ onSuccess }: AuthFormProps) => {
//   const [PasswordVisible, SetPasswordVisible] = useState(false);
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [fullName, setFullName] = useState("");
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (isLogin) {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password,
//         });

//         if (error) throw error;

//         toast({
//           title: "Welcome back!",
//           description: "You've been signed in successfully.",
//         });
//         onSuccess();
//       } else {
//         const redirectUrl = `${window.location.origin}/`;

//         const { error } = await supabase.auth.signUp({
//           email,
//           password,
//           options: {
//             emailRedirectTo: redirectUrl,
//             data: {
//               full_name: fullName,
//             },
//           },
//         });

//         if (error) throw error;

//         toast({
//           title: "Account created!",
//           description: "Please check your email to verify your account.",
//         });
//       }
//     } catch (error: any) {
//       toast({
//         title: "Authentication Error",
//         description: error.message,
//         variant: "destructive",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Card className="w-full max-w-md mx-auto">
//       <CardHeader>
//         <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
//         <CardDescription>
//           {isLogin
//             ? "Welcome back to Saakwa Laundry"
//             : "Create your account to book laundry services"}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isLogin && (
//             <div>
//               <label className="block text-sm font-medium mb-1">
//                 Full Name
//               </label>
//               <Input
//                 type="text"
//                 value={fullName}
//                 onChange={(e) => setFullName(e.target.value)}
//                 required
//                 placeholder="Enter your full name"
//               />
//             </div>
//           )}

//           <div>
//             <label className="block text-sm font-medium mb-1">Email</label>
//             <Input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               required
//               placeholder="Enter your email"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium mb-1">Password</label>
//             <div className="relative">
//               <Input
//                 type={PasswordVisible ? "text" : "password"}
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//                 placeholder="Enter your password"
//                 minLength={6}
//                 className="pr-10"
//               />
//               <Button
//                 type="button"
//                 onClick={() => SetPasswordVisible(!PasswordVisible)}
//                 className="absolute inset-y-0 right-0 pr-13 flex items-center text-gray-500 hover:text-gray-700"
//               >
//                 <FontAwesomeIcon icon={PasswordVisible ? faEyeSlash : faEye} />
//               </Button>
//             </div>
//           </div>
//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
//           </Button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             type="button"
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-blue-600 hover:underline text-sm"
//           >
//             {isLogin
//               ? "Don't have an account? Sign up"
//               : "Already have an account? Sign in"}
//           </button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default AuthForm;

// components/AuthForm.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

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
