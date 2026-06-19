import { NextResponse } from "next/server";
import type { ZodError } from "zod";

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiFailure = {
  success: false;
  message: string;
  errors?: unknown;
};

type ResponseOptions = {
  status?: number;
  message?: string;
};

export function successResponse<T>(
  data: T,
  options: ResponseOptions = {},
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    {
      success: true,
      message: options.message,
      data,
    },
    { status: options.status ?? 200 },
  );
}

export function errorResponse(
  message: string,
  status = 400,
  errors?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    {
      success: false,
      message,
      errors,
    },
    { status },
  );
}

export function validationErrorResponse(error: ZodError): NextResponse<ApiFailure> {
  return errorResponse("Du lieu khong hop le.", 422, error.flatten().fieldErrors);
}
