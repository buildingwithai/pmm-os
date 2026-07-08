import { fetchMutation, fetchQuery } from 'convex/nextjs';
import { makeFunctionReference } from 'convex/server';

import { getConvexImplementationStatus } from './contract';

export type ConvexCallResult<T> =
  | {
      ok: true;
      value: T;
    }
  | {
      error: string;
      ok: false;
      reason: 'missing_setup' | 'disabled' | 'call_failed';
    };

function getOptions(env: Record<string, string | undefined>) {
  return {
    skipConvexDeploymentUrlCheck: env.CONVEX_SKIP_URL_CHECK === 'true',
    url: env.NEXT_PUBLIC_CONVEX_URL
  };
}

export async function callConvexQuery<T>(
  functionName: string,
  args: Record<string, unknown>,
  env: Record<string, string | undefined> = process.env
): Promise<ConvexCallResult<T>> {
  const status = getConvexImplementationStatus(env);

  if (status.missingKeys.length > 0) {
    return { error: status.message, ok: false, reason: 'missing_setup' };
  }

  if (!status.canCallConvex) {
    return { error: status.message, ok: false, reason: 'disabled' };
  }

  try {
    const value = await fetchQuery(makeFunctionReference<'query'>(functionName), args, getOptions(env));
    return { ok: true, value: value as T };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Convex query failed.',
      ok: false,
      reason: 'call_failed'
    };
  }
}

export async function callConvexMutation<T>(
  functionName: string,
  args: Record<string, unknown>,
  env: Record<string, string | undefined> = process.env
): Promise<ConvexCallResult<T>> {
  const status = getConvexImplementationStatus(env);

  if (status.missingKeys.length > 0) {
    return { error: status.message, ok: false, reason: 'missing_setup' };
  }

  if (!status.canCallConvex) {
    return { error: status.message, ok: false, reason: 'disabled' };
  }

  try {
    const value = await fetchMutation(
      makeFunctionReference<'mutation'>(functionName),
      args,
      getOptions(env)
    );
    return { ok: true, value: value as T };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Convex mutation failed.',
      ok: false,
      reason: 'call_failed'
    };
  }
}
