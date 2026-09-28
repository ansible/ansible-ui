type SummaryJobFields = {
  current_job?: { id?: number } | null;
  last_job?: { id?: number } | null;
  current_update?: { id?: number } | null;
};

/** Parse numeric resource id from an AWX API `related` field URL. */
export function getIdFromAwxRelatedUrl(relatedUrl?: string | null): number | undefined {
  if (!relatedUrl) {
    return undefined;
  }
  const segments = relatedUrl.replace(/\/$/, '').split('/');
  const idSegment = segments[segments.length - 1];
  const id = Number(idSegment);
  return Number.isFinite(id) ? id : undefined;
}

/** Resolve the id of the latest project or inventory sync job for list/detail links. */
export function getSyncJobId(
  summaryFields?: SummaryJobFields | null,
  relatedLastJobUrl?: string | null
): number | undefined {
  const summaryJob = summaryFields?.current_job || summaryFields?.last_job;
  return (
    summaryJob?.id ??
    summaryFields?.current_update?.id ??
    getIdFromAwxRelatedUrl(relatedLastJobUrl)
  );
}
