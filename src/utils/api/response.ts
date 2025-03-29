import { NextResponse } from 'next/server';

type ApiResponse<T> = {
  status: number;
  data?: T;
  error?: string;
  message?: string;
};

export function successResponse<T>(data: T, message?: string): NextResponse {
  const response: ApiResponse<T> = {
    status: 200,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response);
}

export function createdResponse<T>(data: T, message?: string): NextResponse {
  const response: ApiResponse<T> = {
    status: 201,
    data,
  };

  if (message) {
    response.message = message;
  }

  return NextResponse.json(response, { status: 201 });
}

export function notFoundResponse(message = 'Resource not found'): NextResponse {
  return NextResponse.json(
    {
      status: 404,
      error: message,
    },
    { status: 404 }
  );
}

export function badRequestResponse(message: string): NextResponse {
  return NextResponse.json(
    {
      status: 400,
      error: message,
    },
    { status: 400 }
  );
}

export function serverErrorResponse(message = 'Internal server error'): NextResponse {
  return NextResponse.json(
    {
      status: 500,
      error: message,
    },
    { status: 500 }
  );
}

export function unauthorizedResponse(message = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    {
      status: 401,
      error: message,
    },
    { status: 401 }
  );
} 