import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        mode: { label: "Mode", type: "text" }, // "login" | "signup"
      },
      async authorize(credentials) {
        // Simple credential validation — stores users in backend
        const { email, password, name, mode } = credentials;

        if (!email || !password) return null;

        try {
          const endpoint = mode === "signup" ? "signup" : "login";
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:3001"}/api/auth/${endpoint}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password, name }),
            },
          );

          if (!res.ok) return null;
          const user = await res.json();
          return { id: user.id, name: user.name, email: user.email };
        } catch {
          return null;
        }
      },
    }),
  ],

  pages: {
    signIn: "/login",
    error: "/login",
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id;
      return session;
    },
  },

  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
});
