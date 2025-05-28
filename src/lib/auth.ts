import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { db, auth, firebaseConfig } from "@config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getUser } from "@/lib/db";
import { SubscriptionPlan } from "@app-types/subscription";
import { ROUTES } from "@constants/routes";
import { ONE_MONTH_IN_SECONDS } from "@constants/values";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        if (!auth) {
          console.error("Firebase auth not initialized");
          return null;
        }

        try {
          const userCredential = await signInWithEmailAndPassword(
            auth,
            credentials.email,
            credentials.password
          );

          if (!userCredential?.user) {
            return null;
          }

          const user = await getUser(userCredential.user.uid);

          if (!user) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            plan: SubscriptionPlan.FREE // Default to FREE plan, this would be updated based on subscription status
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      }
    })
  ],
  ...(db ? { adapter: FirestoreAdapter(firebaseConfig) } : {}),
  session: {
    strategy: "jwt",
    maxAge: ONE_MONTH_IN_SECONDS
  },
  pages: {
    signIn: ROUTES.SIGNIN,
    signOut: ROUTES.HOME,
    error: ROUTES.SIGNIN
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.plan = user.plan || SubscriptionPlan.FREE;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.subscriptionPlan = token.plan as SubscriptionPlan;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
  
};

export const getSession = () => getServerSession(authOptions);
