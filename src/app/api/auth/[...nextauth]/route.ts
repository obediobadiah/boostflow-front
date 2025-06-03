import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Make sure to handle all HTTP methods that NextAuth needs
const handler = NextAuth(authOptions);

// Export all the handlers NextAuth might need
export { handler as GET, handler as POST }; 