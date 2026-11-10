/**
 * Batch schedule data for K3 training programs.
 * Each value is either null (no active open batch) or { tanggal: string, sisa: number }.
 */
export const batches = {
  kebakaran: null,
  listrik: null,
  ahliK3Umum: null,
  ruangTerbatas: null,
  pppa: null,
  pppu: null
};

export default batches;
