import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { FirestoreAdapter } from "@next-auth/firebase-adapter";
import { db, auth, firebaseConfig } from "@config/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { createUser, getUser } from "@/lib/db";
import { SubscriptionPlan } from "@app-types/subscription";
import { ROUTES } from "@constants/routes";
import { ONE_MONTH_IN_SECONDS } from "@constants/values";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

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

          const userEmail = userCredential.user.email;
          if (!userEmail) return null;

          const user = await getUser(userEmail);
          if (!user) return null;

          if (user.provider !== "credentials") {
            throw new Error("ProviderMismatch");
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            image: user.image || null,
            plan: SubscriptionPlan.FREE,
          };
        } catch (error) {
          console.error("Sign-in error", error);
          return null;
        }
      },
    }),
  ],

  ...(db ? { adapter: FirestoreAdapter(firebaseConfig) } : {}),

  session: {
    strategy: "jwt",
    maxAge: ONE_MONTH_IN_SECONDS,
  },

  pages: {
    signIn: ROUTES.DASHBOARD,
    signOut: ROUTES.HOME,
    error: ROUTES.SIGNIN + "?error=ProviderMismatch",
  },

  callbacks: {
    async jwt({ token, user, account }) {
      if (account?.provider === "google") {
        const existingUser = await getUser(token.email as string);

        let dbUser = existingUser;
        if (!dbUser) {
          dbUser = await createUser({
            email: token.email!,
            name: token.name || "",
            image: token.picture || "",
            provider: "google",
            subscriptionPlan: SubscriptionPlan.FREE,
          });
        }

        token.id = dbUser.id;
        token.plan = dbUser.subscriptionPlan || SubscriptionPlan.FREE;
        token.provider = "google";
      }

      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.plan = user.plan || SubscriptionPlan.FREE;
        token.provider = account?.provider || "credentials";
      }

      return token;
    },

    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id?.toString() || "";
        session.user.email = token.email as string;
        session.user.subscriptionPlan =
          (token.plan as SubscriptionPlan) || SubscriptionPlan.FREE;
        session.user.provider = token.provider as "google" | "credentials";
      }

      return session;
    },
  },

  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

export const getSession = () => getServerSession(authOptions);
