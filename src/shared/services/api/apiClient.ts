import { GOOGLE_SCRIPT_URL } from '../../../../constants';
import type { ApiResponse } from '../../types/index';

/**
 * Checks whether the GAS backend URL is configured with a real deployment URL.
 */
export const isApiConfigured = (): boolean => {
  return Boolean(GOOGLE_SCRIPT_URL && !GOOGLE_SCRIPT_URL.includes('PLACEHOLDER'));
};

/**
 * Base fetch wrapper for Google Apps Script backend.
 *
 * GAS requires Content-Type: text/plain;charset=utf-8 to avoid a CORS preflight
 * OPTIONS request, which GAS does not handle correctly. All payloads are
 * JSON-serialised strings sent as plain text.
 *
 * Includes retry logic: up to `retries` attempts with a 1-second delay between
 * each attempt to handle GAS cold-start latency.
 */
export const apiRequest = async <T = unknown>(
  payload: Record<string, unknown>,
  retries = 2,
): Promise<ApiResponse<T>> => {
  if (!isApiConfigured()) {
    return { status: 'error', message: 'API not configured' };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        // text/plain avoids CORS preflight — GAS fails on OPTIONS requests
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    return result;
  } catch (error: unknown) {
    if (retries > 0) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(`API request failed, retrying… (${retries} left): ${message}`);
      await new Promise<void>((resolve) => setTimeout(resolve, 1000));
      return apiRequest<T>(payload, retries - 1);
    }

    const message = error instanceof Error ? error.message : 'Network request failed';
    console.error('API request failed:', error);
    return { status: 'error', message };
  }
};
