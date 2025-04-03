import { NextResponse } from "next/server"
import { ZodError } from "zod"

export const handleError = (error: unknown) => {
  if (error instanceof ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 422 })
  }
  if (error instanceof Error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ error: "Unknown error" }, { status: 500 })
}