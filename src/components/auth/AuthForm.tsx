// import { useState } from 'react';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';

// interface AuthFormProps {
//   onSuccess: () => void;
// }

// const AuthForm = ({ onSuccess }: AuthFormProps) => {
//   const [isLogin, setIsLogin] = useState(true);
//   const [loading, setLoading] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [fullName, setFullName] = useState('');
//   const { toast } = useToast();

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       if (isLogin) {
//         const { error } = await supabase.auth.signInWithPassword({
//           email,
//           password
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
//               full_name: fullName
//             }
//           }
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
//         <CardTitle>{isLogin ? 'Sign In' : 'Sign Up'}</CardTitle>
//         <CardDescription>
//           {isLogin ? 'Welcome back to Saakwa Laundry' : 'Create your account to book laundry services'}
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           {!isLogin && (
//             <div>
//               <label className="block text-sm font-medium mb-1">Full Name</label>
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
//             <Input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               required
//               placeholder="Enter your password"
//               minLength={6}
//             />
//           </div>

//           <Button type="submit" className="w-full" disabled={loading}>
//             {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
//           </Button>
//         </form>

//         <div className="mt-4 text-center">
//           <button
//             type="button"
//             onClick={() => setIsLogin(!isLogin)}
//             className="text-blue-600 hover:underline text-sm"
//           >
//             {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
//           </button>
//         </div>
//       </CardContent>
//     </Card>
//   );
// };

// export default AuthForm;

import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AuthFormProps {
  onSuccess: () => void;
}

const AuthForm = ({ onSuccess }: AuthFormProps) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "You've been signed in successfully.",
        });
        onSuccess();
      } else {
        const redirectUrl = `${window.location.origin}/auth`; // Ensure user returns to auth page for email callback
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
          title: "Check your email!",
          description: "Please verify your email to complete registration.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>{isLogin ? "Sign In" : "Sign Up"}</CardTitle>
        <CardDescription>
          {isLogin
            ? "Welcome back to Saakwa Laundry"
            : "Create your account to book laundry services"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Full Name
              </label>
              <Input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              minLength={6}
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600 hover:underline text-sm"
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuthForm;
