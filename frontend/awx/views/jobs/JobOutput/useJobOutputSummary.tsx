import { useGet2 } from '../../../../Data';
import { Job } from '../../../interfaces/Job';

export function useJobOutputChildrenSummary(job: Job) {
  const response = useGet2<IChildrenSummary>({
    url: `/api/v2/jobs/${job.id}/job_events/children_summary/`,
  });
  return response.data;
}

interface IChildrenSummary {
  children_summary: {
    [counter: string]: { rowNumber: number; numChildren: number };
  };
  meta_event_nested_uuid: object;
  event_processing_finished: boolean;
  is_tree: boolean;
}

const t = {
  children_summary: {
    '1': { rowNumber: 0, numChildren: 476 },
    '2': { rowNumber: 1, numChildren: 9 },
    '3': { rowNumber: 2, numChildren: 2 },
    '6': { rowNumber: 5, numChildren: 2 },
    '9': { rowNumber: 8, numChildren: 2 },
    '12': { rowNumber: 11, numChildren: 9 },
    '13': { rowNumber: 12, numChildren: 2 },
    '16': { rowNumber: 15, numChildren: 2 },
    '19': { rowNumber: 18, numChildren: 2 },
    '22': { rowNumber: 21, numChildren: 441 },
    '23': { rowNumber: 22, numChildren: 2 },
    '26': { rowNumber: 25, numChildren: 2 },
    '29': { rowNumber: 28, numChildren: 2 },
    '32': { rowNumber: 31, numChildren: 2 },
    '35': { rowNumber: 34, numChildren: 2 },
    '38': { rowNumber: 37, numChildren: 2 },
    '41': { rowNumber: 40, numChildren: 2 },
    '44': { rowNumber: 43, numChildren: 2 },
    '47': { rowNumber: 46, numChildren: 2 },
    '50': { rowNumber: 49, numChildren: 2 },
    '53': { rowNumber: 52, numChildren: 2 },
    '56': { rowNumber: 55, numChildren: 2 },
    '59': { rowNumber: 58, numChildren: 2 },
    '62': { rowNumber: 61, numChildren: 2 },
    '65': { rowNumber: 64, numChildren: 2 },
    '68': { rowNumber: 67, numChildren: 2 },
    '71': { rowNumber: 70, numChildren: 2 },
    '74': { rowNumber: 73, numChildren: 2 },
    '77': { rowNumber: 76, numChildren: 2 },
    '80': { rowNumber: 79, numChildren: 2 },
    '83': { rowNumber: 82, numChildren: 2 },
    '86': { rowNumber: 85, numChildren: 2 },
    '89': { rowNumber: 88, numChildren: 2 },
    '92': { rowNumber: 91, numChildren: 2 },
    '95': { rowNumber: 94, numChildren: 2 },
    '98': { rowNumber: 97, numChildren: 2 },
    '101': { rowNumber: 100, numChildren: 2 },
    '104': { rowNumber: 103, numChildren: 2 },
    '107': { rowNumber: 106, numChildren: 2 },
    '110': { rowNumber: 109, numChildren: 2 },
    '113': { rowNumber: 112, numChildren: 2 },
    '116': { rowNumber: 115, numChildren: 2 },
    '119': { rowNumber: 118, numChildren: 2 },
    '122': { rowNumber: 121, numChildren: 2 },
    '125': { rowNumber: 124, numChildren: 2 },
    '128': { rowNumber: 127, numChildren: 2 },
    '131': { rowNumber: 130, numChildren: 2 },
    '134': { rowNumber: 133, numChildren: 2 },
    '137': { rowNumber: 136, numChildren: 2 },
    '140': { rowNumber: 139, numChildren: 2 },
    '143': { rowNumber: 142, numChildren: 2 },
    '146': { rowNumber: 145, numChildren: 2 },
    '149': { rowNumber: 148, numChildren: 2 },
    '152': { rowNumber: 151, numChildren: 2 },
    '155': { rowNumber: 154, numChildren: 2 },
    '158': { rowNumber: 157, numChildren: 2 },
    '161': { rowNumber: 160, numChildren: 2 },
    '164': { rowNumber: 163, numChildren: 2 },
    '167': { rowNumber: 166, numChildren: 2 },
    '170': { rowNumber: 169, numChildren: 2 },
    '173': { rowNumber: 172, numChildren: 2 },
    '176': { rowNumber: 175, numChildren: 2 },
    '179': { rowNumber: 178, numChildren: 2 },
    '182': { rowNumber: 181, numChildren: 2 },
    '185': { rowNumber: 184, numChildren: 2 },
    '188': { rowNumber: 187, numChildren: 2 },
    '191': { rowNumber: 190, numChildren: 2 },
    '194': { rowNumber: 193, numChildren: 2 },
    '197': { rowNumber: 196, numChildren: 2 },
    '200': { rowNumber: 199, numChildren: 2 },
    '203': { rowNumber: 202, numChildren: 2 },
    '206': { rowNumber: 205, numChildren: 2 },
    '209': { rowNumber: 208, numChildren: 2 },
    '212': { rowNumber: 211, numChildren: 2 },
    '215': { rowNumber: 214, numChildren: 2 },
    '218': { rowNumber: 217, numChildren: 2 },
    '221': { rowNumber: 220, numChildren: 2 },
    '224': { rowNumber: 223, numChildren: 2 },
    '227': { rowNumber: 226, numChildren: 2 },
    '230': { rowNumber: 229, numChildren: 2 },
    '233': { rowNumber: 232, numChildren: 2 },
    '236': { rowNumber: 235, numChildren: 2 },
    '239': { rowNumber: 238, numChildren: 2 },
    '242': { rowNumber: 241, numChildren: 2 },
    '245': { rowNumber: 244, numChildren: 2 },
    '248': { rowNumber: 247, numChildren: 2 },
    '251': { rowNumber: 250, numChildren: 2 },
    '254': { rowNumber: 253, numChildren: 2 },
    '257': { rowNumber: 256, numChildren: 2 },
    '260': { rowNumber: 259, numChildren: 2 },
    '263': { rowNumber: 262, numChildren: 2 },
    '266': { rowNumber: 265, numChildren: 2 },
    '269': { rowNumber: 268, numChildren: 2 },
    '272': { rowNumber: 271, numChildren: 2 },
    '275': { rowNumber: 274, numChildren: 2 },
    '278': { rowNumber: 277, numChildren: 2 },
    '281': { rowNumber: 280, numChildren: 2 },
    '284': { rowNumber: 283, numChildren: 2 },
    '287': { rowNumber: 286, numChildren: 2 },
    '290': { rowNumber: 289, numChildren: 2 },
    '293': { rowNumber: 292, numChildren: 2 },
    '296': { rowNumber: 295, numChildren: 2 },
    '299': { rowNumber: 298, numChildren: 2 },
    '302': { rowNumber: 301, numChildren: 2 },
    '305': { rowNumber: 304, numChildren: 2 },
    '308': { rowNumber: 307, numChildren: 2 },
    '311': { rowNumber: 310, numChildren: 2 },
    '314': { rowNumber: 313, numChildren: 2 },
    '317': { rowNumber: 316, numChildren: 2 },
    '320': { rowNumber: 319, numChildren: 2 },
    '323': { rowNumber: 322, numChildren: 2 },
    '326': { rowNumber: 325, numChildren: 2 },
    '329': { rowNumber: 328, numChildren: 2 },
    '332': { rowNumber: 331, numChildren: 2 },
    '335': { rowNumber: 334, numChildren: 2 },
    '338': { rowNumber: 337, numChildren: 2 },
    '341': { rowNumber: 340, numChildren: 2 },
    '344': { rowNumber: 343, numChildren: 2 },
    '347': { rowNumber: 346, numChildren: 2 },
    '350': { rowNumber: 349, numChildren: 2 },
    '353': { rowNumber: 352, numChildren: 2 },
    '356': { rowNumber: 355, numChildren: 2 },
    '359': { rowNumber: 358, numChildren: 2 },
    '362': { rowNumber: 361, numChildren: 2 },
    '365': { rowNumber: 364, numChildren: 2 },
    '368': { rowNumber: 367, numChildren: 2 },
    '371': { rowNumber: 370, numChildren: 2 },
    '374': { rowNumber: 373, numChildren: 2 },
    '377': { rowNumber: 376, numChildren: 2 },
    '380': { rowNumber: 379, numChildren: 2 },
    '383': { rowNumber: 382, numChildren: 2 },
    '386': { rowNumber: 385, numChildren: 2 },
    '389': { rowNumber: 388, numChildren: 2 },
    '392': { rowNumber: 391, numChildren: 2 },
    '395': { rowNumber: 394, numChildren: 2 },
    '398': { rowNumber: 397, numChildren: 2 },
    '401': { rowNumber: 400, numChildren: 2 },
    '404': { rowNumber: 403, numChildren: 2 },
    '407': { rowNumber: 406, numChildren: 2 },
    '410': { rowNumber: 409, numChildren: 2 },
    '413': { rowNumber: 412, numChildren: 2 },
    '416': { rowNumber: 415, numChildren: 2 },
    '419': { rowNumber: 418, numChildren: 2 },
    '422': { rowNumber: 421, numChildren: 2 },
    '425': { rowNumber: 424, numChildren: 2 },
    '428': { rowNumber: 427, numChildren: 2 },
    '431': { rowNumber: 430, numChildren: 2 },
    '434': { rowNumber: 433, numChildren: 2 },
    '437': { rowNumber: 436, numChildren: 2 },
    '440': { rowNumber: 439, numChildren: 2 },
    '443': { rowNumber: 442, numChildren: 2 },
    '446': { rowNumber: 445, numChildren: 2 },
    '449': { rowNumber: 448, numChildren: 2 },
    '452': { rowNumber: 451, numChildren: 2 },
    '455': { rowNumber: 454, numChildren: 2 },
    '458': { rowNumber: 457, numChildren: 2 },
    '461': { rowNumber: 460, numChildren: 2 },
    '464': { rowNumber: 463, numChildren: 12 },
    '465': { rowNumber: 464, numChildren: 2 },
    '468': { rowNumber: 467, numChildren: 2 },
    '471': { rowNumber: 470, numChildren: 2 },
    '474': { rowNumber: 473, numChildren: 2 },
  },
  meta_event_nested_uuid: {},
  event_processing_finished: true,
  is_tree: true,
};
