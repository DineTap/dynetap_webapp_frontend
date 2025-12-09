
import { type NextRequest } from "next/server";

export const POST = async (request: NextRequest) => {
  return new Response(null, {
    status: 200,
  });
};
