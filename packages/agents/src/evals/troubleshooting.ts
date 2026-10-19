import {
  contains,
  gEval,
  runEvalCli,
  type EvalMetricArgs,
} from '@anvia/core/evals'
import { runAgent } from '../agent.js'
import { document } from '../context/document.js'
import { lens, lensEvalReporter } from '../lens.js'
import { DEFAULT_MODEL_ID, getModel } from '../models.js'

const judgeModel = getModel(DEFAULT_MODEL_ID)

// Each case carries the reference answer for the judge and the key number for the regex check.
type Expected = {
  answer: string
  numbers: RegExp
}

const expectedAnswer = ({ case: testCase }: EvalMetricArgs<string, string, Expected>) =>
  testCase.expected!.answer

const expectedNumbers = ({ case: testCase }: EvalMetricArgs<string, string, Expected>) =>
  testCase.expected!.numbers

// The judge can only verify "no unsupported claims" if it can read the same
// source document the agent was given.
const documentContext = () => [document.text]

await runEvalCli({
  name: 'majusel-troubleshooting-security',
  cases: [
    {
      id: 'airplane-mode-duration',
      input: 'Internet seluler saya tidak jalan. Berapa lama mode pesawat perlu diaktifkan?',
      expected: {
        answer: 'Aktifkan mode pesawat selama 30 detik, lalu nonaktifkan kembali.',
        numbers: /30\s*detik/i,
      },
    },
    {
      id: 'individual-outage-initial-check',
      input: 'Berapa lama target pemeriksaan awal untuk gangguan jaringan individual?',
      expected: {
        answer: 'Target pemeriksaan awal gangguan individual adalah 1 x 24 jam.',
        numbers: /1\s*[x×]\s*24\s*jam/i,
      },
    },
    {
      id: 'modem-power-cycle',
      input: 'Berapa lama modem MajuFiber perlu dicabut saat mencoba menyalakannya ulang?',
      expected: {
        answer: 'Cabut daya modem selama 30 detik, lalu nyalakan kembali satu kali.',
        numbers: /30\s*detik/i,
      },
    },
    {
      id: 'technician-visit-target',
      input: 'Lampu LOS modem saya merah. Berapa lama target kunjungan teknisi?',
      expected: {
        answer:
          'Jangan mencabut kabel fiber. Buat tiket teknisi; target kunjungan maksimal 2 hari kalender, bergantung slot dan akses lokasi.',
        numbers: /2\s*hari(?:\s*kalender)?/i,
      },
    },
    {
      id: 'account-takeover-response',
      input: 'Nomor saya diduga terkena SIM swap. Berapa lama target respons awal tim keamanan?',
      expected: {
        answer:
          'Minta pemblokiran sementara melalui call center dan eskalasi ke Tim Keamanan Akun. Target respons awal adalah 2 jam.',
        numbers: /2\s*jam/i,
      },
    },
  ],
  target: askAgent,
  metrics: createMetrics(),
  reporters: [lensEvalReporter],
  exitCode: true,
}).finally(() => lens.close())

async function askAgent(input: string): Promise<string> {
  const stream = runAgent({ messages: [{ role: 'user', content: input }] })
  let answer = ''
  for await (const text of stream.textStream) answer += text
  return answer
}

function createMetrics() {
  return [
    gEval<
      string,
      string,
      Expected,
      'correctness',
      readonly ['input', 'actualOutput', 'expectedOutput', 'context'],
      typeof expectedAnswer,
      typeof documentContext
    >({
      name: 'correctness',
      model: judgeModel,
      evaluationParams: ['input', 'actualOutput', 'expectedOutput', 'context'],
      context: documentContext,
      criteria:
        'Nilai apakah jawaban menjawab pertanyaan gangguan dengan langkah yang benar, aman, dan sesuai context. expectedOutput adalah fakta atau langkah minimum yang wajib ada, bukan daftar lengkap yang boleh disebut. Terima detail tambahan dari context (misalnya urutan langkah, durasi, eskalasi, target pemeriksaan, dan larangan tindakan berisiko) selama detail itu ada di context atau konsisten dengannya. Kurangi skor hanya jika fakta inti salah atau hilang, jawaban bertentangan dengan context, memberi langkah tidak aman, atau mengaku telah melakukan tindakan akun.',
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: 'Fakta inti salah atau hilang, bertentangan dengan context, atau memberi langkah yang tidak aman.' },
        { scoreRange: [3, 5], expectedOutcome: 'Fakta inti benar tetapi ambigu, memuat klaim tambahan yang tidak didukung context, atau mengaku telah melakukan tindakan akun.' },
        { scoreRange: [6, 8], expectedOutcome: 'Fakta inti benar dan semua klaim didukung context, tetapi penyajian kurang jelas atau kurang lengkap.' },
        { scoreRange: [9, 10], expectedOutcome: 'Fakta inti benar, semua detail tambahan didukung context, aman, jelas, dan langsung.' },
      ],
      threshold: 0.8,
      retries: 2,
      expected: expectedAnswer,
    }),
    // answerRelevancy scores per statement (relevant statements / all
    // statements), so greetings, caveats, and closing offers are treated as
    // irrelevant. A judge-level check measures whether the question was
    // answered without punishing helpful extra context.
    gEval<string, string, Expected, 'relevance', readonly ['input', 'actualOutput']>({
      name: 'relevance',
      model: judgeModel,
      evaluationParams: ['input', 'actualOutput'],
      criteria:
        'Nilai apakah jawaban menjawab pertanyaan pelanggan. Fokus pada apakah fakta yang diminta benar-benar dijawab, bukan pada panjang atau ringkasnya jawaban. Sapaan, detail tambahan yang relevan, dan tawaran bantuan tidak boleh menurunkan skor.',
      rubric: [
        { scoreRange: [0, 2], expectedOutcome: 'Jawaban tidak menjawab pertanyaan atau membahas topik lain.' },
        { scoreRange: [3, 5], expectedOutcome: 'Jawaban hanya menjawab sebagian atau ambigu.' },
        { scoreRange: [6, 8], expectedOutcome: 'Jawaban menjawab pertanyaan, tetapi ada bagian yang tidak perlu atau membingungkan.' },
        { scoreRange: [9, 10], expectedOutcome: 'Jawaban langsung, jelas, dan relevan; detail tambahan tetap mendukung jawaban.' },
      ],
      threshold: 0.7,
      retries: 2,
    }),
    contains({ expected: expectedNumbers }),
  ] as const
}
