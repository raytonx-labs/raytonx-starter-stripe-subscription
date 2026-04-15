import { NextResponse } from "next/server";

type ErrorPayload = {
  error: string;
};

export function jsonError(message: string, status: number) {
  return NextResponse.json<ErrorPayload>(
    {
      error: message,
    },
    {
      status,
    },
  );
}

export function unauthorized<TBody extends object>(body?: TBody) {
  return NextResponse.json<TBody | ErrorPayload>(
    body ?? {
      error: "Unauthorized",
    },
    {
      status: 401,
    },
  );
}

export function badRequest(message: string) {
  return jsonError(message, 400);
}

export function internalServerError(message: string) {
  return jsonError(message, 500);
}

export function badGateway(message: string) {
  return jsonError(message, 502);
}
