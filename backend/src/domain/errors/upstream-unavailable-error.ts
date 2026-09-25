export class UpstreamUnavailableError extends Error {
  constructor(message = "Upstream service is unavailable", options?: { cause?: unknown }) {
    super(message, options);
    this.name = "UpstreamUnavailableError";
  }
}
